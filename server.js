import express from "express";
import { ScalekitClient } from "@scalekit-sdk/node";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

// VectorAI DB service
import {
  getClient as getVAI,
  initCollections,
  upsertNote,
  searchNotes,
  upsertHistory,
  searchHistory,
  upsertScheduleEntry,
  searchSchedule,
  saveConversationTurn,
  searchConversations,
  warmEmbedder,
} from "./vectorai.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Scalekit AgentKit client (lazy) ──────────────────────────────────
let _sk = null;
function getSK() {
  if (_sk) return _sk;
  const { SCALEKIT_ENVIRONMENT_URL, SCALEKIT_CLIENT_ID, SCALEKIT_CLIENT_SECRET } = process.env;
  if (!SCALEKIT_ENVIRONMENT_URL || !SCALEKIT_CLIENT_ID || !SCALEKIT_CLIENT_SECRET)
    throw new Error("Missing SCALEKIT_* env vars");
  _sk = new ScalekitClient(SCALEKIT_ENVIRONMENT_URL, SCALEKIT_CLIENT_ID, SCALEKIT_CLIENT_SECRET);
  return _sk;
}

const isActive = (s) => s === 1 || s === "ACTIVE";

const app = express();
app.use(express.json());

// ── Notion / AgentKit routes ──────────────────────────────────────────

// Resolve connected account ID for a clinician.
// Priority: env var NOTION_ACCOUNT_{id} → identifier-based lookup
function getNotionAccountId(clinicianId) {
  const key = `NOTION_ACCOUNT_${clinicianId}`;
  return process.env[key] || null;
}

// Execute a Notion tool using connectedAccountId when available, else identifier
async function notionTool(toolName, clinicianId, toolInput) {
  const connectedAccountId = getNotionAccountId(clinicianId);
  return getSK().actions.executeTool(
    connectedAccountId
      ? { toolName, connectedAccountId, toolInput }
      : { toolName, identifier: clinicianId, toolInput },
  );
}

app.get("/api/notion/status/:clinicianId", async (req, res) => {
  const { clinicianId } = req.params;
  const connectedAccountId = getNotionAccountId(clinicianId);

  try {
    if (connectedAccountId) {
      // Use the known connected account ID directly
      const result = await getSK().actions.getConnectedAccount({ connectedAccountId });
      const account = result?.connectedAccount ?? result;
      return res.json({
        connected: isActive(account?.status),
        status: account?.status ?? "UNKNOWN",
        connectedAccountId,
      });
    }
    // Fall back to identifier-based lookup
    const result = await getSK().actions.getOrCreateConnectedAccount({
      connectionName: "notion",
      identifier: clinicianId,
    });
    const account = result?.connectedAccount ?? result;
    res.json({ connected: isActive(account?.status), status: account?.status ?? "UNKNOWN" });
  } catch (err) {
    const needsSetup = err.message?.includes("not_found") || err.message?.includes("connection not found");
    console.warn("[notion/status]", err.message);
    res.json({ connected: false, needsSetup, error: err.message });
  }
});

app.get("/api/notion/connect/:clinicianId", async (req, res) => {
  try {
    const { link } = await getSK().actions.getAuthorizationLink({
      connectionName: "notion",
      identifier: req.params.clinicianId,
    });
    res.json({ url: link });
  } catch (err) {
    const needsSetup = err.message?.includes("not_found") || err.message?.includes("connection not found");
    console.error("[notion/connect]", err.message);
    res.status(needsSetup ? 400 : 500).json({
      error: needsSetup
        ? "Notion connector not configured. Go to AgentKit → Connections → Create → Notion in your Scalekit dashboard."
        : err.message,
      needsSetup,
    });
  }
});

app.post("/api/notion/search", async (req, res) => {
  const { clinicianId, query = "", pageSize = 10 } = req.body;
  if (!clinicianId) return res.status(400).json({ error: "clinicianId required" });
  try {
    const result = await notionTool("notion_data_fetch", clinicianId, { query, page_size: pageSize });
    res.json({ results: result?.data?.results ?? [] });
  } catch (err) {
    console.error("[notion/search]", err.message);
    res.status(500).json({ error: err.message, results: [] });
  }
});

