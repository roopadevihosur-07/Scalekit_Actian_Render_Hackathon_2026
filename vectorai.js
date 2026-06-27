/**
 * Actian VectorAI DB service layer for MediSync.
 * Handles embeddings, collection init, and CRUD for:
 *   - session notes (from Notion + manual)
 *   - patient history
 *   - schedule
 *   - conversations
 */

import { VectorAIClient, Field } from "@actian/vectorai-client";
import { pipeline } from "@xenova/transformers";
import "dotenv/config";

// ── Config ────────────────────────────────────────────────────────────
const VECTORAI_HOST = process.env.VECTORAI_HOST || "localhost:6574";
const EMBED_MODEL = "Xenova/all-MiniLM-L6-v2";
export const EMBED_DIM = 384;

export const COL = {
  NOTES: "medisync_notes",
  HISTORY: "medisync_history",
  SCHEDULE: "medisync_schedule",
  CONVERSATIONS: "medisync_conversations",
};

// ── Singleton client ──────────────────────────────────────────────────
let _client = null;
export function getClient() {
  if (!_client) _client = new VectorAIClient(VECTORAI_HOST);
  return _client;
}

// ── Embedding pipeline (lazy, cached) ────────────────────────────────
let _embedder = null;
let _embedderReady = false;

export async function warmEmbedder() {
  if (_embedderReady) return;
  console.log("[vectorai] Loading embedding model (first run downloads ~22 MB)…");
  _embedder = await pipeline("feature-extraction", EMBED_MODEL, { quantized: true });
  _embedderReady = true;
  console.log("[vectorai] Embedding model ready");
}

export async function embed(text) {
  if (!_embedder) await warmEmbedder();
  const out = await _embedder(String(text).slice(0, 512), {
    pooling: "mean",
    normalize: true,
  });
  return Array.from(out.data);
}

// ── ID helpers ────────────────────────────────────────────────────────
// VectorAI DB uses integer point IDs.
export function strToId(str) {
  let h = 5381;
  for (let i = 0; i < String(str).length; i++) {
    h = (Math.imul(h, 31) + String(str).charCodeAt(i)) >>> 0;
  }
  return h || 1; // guard against 0
}

export function uniqueId(prefix = "") {
  return strToId(`${prefix}-${Date.now()}-${Math.random()}`);
}

// ── Collection init (idempotent) ──────────────────────────────────────
export async function initCollections() {
  const c = getClient();
  const out = {};
  for (const name of Object.values(COL)) {
    try {
      await c.collections.create(name, {
        dimension: EMBED_DIM,
        distanceMetric: "COSINE",
      });
      out[name] = "created";
    } catch (e) {
      out[name] = e.message?.toLowerCase().includes("already") ||
        e.message?.toLowerCase().includes("exist")
        ? "already_exists"
        : `error: ${e.message}`;
    }
  }
  return out;
}

// ── Notes ─────────────────────────────────────────────────────────────

/**
 * Upsert a single note into medisync_notes.
 * @param {object} note
 * @param {string} note.id          - unique identifier (string or numeric)
 * @param {string} note.clinicianId
 * @param {string} [note.client]    - client pseudonym
 * @param {string} [note.type]      - observation | intervention | theme | plan | reflection
 * @param {string} note.text
 * @param {string} [note.date]
 * @param {string} [note.session]
 * @param {string} [note.source]    - manual | notion | conversation
 * @param {string} [note.notionUrl]
 */
export async function upsertNote(note) {
  const vector = await embed(note.text);
  await getClient().points.upsert(COL.NOTES, [{
    id: strToId(note.id ?? uniqueId("note")),
    vector,
    payload: {
      original_id: String(note.id ?? ""),
      clinician_id: note.clinicianId,
      client_name: note.client ?? "",
      type: note.type ?? "observation",
      text: note.text,
      date: note.date ?? new Date().toISOString().split("T")[0],
      session_id: note.session ?? "",
      source: note.source ?? "manual",
      notion_url: note.notionUrl ?? "",
    },
  }], { wait: true });
}

/**
 * Semantic search over notes, scoped to a clinician (and optionally a client).
 */
export async function searchNotes({ clinicianId, query, clientName, limit = 5 }) {
  const vector = await embed(query);
  let filter = new Field("clinician_id").eq(clinicianId);
  if (clientName) filter = filter.and(new Field("client_name").eq(clientName));
  const results = await getClient().points.search(COL.NOTES, vector, {
    limit,
    filter,
    withPayload: true,
  });
  return results.map((r) => ({ score: r.score, ...r.payload }));
}

// ── Patient history ───────────────────────────────────────────────────

export async function upsertHistory({ clinicianId, clientName, eventType, description, date }) {
  const vector = await embed(description);
  await getClient().points.upsert(COL.HISTORY, [{
    id: strToId(`${clinicianId}-${clientName}-${eventType}-${date ?? Date.now()}`),
    vector,
    payload: {
      clinician_id: clinicianId,
      client_name: clientName,
      event_type: eventType,
      description,
      date: date ?? new Date().toISOString().split("T")[0],
    },
  }], { wait: true });
}

export async function searchHistory({ clinicianId, clientName, query, limit = 5 }) {
  const vector = await embed(query);
  const filter = new Field("clinician_id").eq(clinicianId)
    .and(new Field("client_name").eq(clientName));
  const results = await getClient().points.search(COL.HISTORY, vector, {
    limit, filter, withPayload: true,
  });
  return results.map((r) => ({ score: r.score, ...r.payload }));
}

// ── Schedule ──────────────────────────────────────────────────────────

export async function upsertScheduleEntry({ clinicianId, clientName, date, time, duration, status, notes }) {
  const text = `Session with ${clientName} on ${date} at ${time}. ${notes ?? ""}`.trim();
  const vector = await embed(text);
  await getClient().points.upsert(COL.SCHEDULE, [{
    id: strToId(`${clinicianId}-${clientName}-${date}-${time}`),
    vector,
    payload: {
      clinician_id: clinicianId,
      client_name: clientName,
      date,
      time,
      duration: duration ?? "50 min",
      status: status ?? "scheduled",
      notes: notes ?? "",
    },
  }], { wait: true });
}

export async function searchSchedule({ clinicianId, query, limit = 10 }) {
  const vector = await embed(query);
  const filter = new Field("clinician_id").eq(clinicianId);
  const results = await getClient().points.search(COL.SCHEDULE, vector, {
    limit, filter, withPayload: true,
  });
  return results.map((r) => ({ score: r.score, ...r.payload }));
}

// ── Conversations ─────────────────────────────────────────────────────

export async function saveConversationTurn({ clinicianId, clientName, role, message, sessionId }) {
  const vector = await embed(message);
  await getClient().points.upsert(COL.CONVERSATIONS, [{
    id: uniqueId(`${clinicianId}-${clientName}-${role}`),
    vector,
    payload: {
      clinician_id: clinicianId,
      client_name: clientName,
      role,
      message,
      timestamp: new Date().toISOString(),
      session_id: sessionId ?? "",
    },
  }], { wait: true });
}

export async function searchConversations({ clinicianId, query, clientName, limit = 5 }) {
  const vector = await embed(query);
  let filter = new Field("clinician_id").eq(clinicianId);
  if (clientName) filter = filter.and(new Field("client_name").eq(clientName));
  const results = await getClient().points.search(COL.CONVERSATIONS, vector, {
    limit, filter, withPayload: true,
  });
  return results.map((r) => ({ score: r.score, ...r.payload }));
}