app.post("/api/notion/client-search", async (req, res) => {
  const { clinicianId, clientName, query = "" } = req.body;
  if (!clinicianId) return res.status(400).json({ error: "clinicianId required" });
  const searchQuery = [clientName, query].filter(Boolean).join(" ");
  try {
    const result = await notionTool("notion_data_fetch", clinicianId, { query: searchQuery, page_size: 8 });
    res.json({ results: result?.data?.results ?? [] });
  } catch (err) {
    console.error("[notion/client-search]", err.message);
    res.status(500).json({ error: err.message, results: [] });
  }
});

app.post("/api/notion/page", async (req, res) => {
  const { clinicianId, pageId } = req.body;
  if (!clinicianId || !pageId) return res.status(400).json({ error: "clinicianId + pageId required" });
  try {
    const result = await notionTool("notion_page_get", clinicianId, { page_id: pageId });
    res.json({ page: result?.data ?? null });
  } catch (err) {
    console.error("[notion/page]", err.message);
    res.status(500).json({ error: err.message, page: null });
  }
});

// ── Session note writer → Notion + VectorAI ──────────────────────────
// Notion "Notes" database ID (from the workspace)
const NOTION_NOTES_DB = "38c9c230-5494-803a-8d9e-ccf6372ce373";

app.post("/api/notion/save-note", async (req, res) => {
  const { clinicianId, clientName, noteType, text, sessionDate, sessionTime, sessionDuration } = req.body;
  if (!clinicianId || !text?.trim()) {
    return res.status(400).json({ error: "clinicianId + text required" });
  }

  const date = sessionDate || new Date().toISOString().split("T")[0];
  const sessionInfo = sessionTime ? ` · ${sessionTime}${sessionDuration ? ` (${sessionDuration})` : ""}` : "";
  const pageTitle = `${clientName ? clientName + " · " : ""}${noteType} · ${date}${sessionInfo}`;

  let notionUrl = null;
  let notionError = null;

  // 1. Save to Notion — create a new row/page in the Notes database
  try {
    const result = await notionTool("notion_page_create", clinicianId, {
      parentPageId: NOTION_NOTES_DB,
      properties: {
        Name: [{ type: "text", text: { content: pageTitle } }],
      },
      childBlocks: [text],
    });
    notionUrl = result?.data?.url ?? null;
  } catch (e1) {
    // Fallback: insert as a database row
    try {
      const result = await notionTool("notion_database_insert_row", clinicianId, {
        database_id: NOTION_NOTES_DB,
        properties: {
          Name: {
            title: [{ type: "text", text: { content: `${pageTitle}: ${text.slice(0, 100)}` } }],
          },
        },
      });
      notionUrl = result?.data?.url ?? null;
    } catch (e2) {
      notionError = e2.message;
      console.warn("[save-note] Notion save failed:", e2.message);
    }
  }

  // 2. Always save to VectorAI regardless of Notion outcome
  try {
    await upsertNote({
      id: `session-note-${clinicianId}-${Date.now()}`,
      clinicianId,
      client: clientName || null,
      type: noteType || "observation",
      text,
      date,
      source: "session",
      notionUrl: notionUrl ?? "",
      sessionTime: sessionTime || null,
      sessionDuration: sessionDuration || null,
    });
  } catch (e) {
    console.error("[save-note] VectorAI save failed:", e.message);
  }

  res.json({
    ok: true,
    notionUrl,
    notionError,
    savedTo: [notionUrl ? "notion" : null, "vectorai"].filter(Boolean),
  });
});

// ── VectorAI DB routes ────────────────────────────────────────────────

// Health check — verifies VectorAI DB is reachable
app.get("/api/vectorai/health", async (_req, res) => {
  try {
    const info = await getVAI().healthCheck();
    res.json({ ok: true, host: process.env.VECTORAI_HOST || "localhost:6574", info });
  } catch (err) {
    console.warn("[vectorai/health]", err.message);
    res.status(503).json({ ok: false, error: err.message });
  }
});

// Create all 4 collections (idempotent — safe to call multiple times)
app.post("/api/vectorai/init", async (_req, res) => {
  try {
    const results = await initCollections();
    res.json({ ok: true, collections: results });
  } catch (err) {
    console.error("[vectorai/init]", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ── Notes ────────────────────────────────────────────────────────────

// Bulk sync notes (seed data or Notion pages) into VectorAI
// Body: { clinicianId, notes: [{ id, client, type, text, date, session, source, notionUrl }] }
app.post("/api/vectorai/sync/notes", async (req, res) => {
  const { clinicianId, notes = [] } = req.body;
  if (!clinicianId) return res.status(400).json({ error: "clinicianId required" });
  if (!notes.length) return res.json({ ok: true, synced: 0 });
  try {
    // Process sequentially to avoid overwhelming the embedder
    let synced = 0;
    for (const note of notes) {
      await upsertNote({ ...note, clinicianId });
      synced++;
    }
    res.json({ ok: true, synced });
  } catch (err) {
    console.error("[vectorai/sync/notes]", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Helper: extract title from a Notion page or database row
function extractNotionTitle(obj) {
  // Top-level title array (databases, some pages)
  if (obj.title?.length) return obj.title[0]?.plain_text || "";
  // Properties: Name or title field (database rows)
  const props = obj.properties || {};
  for (const key of ["Name", "name", "Title", "title"]) {
    const val = props[key]?.title;
    if (Array.isArray(val) && val.length) return val[0]?.plain_text || "";
    if (val?.length) return val[0]?.plain_text || "";
  }
  return "";
}

// Helper: classify note type from its title
function classifyNoteType(title) {
  const lc = title.toLowerCase();
  if (lc.includes("plan") || lc.includes("goal") || lc.includes("follow")) return "plan";
  if (lc.includes("intervention") || lc.includes("technique")) return "intervention";
  if (lc.includes("theme") || lc.includes("pattern")) return "theme";
  if (lc.includes("reflect") || lc.includes("self")) return "reflection";
  return "observation";
}

// Sync Notion → VectorAI: handles workspace pages AND database rows
app.post("/api/vectorai/sync/notion", async (req, res) => {
  const { clinicianId } = req.body;
  if (!clinicianId) return res.status(400).json({ error: "clinicianId required" });
  try {
    const allItems = [];

    // 1. Fetch all top-level workspace content
    const searchResult = await notionTool("notion_data_fetch", clinicianId, { query: "", page_size: 50 });
    const topLevel = searchResult?.data?.results ?? [];

    for (const obj of topLevel) {
      if (obj.object === "database") {
        // 2. For each database, query all its rows
        try {
          const dbResult = await notionTool("notion_database_query", clinicianId, {
            database_id: obj.id,
            page_size: 100,
          });
          const rows = dbResult?.data?.results ?? [];
          for (const row of rows) {
            allItems.push({ ...row, _source_db: obj.title?.[0]?.plain_text || "Notes" });
          }
        } catch (e) {
          console.warn(`[sync/notion] DB query failed for ${obj.id}:`, e.message);
        }
      } else {
        allItems.push(obj);
      }
    }

    // 3. Deduplicate by Notion page ID, then upsert into VectorAI
    const seen = new Set();
    const unique = allItems.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });

    let synced = 0;
    const syncedIds = [];

    for (const item of unique) {
      const rawTitle = extractNotionTitle(item);
      if (!rawTitle) continue; // skip untitled rows

      const type = classifyNoteType(rawTitle);

      await upsertNote({
        id: item.id,
        clinicianId,
        client: null,       // client can be enriched later via search
        type,
        text: rawTitle,
        date: item.last_edited_time?.split("T")[0] || item.created_time?.split("T")[0],
        source: "notion",
        notionUrl: item.url,
      });
      syncedIds.push(rawTitle);
      synced++;
    }

    console.log(`[sync/notion] Synced ${synced} items for ${clinicianId}:`, syncedIds);
    res.json({ ok: true, synced, items: syncedIds });
  } catch (err) {
    console.error("[vectorai/sync/notion]", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Semantic search over notes
app.post("/api/vectorai/search/notes", async (req, res) => {
  const { clinicianId, query, clientName, limit = 5 } = req.body;
  if (!clinicianId || !query) return res.status(400).json({ error: "clinicianId + query required" });
  try {
    const results = await searchNotes({ clinicianId, query, clientName, limit });
    res.json({ results });
  } catch (err) {
    console.error("[vectorai/search/notes]", err.message);
    res.status(500).json({ error: err.message, results: [] });
  }
});

// ── Patient history ──────────────────────────────────────────────────

app.post("/api/vectorai/history/add", async (req, res) => {
  const { clinicianId, clientName, eventType, description, date } = req.body;
  if (!clinicianId || !clientName || !description)
    return res.status(400).json({ error: "clinicianId, clientName, description required" });
  try {
    await upsertHistory({ clinicianId, clientName, eventType, description, date });
    res.json({ ok: true });
  } catch (err) {
    console.error("[vectorai/history/add]", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post("/api/vectorai/history/search", async (req, res) => {
  const { clinicianId, clientName, query, limit = 5 } = req.body;
  try {
    const results = await searchHistory({ clinicianId, clientName, query, limit });
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message, results: [] });
  }
});

// ── Schedule ─────────────────────────────────────────────────────────

// Sync today's full schedule into VectorAI
app.post("/api/vectorai/sync/schedule", async (req, res) => {
  const { clinicianId, schedule = [] } = req.body;
  if (!clinicianId) return res.status(400).json({ error: "clinicianId required" });
  try {
    for (const entry of schedule) {
      await upsertScheduleEntry({ clinicianId, ...entry });
    }
    res.json({ ok: true, synced: schedule.length });
  } catch (err) {
    console.error("[vectorai/sync/schedule]", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post("/api/vectorai/search/schedule", async (req, res) => {
  const { clinicianId, query, limit = 10 } = req.body;
  try {
    const results = await searchSchedule({ clinicianId, query, limit });
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message, results: [] });
  }
});

// ── Conversations ─────────────────────────────────────────────────────

// Save a single chat turn (call after each agent exchange)
app.post("/api/vectorai/conversations/save", async (req, res) => {
  const { clinicianId, clientName, role, message, sessionId } = req.body;
  if (!clinicianId || !message) return res.status(400).json({ error: "clinicianId + message required" });
  try {
    await saveConversationTurn({ clinicianId, clientName, role, message, sessionId });
    res.json({ ok: true });
  } catch (err) {
    console.error("[vectorai/conversations/save]", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Semantic search over past conversations
app.post("/api/vectorai/conversations/search", async (req, res) => {
  const { clinicianId, query, clientName, limit = 5 } = req.body;
  try {
    const results = await searchConversations({ clinicianId, query, clientName, limit });
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message, results: [] });
  }
});

// ── Google Calendar connector routes ─────────────────────────────────

// Check if Google Calendar is connected
app.get("/api/calendar/status/:clinicianId", async (req, res) => {
  try {
    const result = await getSK().actions.getOrCreateConnectedAccount({
      connectionName: "googlecalendar",
      identifier: req.params.clinicianId,
    });
    const account = result?.connectedAccount ?? result;
    res.json({ connected: isActive(account?.status), status: account?.status ?? "UNKNOWN" });
  } catch (err) {
    const needsSetup = err.message?.includes("not_found") || err.message?.includes("connection not found");
    res.json({ connected: false, needsSetup, error: err.message });
  }
});

// Get OAuth URL to connect Google Calendar
app.get("/api/calendar/connect/:clinicianId", async (req, res) => {
  try {
    const { link } = await getSK().actions.getAuthorizationLink({
      connectionName: "googlecalendar",
      identifier: req.params.clinicianId,
    });
    res.json({ url: link });
  } catch (err) {
    const needsSetup = err.message?.includes("not_found") || err.message?.includes("connection not found");
    res.status(needsSetup ? 400 : 500).json({
      error: needsSetup
        ? "Google Calendar connector not configured. Go to AgentKit → Connections → Create → Google Calendar in Scalekit."
        : err.message,
      needsSetup,
    });
  }
});

// Fetch today's events from Google Calendar and sync to VectorAI
app.post("/api/calendar/sync/:clinicianId", async (req, res) => {
  const { clinicianId } = req.params;
  const date = req.body.date || new Date().toISOString().split("T")[0];

  try {
    const timeMin = `${date}T00:00:00Z`;
    const timeMax = `${date}T23:59:59Z`;

    const result = await getSK().actions.executeTool({
      toolName: "googlecalendar_list_events",
      identifier: clinicianId,
      toolInput: {
        time_min: timeMin,
        time_max: timeMax,
        max_results: 20,
        single_events: true,
        order_by: "startTime",
      },
    });

    const events = result?.data?.items ?? result?.data?.events ?? [];
    const synced = [];

    for (const ev of events) {
      const startTime = ev.start?.dateTime || ev.start?.date || "";
      const endTime = ev.end?.dateTime || ev.end?.date || "";
      const summary = ev.summary || "Untitled event";
      const time = startTime ? new Date(startTime).toTimeString().slice(0, 5) : "";

      // Compute duration in minutes
      let duration = "50 min";
      if (startTime && endTime) {
        const mins = Math.round((new Date(endTime) - new Date(startTime)) / 60000);
        duration = `${mins} min`;
      }

      const attendees = (ev.attendees || []).map((a) => a.email).filter(Boolean);

      // Extract patient name from event summary heuristically
      const clientName = extractClientName(summary);

      const entry = {
        clinicianId,
        clientName,
        date,
        time,
        duration,
        status: ev.status === "cancelled" ? "cancelled" : "scheduled",
        notes: `Google Calendar · ${summary}${attendees.length ? ` · ${attendees.join(", ")}` : ""}`,
        eventId: ev.id,
        summary,
        attendees,
      };

      await upsertScheduleEntry(entry);
      synced.push(entry);
    }

    res.json({ ok: true, synced: synced.length, events: synced });
  } catch (err) {
    console.error("[calendar/sync]", err.message);
    res.status(500).json({ ok: false, error: err.message, events: [] });
  }
});

// Return today's schedule from VectorAI (pre-synced from calendar)
app.get("/api/calendar/today/:clinicianId", async (req, res) => {
  try {
    const results = await searchSchedule({
      clinicianId: req.params.clinicianId,
      query: "session appointment today",
      limit: 20,
    });
    // Sort by time
    results.sort((a, b) => (a.time || "").localeCompare(b.time || ""));
    res.json({ events: results });
  } catch (err) {
    res.status(500).json({ error: err.message, events: [] });
  }
});

// Seed dummy Google Calendar data for demo purposes (no OAuth needed)
const DEMO_CALENDAR = {
  u_chen_8c3a: [
    {
      clientName: "Maya",
      time: "10:00", duration: "50 min", date: "2026-06-27",
      status: "scheduled",
      notes: "Google Calendar · Session with Maya · maya@clinic-demo.com",
      summary: "Session with Maya",
      attendees: ["maya@clinic-demo.com", "dr.chen@medisync-demo.com"],
    },
    {
      clientName: "James",
      time: "11:30", duration: "50 min", date: "2026-06-27",
      status: "scheduled",
      notes: "Google Calendar · Session with James · james@clinic-demo.com",
      summary: "Session with James",
      attendees: ["james@clinic-demo.com", "dr.chen@medisync-demo.com"],
    },
    {
      clientName: "Sam",
      time: "14:00", duration: "50 min", date: "2026-06-27",
      status: "scheduled",
      notes: "Google Calendar · Session with Sam · sam@clinic-demo.com",
      summary: "Session with Sam",
      attendees: ["sam@clinic-demo.com", "dr.chen@medisync-demo.com"],
    },
  ],
  u_patel_2f91: [
    {
      clientName: "Theo",
      time: "09:00", duration: "50 min", date: "2026-06-27",
      status: "scheduled",
      notes: "Google Calendar · Session with Theo · theo@clinic-demo.com",
      summary: "Session with Theo",
      attendees: ["theo@clinic-demo.com", "dr.patel@medisync-demo.com"],
    },
    {
      clientName: "Maya",
      time: "11:00", duration: "50 min", date: "2026-06-27",
      status: "scheduled",
      notes: "Google Calendar · Session with Maya · maya-p@clinic-demo.com",
      summary: "Session with Maya",
      attendees: ["maya-p@clinic-demo.com", "dr.patel@medisync-demo.com"],
    },
    {
      clientName: "Rosa",
      time: "13:30", duration: "50 min", date: "2026-06-27",
      status: "scheduled",
      notes: "Google Calendar · Session with Rosa · rosa@clinic-demo.com",
      summary: "Session with Rosa",
      attendees: ["rosa@clinic-demo.com", "dr.patel@medisync-demo.com"],
    },
  ],
};

app.post("/api/calendar/seed/:clinicianId", async (req, res) => {
  const { clinicianId } = req.params;
  const events = DEMO_CALENDAR[clinicianId];
  if (!events) return res.status(404).json({ error: "No demo data for this clinician" });

  try {
    for (const ev of events) {
      await upsertScheduleEntry({ clinicianId, ...ev });
    }
    res.json({ ok: true, seeded: events.length, events });
  } catch (err) {
    console.error("[calendar/seed]", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ── Pre-session brief generation ──────────────────────────────────────

function extractClientName(eventSummary) {
  const s = (eventSummary || "").trim();
  // Common therapy event patterns
  const patterns = [
    /session with (.+)/i,
    /therapy[:\s-]+(.+)/i,
    /appt[\s-]+(.+)/i,
    /(.+?)\s*[-–]\s*therapy/i,
    /(.+?)\s*[-–]\s*session/i,
    /(.+?)\s+session/i,
  ];
  for (const p of patterns) {
    const m = s.match(p);
    if (m) return m[1].trim();
  }
  // If no pattern, use the whole summary as the name
  return s;
}

// Generate a comprehensive pre-session brief for a given client
app.post("/api/brief/generate", async (req, res) => {
  const { clinicianId, clientName, sessionTime, notionConnected } = req.body;
  if (!clinicianId || !clientName) {
    return res.status(400).json({ error: "clinicianId and clientName required" });
  }

  try {
    // 1. Pull all notes for this client from VectorAI (broad semantic search)
    const allNotes = await searchNotes({
      clinicianId,
      query: `${clientName} session therapy notes observations themes`,
      clientName,
      limit: 20,
    });

    // 2. Categorize by type
    const byType = {
      theme: allNotes.filter((n) => n.type === "theme"),
      observation: allNotes.filter((n) => n.type === "observation"),
      intervention: allNotes.filter((n) => n.type === "intervention"),
      plan: allNotes.filter((n) => n.type === "plan"),
      reflection: allNotes.filter((n) => n.type === "reflection"),
    };

    // 3. Pull past conversation context
    const pastConversations = await searchConversations({
      clinicianId,
      query: clientName,
      clientName,
      limit: 5,
    });

    // 4. Pull Notion pages if connected
    let notionNotes = [];
    if (notionConnected) {
      try {
        const notionResult = await notionTool("notion_data_fetch", clinicianId, { query: clientName, page_size: 5 });
        notionNotes = (notionResult?.data?.results ?? []).map((p) => ({
          title: p.properties?.title?.title?.[0]?.plain_text ||
            p.properties?.Name?.title?.[0]?.plain_text || "Untitled",
          url: p.url,
          edited: p.last_edited_time?.split("T")[0],
        }));
      } catch (_) { /* Notion not available, skip */ }
    }

    // 5. Determine the last session date
    const dates = allNotes.map((n) => n.date).filter(Boolean).sort().reverse();
    const lastSessionDate = dates[0] || null;

    // 6. Build the brief response
    res.json({
      client: clientName,
      sessionTime,
      totalNotes: allNotes.length,
      lastSessionDate,
      sections: {
        themes: byType.theme.slice(0, 3).map((n) => n.text),
        observations: byType.observation.slice(0, 3).map((n) => n.text),
        interventions: byType.intervention.slice(0, 2).map((n) => n.text),
        followUps: byType.plan.map((n) => n.text),
        reflections: byType.reflection.map((n) => n.text),
      },
      notionNotes,
      recentConversations: pastConversations.slice(0, 3).map((c) => ({
        role: c.role,
        message: c.message?.slice(0, 120),
        timestamp: c.timestamp,
      })),
    });
  } catch (err) {
    console.error("[brief/generate]", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Serve built frontend in production ────────────────────────────────
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "dist")));
  app.get(/^(?!\/api).*/, (_req, res) =>
    res.sendFile(path.join(__dirname, "dist", "index.html")),
  );
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log(`MediSync server → http://localhost:${PORT}`);
  // Pre-warm the embedding model so first sync is fast
  warmEmbedder().catch((e) => console.warn("[vectorai] Embedder warm-up failed:", e.message));
});

process.on("unhandledRejection", (r) => console.error("[unhandledRejection]", r?.message ?? r));
