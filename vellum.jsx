import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Lock,
  ShieldCheck,
  ArrowRight,
  Search,
  Trash2,
  Send,
  Sparkles,
  Eye,
  Calendar,
  Users,
  BookOpen,
  Activity,
  ChevronRight,
  Circle,
  Square,
  X,
  Check,
  Clock,
  FileText,
  AlertCircle,
} from "lucide-react";

// ──────────────────────────────────────────────────────────────────────
// Glass / lavender design tokens
// ──────────────────────────────────────────────────────────────────────

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap";

const tokens = {
  bg: "#EAE3FF",
  bgDeep: "rgba(167, 139, 250, 0.18)",
  surface: "rgba(255, 255, 255, 0.5)",
  glass: "rgba(255, 255, 255, 0.45)",
  glassBorder: "rgba(255, 255, 255, 0.65)",
  glassDeep: "rgba(255, 255, 255, 0.7)",
  ink: "#1A0A3C",
  inkSoft: "#4C3575",
  inkMute: "#9B8EC4",
  hairline: "rgba(139, 92, 246, 0.22)",
  hairlineSoft: "rgba(167, 139, 250, 0.14)",
  warn: "#F43F5E",
  good: "#059669",
  rootGradient:
    "linear-gradient(135deg, #EDE9FF 0%, #DDD4FF 30%, #E8D5FF 60%, #EDE0FF 100%)",
};

const glassMixin = {
  background: tokens.glass,
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: `1px solid ${tokens.glassBorder}`,
  boxShadow: "0 8px 32px rgba(109, 40, 217, 0.1), inset 0 1px 0 rgba(255,255,255,0.8)",
};

const glassDeepMixin = {
  background: tokens.glassDeep,
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: `1px solid rgba(255, 255, 255, 0.75)`,
  boxShadow: "0 8px 40px rgba(109, 40, 217, 0.14), inset 0 1px 0 rgba(255,255,255,0.9)",
};

const identities = {
  chen: {
    id: "u_chen_8c3a",
    name: "Dr. Maya Chen",
    title: "Licensed Psychotherapist",
    initials: "MC",
    accent: "#7C3AED",
    accentSoft: "rgba(237, 233, 254, 0.65)",
    accentGlow: "rgba(124, 58, 237, 0.3)",
    pronoun: "she",
  },
  patel: {
    id: "u_patel_2f91",
    name: "Dr. Arjun Patel",
    title: "Clinical Psychologist",
    initials: "AP",
    accent: "#EC4899",
    accentSoft: "rgba(252, 231, 243, 0.65)",
    accentGlow: "rgba(236, 72, 153, 0.3)",
    pronoun: "he",
  },
};

// ──────────────────────────────────────────────────────────────────────
// Seed data — memory fragments per therapist
// ──────────────────────────────────────────────────────────────────────

const seedMemories = {
  u_chen_8c3a: [
    {
      id: "m_c_001",
      client: "Maya",
      type: "observation",
      text: "Maya describes her mother's voicemails as 'a weather system' — she notices her shoulders tightening before opening the app.",
      tags: ["family", "somatic", "boundaries"],
      date: "2026-06-20",
      session: "s_4421",
    },
    {
      id: "m_c_002",
      client: "Maya",
      type: "intervention",
      text: "Introduced the 'reading the room before reading the message' practice. Maya tried it twice this week and reported a softer landing.",
      tags: ["intervention", "homework"],
      date: "2026-06-20",
      session: "s_4421",
    },
    {
      id: "m_c_003",
      client: "Maya",
      type: "theme",
      text: "Pattern across last three sessions: Maya frames her own needs as 'demands' when describing them to her mother, but as 'questions' when describing them to her partner.",
      tags: ["language", "relational"],
      date: "2026-06-13",
      session: "s_4302",
    },
    {
      id: "m_c_004",
      client: "Maya",
      type: "plan",
      text: "Next session: revisit the dream about the locked kitchen. Maya wanted to return to it.",
      tags: ["dreams", "follow-up"],
      date: "2026-06-20",
      session: "s_4421",
    },
    {
      id: "m_c_005",
      client: "Maya",
      type: "observation",
      text: "Sleep has been steadier since reducing evening calls with her mother. Three nights of full sleep this week — first time in two months.",
      tags: ["sleep", "progress"],
      date: "2026-06-20",
      session: "s_4421",
    },
    {
      id: "m_c_010",
      client: "James",
      type: "observation",
      text: "James used the phrase 'small ceiling' to describe how he experiences performance reviews. Worth returning to that image.",
      tags: ["metaphor", "work"],
      date: "2026-06-18",
      session: "s_4380",
    },
    {
      id: "m_c_011",
      client: "James",
      type: "intervention",
      text: "Tried orienting James to the body before discussing the review. He noticed jaw tension he hadn't named before.",
      tags: ["somatic", "intervention"],
      date: "2026-06-18",
      session: "s_4380",
    },
    {
      id: "m_c_012",
      client: "James",
      type: "plan",
      text: "James wants to bring in his manager's email next session and read it together.",
      tags: ["follow-up", "homework"],
      date: "2026-06-18",
      session: "s_4380",
    },
    {
      id: "m_c_020",
      client: "Sam",
      type: "theme",
      text: "Sam keeps returning to the question of who they were before college, but with curiosity rather than longing. The frame is shifting.",
      tags: ["identity", "developmental"],
      date: "2026-06-15",
      session: "s_4350",
    },
    {
      id: "m_c_021",
      client: "Sam",
      type: "observation",
      text: "Sam laughed for the first time in a session today — at their own description of their old bedroom posters.",
      tags: ["affect", "milestone"],
      date: "2026-06-15",
      session: "s_4350",
    },
    {
      id: "m_c_030",
      client: null,
      type: "reflection",
      text: "Noticing my own pull toward giving advice with James. Worth bringing to supervision.",
      tags: ["countertransference", "self"],
      date: "2026-06-19",
      session: null,
    },
  ],

  u_patel_2f91: [
    {
      id: "m_p_001",
      client: "Maya",
      type: "observation",
      text: "Maya (14M) mentioned that lunch period is the hardest part of the day. He's been eating in the library.",
      tags: ["school", "social-anxiety"],
      date: "2026-06-22",
      session: "s_8801",
    },
    {
      id: "m_p_002",
      client: "Maya",
      type: "intervention",
      text: "Drew the 'social temperature' scale together. Maya rated cafeteria as 9, library as 3, art class as 4.",
      tags: ["psychoeducation", "youth"],
      date: "2026-06-22",
      session: "s_8801",
    },
    {
      id: "m_p_003",
      client: "Maya",
      type: "theme",
      text: "Maya softens noticeably when discussing his older sister. She's been his bridge to articulating feelings he can't yet name to peers.",
      tags: ["family", "support-system"],
      date: "2026-06-15",
      session: "s_8740",
    },
    {
      id: "m_p_004",
      client: "Maya",
      type: "plan",
      text: "Parents requested update — coordinate with mother about gradual cafeteria exposure plan. Maya consented to a high-level summary only.",
      tags: ["family-coordination", "consent"],
      date: "2026-06-22",
      session: "s_8801",
    },
    {
      id: "m_p_005",
      client: "Maya",
      type: "observation",
      text: "Maya brought a notebook with sketches today — first time bringing anything from outside. Significant.",
      tags: ["engagement", "milestone"],
      date: "2026-06-22",
      session: "s_8801",
    },
    {
      id: "m_p_010",
      client: "Rosa",
      type: "observation",
      text: "Rosa described grief as 'the room you walk into every morning' — she's stopped trying to leave the room.",
      tags: ["grief", "metaphor"],
      date: "2026-06-19",
      session: "s_8770",
    },
    {
      id: "m_p_011",
      client: "Rosa",
      type: "theme",
      text: "Rosa's relationship with her late husband is becoming more nuanced in retrospect — she's beginning to name disappointments she couldn't while he was alive.",
      tags: ["grief", "complicated-grief"],
      date: "2026-06-19",
      session: "s_8770",
    },
    {
      id: "m_p_012",
      client: "Rosa",
      type: "plan",
      text: "Rosa wants to write a letter she'll never send. We discussed structure but not content.",
      tags: ["intervention", "homework"],
      date: "2026-06-19",
      session: "s_8770",
    },
    {
      id: "m_p_020",
      client: "Theo",
      type: "intervention",
      text: "Continued ERP hierarchy work. Theo completed exposure 4 of 7 this week without ritual response.",
      tags: ["ERP", "OCD", "progress"],
      date: "2026-06-21",
      session: "s_8790",
    },
    {
      id: "m_p_021",
      client: "Theo",
      type: "observation",
      text: "Theo is starting to describe the OCD voice as 'the salesman' — a useful externalization he came to on his own.",
      tags: ["externalization", "language"],
      date: "2026-06-21",
      session: "s_8790",
    },
    {
      id: "m_p_030",
      client: null,
      type: "reflection",
      text: "Noticing how much my work with Maya is shaped by my own adolescence — useful, but worth watching the edges.",
      tags: ["countertransference", "self"],
      date: "2026-06-22",
      session: null,
    },
  ],
};

const clientDirectory = {
  u_chen_8c3a: [
    { name: "Maya", note: "Adult — family, sleep" },
    { name: "James", note: "Adult — work anxiety" },
    { name: "Sam", note: "Young adult — identity" },
  ],
  u_patel_2f91: [
    { name: "Maya", note: "Adolescent — social anxiety" },
    { name: "Rosa", note: "Adult — grief" },
    { name: "Theo", note: "Adult — OCD / ERP" },
  ],
};

const todaysSchedule = {
  u_chen_8c3a: [
    { time: "10:00", client: "Maya", duration: "50 min" },
    { time: "11:30", client: "James", duration: "50 min" },
    { time: "14:00", client: "Sam", duration: "50 min" },
  ],
  u_patel_2f91: [
    { time: "09:00", client: "Theo", duration: "50 min" },
    { time: "11:00", client: "Maya", duration: "50 min" },
    { time: "13:30", client: "Rosa", duration: "50 min" },
  ],
};

// ──────────────────────────────────────────────────────────────────────
// Retrieval logic (unchanged)
// ──────────────────────────────────────────────────────────────────────

function retrieveMemories(userId, query, clientFilter = null, k = 4) {
  const all = seedMemories[userId] || [];
  const q = query.toLowerCase();
  const terms = q.split(/\s+/).filter((t) => t.length > 2);

  const scored = all
    .filter((m) => !clientFilter || m.client === clientFilter)
    .map((m) => {
      const hay = (m.text + " " + (m.tags || []).join(" ") + " " + (m.client || "")).toLowerCase();
      let score = 0;
      terms.forEach((t) => {
        if (hay.includes(t)) score += 2;
      });
      if (clientFilter && m.client === clientFilter) score += 1;
      const age = (Date.parse("2026-06-23") - Date.parse(m.date)) / 86400000;
      score += Math.max(0, 5 - age) * 0.1;
      return { m, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);

  return scored.map((x) => x.m);
}

function composeAgentReply(userId, query, retrieved) {
  if (retrieved.length === 0) {
    return {
      text: "I don't have anything in your memory that matches this. If you'd like, capture a note after your next session and I'll begin to build context.",
      retrieved: [],
    };
  }

  const clients = [...new Set(retrieved.map((r) => r.client).filter(Boolean))];
  const opener =
    clients.length === 1
      ? `Here's what's in your memory about ${clients[0]}:`
      : clients.length > 1
        ? `Drawing from your notes across ${clients.join(", ")}:`
        : `From your reflections:`;

  const lines = retrieved.slice(0, 3).map((r) => {
    const date = new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `• ${r.text} (${date})`;
  });

  const tail = retrieved.find((r) => r.type === "plan")
    ? "\n\nYou had a follow-up noted — worth revisiting at the top of session."
    : "";

  return {
    text: `${opener}\n\n${lines.join("\n")}${tail}`,
    retrieved,
  };
}

function useAuditLog() {
  const [log, setLog] = useState([]);
  const push = (entry) =>
    setLog((l) => [{ ...entry, at: new Date() }, ...l].slice(0, 50));
  return { log, push };
}

// ──────────────────────────────────────────────────────────────────────
// Notion AgentKit hook — wraps all /api/notion/* calls
// ──────────────────────────────────────────────────────────────────────

function useNotion(clinicianId) {
  const [connected, setConnected] = useState(null); // null=loading, true/false
  const [needsSetup, setNeedsSetup] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // Check Notion connection status on mount / clinician change
  useEffect(() => {
    if (!clinicianId) return;
    setConnected(null);
    setNeedsSetup(false);
    fetch(`/api/notion/status/${clinicianId}`)
      .then((r) => r.json())
      .then((d) => { setConnected(d.connected); setNeedsSetup(!!d.needsSetup); })
      .catch(() => setConnected(false));
  }, [clinicianId]);

  // Redirect user to Scalekit's Notion OAuth flow
  const connectNotion = async () => {
    setConnecting(true);
    try {
      const r = await fetch(`/api/notion/connect/${clinicianId}`);
      const { url, error } = await r.json();
      if (error) throw new Error(error);
      window.location.href = url; // Scalekit handles Notion OAuth + redirect back
    } catch (e) {
      console.error("Notion connect error:", e.message);
      setConnecting(false);
    }
  };

  // Search the therapist's Notion workspace
  const searchNotion = async (query, pageSize = 8) => {
    const r = await fetch("/api/notion/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clinicianId, query, pageSize }),
    });
    const { results = [], error } = await r.json();
    if (error) console.warn("Notion search error:", error);
    return results;
  };

  // Search Notion scoped to a specific client name
  const searchForClient = async (clientName, query = "") => {
    const r = await fetch("/api/notion/client-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clinicianId, clientName, query }),
    });
    const { results = [], error } = await r.json();
    if (error) console.warn("Notion client-search error:", error);
    return results;
  };

  return { connected, needsSetup, connecting, connectNotion, searchNotion, searchForClient };
}

// Transform a raw Notion page object into the app's memory shape
function notionPageToMemory(page) {
  const titleProp =
    page.properties?.title?.title?.[0]?.plain_text ||
    page.properties?.Name?.title?.[0]?.plain_text ||
    page.properties?.name?.title?.[0]?.plain_text ||
    "Untitled";

  // Try to derive type from the page title or a property
  const lowerTitle = titleProp.toLowerCase();
  const type = lowerTitle.includes("plan") ? "plan"
    : lowerTitle.includes("intervention") ? "intervention"
    : lowerTitle.includes("theme") ? "theme"
    : lowerTitle.includes("reflect") ? "reflection"
    : "observation";

  const editedDate = page.last_edited_time?.split("T")[0] ||
    new Date().toISOString().split("T")[0];

  return {
    id: page.id,
    client: null, // caller can enrich this
    type,
    text: titleProp,
    tags: [],
    date: editedDate,
    session: null,
    notionUrl: page.url,
    notionRaw: page,
  };
}

// ──────────────────────────────────────────────────────────────────────
// Actian VectorAI DB hook — wraps all /api/vectorai/* calls
// ──────────────────────────────────────────────────────────────────────

function useVectorAI(clinicianId) {
  const [vaiStatus, setVaiStatus] = useState(null); // null=unknown, true=ok, false=down
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  // Check VectorAI DB health on mount
  useEffect(() => {
    fetch("/api/vectorai/health")
      .then((r) => r.json())
      .then((d) => setVaiStatus(d.ok))
      .catch(() => setVaiStatus(false));
  }, []);

  // Init all 4 collections, then sync seed notes + schedule
  const initAndSync = async (seedNotes, schedule) => {
    setSyncing(true);
    setSyncResult(null);
    try {
      // 1. Create collections
      await fetch("/api/vectorai/init", { method: "POST" });

      // 2. Sync seed notes
      const noteRes = await fetch("/api/vectorai/sync/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinicianId, notes: seedNotes }),
      });
      const { synced: notesSynced } = await noteRes.json();

      // 3. Sync schedule
      const schedRes = await fetch("/api/vectorai/sync/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinicianId, schedule }),
      });
      const { synced: scheduleSynced } = await schedRes.json();

      setSyncResult({ ok: true, notesSynced, scheduleSynced });
      setVaiStatus(true);
    } catch (e) {
      setSyncResult({ ok: false, error: e.message });
    } finally {
      setSyncing(false);
    }
  };

  // Sync Notion pages into VectorAI (if Notion is connected)
  const syncFromNotion = async () => {
    setSyncing(true);
    try {
      const r = await fetch("/api/vectorai/sync/notion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinicianId }),
      });
      const d = await r.json();
      setSyncResult({ ok: d.ok, notionSynced: d.synced, error: d.error });
    } catch (e) {
      setSyncResult({ ok: false, error: e.message });
    } finally {
      setSyncing(false);
    }
  };

  // Vector semantic search over notes
  const vectorSearch = async (query, clientName, limit = 5) => {
    const r = await fetch("/api/vectorai/search/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clinicianId, query, clientName, limit }),
    });
    const { results = [] } = await r.json();
    return results;
  };

  // Save a conversation turn to VectorAI
  const saveConversation = async (clientName, role, message) => {
    await fetch("/api/vectorai/conversations/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clinicianId, clientName, role, message }),
    }).catch(() => {}); // fire-and-forget, don't block UI
  };

  return { vaiStatus, syncing, syncResult, initAndSync, syncFromNotion, vectorSearch, saveConversation };
}

// ──────────────────────────────────────────────────────────────────────
// Google Calendar hook via Scalekit AgentKit
// ──────────────────────────────────────────────────────────────────────

function useCalendar(clinicianId) {
  const [calStatus, setCalStatus] = useState(null); // null=loading
  const [calNeedsSetup, setCalNeedsSetup] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!clinicianId) return;
    fetch(`/api/calendar/status/${clinicianId}`)
      .then((r) => r.json())
      .then((d) => { setCalStatus(d.connected); setCalNeedsSetup(!!d.needsSetup); })
      .catch(() => setCalStatus(false));
  }, [clinicianId]);

  // Fetch today's cached schedule from VectorAI
  useEffect(() => {
    if (!clinicianId) return;
    fetch(`/api/calendar/today/${clinicianId}`)
      .then((r) => r.json())
      .then((d) => setEvents(d.events ?? []))
      .catch(() => {});
  }, [clinicianId]);

  const connectCalendar = async () => {
    setConnecting(true);
    try {
      const r = await fetch(`/api/calendar/connect/${clinicianId}`);
      const { url, error } = await r.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch (e) {
      console.error("Calendar connect:", e.message);
      setConnecting(false);
    }
  };

  const syncCalendar = async () => {
    setSyncing(true);
    try {
      const r = await fetch(`/api/calendar/sync/${clinicianId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: new Date().toISOString().split("T")[0] }),
      });
      const d = await r.json();
      if (d.events?.length) setEvents(d.events);
      return d;
    } catch (e) {
      console.error("Calendar sync:", e.message);
    } finally {
      setSyncing(false);
    }
  };

  const seedDemoCalendar = async () => {
    setSeeding(true);
    try {
      const r = await fetch(`/api/calendar/seed/${clinicianId}`, { method: "POST" });
      const d = await r.json();
      if (d.ok) {
        setEvents(d.events);
        setCalStatus("demo"); // mark as demo mode
      }
    } catch (e) {
      console.error("Calendar seed:", e.message);
    } finally {
      setSeeding(false);
    }
  };

  return { calStatus, calNeedsSetup, connecting, syncing, seeding, events, connectCalendar, syncCalendar, seedDemoCalendar };
}

// ──────────────────────────────────────────────────────────────────────
// PRE-SESSION BRIEF — fullscreen glass overlay with countdown timer
// ──────────────────────────────────────────────────────────────────────

function PreSessionBrief({ identity, session, brief, onDismiss }) {
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [loading, setLoading] = useState(!brief);

  // Countdown timer
  useEffect(() => {
    if (!session?.time) return;
    const tick = () => {
      const [h, m] = session.time.split(":").map(Number);
      const now = new Date();
      const target = new Date();
      target.setHours(h, m, 0, 0);
      setSecondsLeft(Math.max(0, Math.round((target - now) / 1000)));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [session?.time]);

  const formatCountdown = (s) => {
    if (s === null) return "";
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  const urgencyColor = secondsLeft !== null && secondsLeft < 120
    ? "#F43F5E"
    : secondsLeft !== null && secondsLeft < 300
    ? "#F59E0B"
    : identity.accent;

  if (!brief && !loading) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      background: "rgba(20, 10, 50, 0.75)",
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      overflowY: "auto",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 820,
        background: "rgba(255,255,255,0.55)",
        backdropFilter: "blur(32px)",
        WebkitBackdropFilter: "blur(32px)",
        border: `1px solid rgba(255,255,255,0.75)`,
        borderRadius: 20,
        boxShadow: `0 24px 80px rgba(0,0,0,0.3), 0 0 0 1px ${identity.accent}22`,
        overflow: "hidden",
      }}>
        {/* Header bar */}
        <div style={{
          background: `linear-gradient(135deg, ${identity.accent}ee, ${identity.accent}99)`,
          padding: "20px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: "rgba(255,255,255,0.7)", letterSpacing: 1.5, textTransform: "uppercase" }}>
              Pre-session brief · {identity.name}
            </div>
            <div style={{ fontFamily: "Instrument Serif, serif", fontSize: 32, color: "white", marginTop: 4, lineHeight: 1.1 }}>
              {brief?.client || session?.client}
            </div>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 4 }}>
              {session?.time} · {session?.duration}
              {brief?.totalNotes ? ` · ${brief.totalNotes} notes in memory` : ""}
              {brief?.lastSessionDate ? ` · last session ${brief.lastSessionDate}` : ""}
            </div>
          </div>
          {/* Countdown */}
          <div style={{ textAlign: "right" }}>
            <div style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 36,
              fontWeight: 700,
              color: secondsLeft !== null && secondsLeft < 120 ? "#FFE4E7" : "rgba(255,255,255,0.95)",
              letterSpacing: -1,
            }}>
              {secondsLeft !== null ? formatCountdown(secondsLeft) : "--:--"}
            </div>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>
              until session
            </div>
          </div>
        </div>

        {/* Body */}
        {!brief ? (
          <div style={{ padding: 48, textAlign: "center", fontFamily: "Inter, sans-serif", fontSize: 14, color: tokens.inkMute }}>
            Pulling notes from VectorAI DB…
          </div>
        ) : (
          <div style={{ padding: "28px 32px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

            {/* Follow-ups — most important, full width */}
            {brief.sections?.followUps?.length > 0 && (
              <div style={{ gridColumn: "1 / -1" }}>
                <BriefSection
                  label="Follow-up from last session"
                  items={brief.sections.followUps}
                  accent="#F43F5E"
                  icon="📌"
                  highlighted
                />
              </div>
            )}

            {/* Themes */}
            {brief.sections?.themes?.length > 0 && (
              <BriefSection
                label="Key themes"
                items={brief.sections.themes}
                accent={identity.accent}
                icon="🔁"
              />
            )}

            {/* Observations */}
            {brief.sections?.observations?.length > 0 && (
              <BriefSection
                label="Recent observations"
                items={brief.sections.observations}
                accent="#7C3AED"
                icon="👁"
              />
            )}

            {/* Interventions */}
            {brief.sections?.interventions?.length > 0 && (
              <BriefSection
                label="Interventions that worked"
                items={brief.sections.interventions}
                accent="#059669"
                icon="✓"
              />
            )}

            {/* Reflections */}
            {brief.sections?.reflections?.length > 0 && (
              <BriefSection
                label="Your reflections"
                items={brief.sections.reflections}
                accent="#9B8EC4"
                icon="🪞"
              />
            )}

            {/* Notion notes */}
            {brief.notionNotes?.length > 0 && (
              <div>
                <BriefSection
                  label="From Notion"
                  items={brief.notionNotes.map((n) => n.title)}
                  accent="#059669"
                  icon="📝"
                />
              </div>
            )}

            {/* No notes at all */}
            {!brief.sections?.themes?.length &&
             !brief.sections?.observations?.length &&
             !brief.sections?.followUps?.length && (
              <div style={{ gridColumn: "1 / -1", padding: "24px 0", textAlign: "center" }}>
                <div style={{ fontFamily: "Instrument Serif, serif", fontStyle: "italic", fontSize: 18, color: tokens.inkMute }}>
                  No notes found yet for {brief.client}. Sync notes to VectorAI DB on the Dashboard to build the brief.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{
          padding: "20px 32px",
          borderTop: "1px solid rgba(0,0,0,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(255,255,255,0.4)",
        }}>
          <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: tokens.inkMute, letterSpacing: 0.4 }}>
            Source: VectorAI DB · user-{identity.id}-memories{brief?.notionNotes?.length ? " + Notion" : ""}
          </div>
          <button
            onClick={onDismiss}
            style={{
              padding: "12px 28px",
              background: `linear-gradient(135deg, ${identity.accent}ee, ${identity.accent}bb)`,
              color: "white",
              border: "none",
              borderRadius: 10,
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              fontSize: 14,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: `0 4px 18px ${identity.accentGlow}`,
            }}
          >
            I'm ready · Begin session <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function BriefSection({ label, items, accent, icon, highlighted = false }) {
  return (
    <div style={{
      padding: "16px 20px",
      background: highlighted ? `${accent}08` : "rgba(255,255,255,0.5)",
      border: `1px solid ${highlighted ? accent + "33" : "rgba(255,255,255,0.7)"}`,
      borderRadius: 12,
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        <span style={{
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 10,
          color: accent,
          letterSpacing: 1,
          textTransform: "uppercase",
          fontWeight: 600,
        }}>
          {label}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((text, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{
              width: 5, height: 5, borderRadius: "50%",
              background: accent, flexShrink: 0, marginTop: 6,
            }} />
            <span style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
              color: tokens.ink,
              lineHeight: 1.55,
            }}>
              {text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Notion connect banner (shown when Notion isn't linked yet) ────────
function NotionConnectBanner({ identity, connecting, needsSetup, onConnect }) {
  return (
    <div style={{
      padding: "20px 28px",
      background: needsSetup
        ? "rgba(251,191,36,0.08)"
        : `linear-gradient(135deg, ${identity.accent}12, ${identity.accent}06)`,
      border: needsSetup
        ? "1px dashed rgba(251,191,36,0.5)"
        : `1px dashed ${identity.accent}44`,
      borderRadius: 14,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 24,
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: "rgba(255,255,255,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, flexShrink: 0,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}>
          {needsSetup ? "⚙️" : "📝"}
        </div>
        <div>
          {needsSetup ? (
            <>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 600, color: tokens.ink }}>
                Notion connector not set up in Scalekit
              </div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: tokens.inkSoft, marginTop: 4, lineHeight: 1.5 }}>
                Go to your{" "}
                <a href="https://medisync.scalekit.dev" target="_blank" rel="noreferrer"
                  style={{ color: "#D97706", textDecoration: "underline" }}>
                  Scalekit dashboard
                </a>
                {" "}→ <strong>AgentKit → Connections → Create → Notion</strong>
                {" "}to configure the connector, then refresh this page.
              </div>
            </>
          ) : (
            <>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 600, color: tokens.ink }}>
                Connect your Notion workspace
              </div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: tokens.inkSoft, marginTop: 2 }}>
                Pull session notes directly from Notion via Scalekit AgentKit
              </div>
            </>
          )}
        </div>
      </div>
      {!needsSetup && (
        <button
          onClick={onConnect}
          disabled={connecting}
          style={{
            padding: "9px 20px",
            background: connecting ? `${identity.accent}66` : `linear-gradient(135deg, ${identity.accent}ee, ${identity.accent}bb)`,
            color: "white",
            border: "none",
            borderRadius: 9,
            cursor: connecting ? "not-allowed" : "pointer",
            fontFamily: "Inter, sans-serif",
            fontSize: 13,
            fontWeight: 600,
            whiteSpace: "nowrap",
            boxShadow: `0 4px 14px ${identity.accentGlow}`,
            display: "flex", alignItems: "center", gap: 6,
            flexShrink: 0,
          }}
        >
          {connecting ? "Redirecting…" : "Connect Notion"}
          {!connecting && <ArrowRight size={13} />}
        </button>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Glass UI atoms
// ──────────────────────────────────────────────────────────────────────

function Hairline({ vertical = false, className = "" }) {
  return (
    <div
      className={className}
      style={{
        background: tokens.hairline,
        ...(vertical
          ? { width: 1, height: "100%" }
          : { height: 1, width: "100%" }),
      }}
    />
  );
}

function IdentitySeal({ identity, size = "md" }) {
  const dims = size === "lg" ? 44 : size === "sm" ? 28 : 36;
  const fs = size === "lg" ? 14 : size === "sm" ? 10 : 12;
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          width: dims,
          height: dims,
          background: `linear-gradient(135deg, ${identity.accent}cc, ${identity.accent}88)`,
          color: "white",
          border: `1.5px solid rgba(255,255,255,0.7)`,
          boxShadow: `0 4px 14px ${identity.accentGlow}`,
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          fontFamily: "Instrument Serif, serif",
          fontSize: fs + 4,
          fontStyle: "italic",
        }}
      >
        {identity.initials}
      </div>
      {size !== "sm" && (
        <div className="leading-tight">
          <div
            style={{
              color: tokens.ink,
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {identity.name}
          </div>
          <div
            style={{
              color: tokens.inkMute,
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 10,
              letterSpacing: 0.4,
            }}
          >
            id · {identity.id}
          </div>
        </div>
      )}
    </div>
  );
}

function Eyebrow({ children, color }) {
  return (
    <div
      style={{
        fontFamily: "JetBrains Mono, monospace",
        fontSize: 10,
        letterSpacing: 1.4,
        textTransform: "uppercase",
        color: color || tokens.inkMute,
      }}
    >
      {children}
    </div>
  );
}

function Card({ children, className = "", style = {} }) {
  return (
    <div
      className={className}
      style={{
        ...glassMixin,
        borderRadius: 14,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Button({ children, onClick, variant = "primary", style = {}, identity }) {
  const base = {
    fontFamily: "Inter, sans-serif",
    fontSize: 13,
    fontWeight: 500,
    padding: "10px 18px",
    borderRadius: 10,
    cursor: "pointer",
    transition: "all 0.18s ease",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    border: "1px solid transparent",
  };
  const acc = identity?.accent || "#7C3AED";
  const glow = identity?.accentGlow || "rgba(124,58,237,0.3)";
  const variants = {
    primary: {
      background: `linear-gradient(135deg, ${acc}ee, ${acc}cc)`,
      color: "white",
      boxShadow: `0 4px 18px ${glow}`,
      border: `1px solid ${acc}55`,
    },
    ghost: {
      ...glassMixin,
      borderRadius: 10,
      color: tokens.ink,
    },
    text: {
      background: "transparent",
      color: acc,
      padding: "6px 0",
    },
  };
  return (
    <button onClick={onClick} style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

// ──────────────────────────────────────────────────────────────────────
// LOGIN PAGE
// ──────────────────────────────────────────────────────────────────────

function LoginPage({ onLogin }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: tokens.rootGradient,
        display: "grid",
        gridTemplateColumns: "1.1fr 1fr",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background orbs */}
      <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(167,139,250,0.35) 0%, transparent 70%)", top: -200, left: -100, pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%)", bottom: -150, right: -100, pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)", top: "50%", left: "40%", transform: "translateY(-50%)", pointerEvents: "none" }} />

      {/* Left — brand */}
      <div style={{ padding: "64px 72px", display: "flex", flexDirection: "column", justifyContent: "space-between", borderRight: `1px solid ${tokens.hairline}`, position: "relative", zIndex: 1 }}>
        <div>
          <div style={{ marginBottom: 64 }}>
            <div className="flex items-center gap-3">
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg, #7C3AED, #EC4899)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(124,58,237,0.35)" }}>
                <Square size={24} style={{ color: "white" }} strokeWidth={1.5} />
              </div>
              <span style={{ fontFamily: "Instrument Serif, serif", fontWeight: 500, fontSize: 48, letterSpacing: -0.8, color: tokens.ink }}>MediSync</span>
            </div>
          </div>

          <div style={{ fontFamily: "Instrument Serif, serif", fontSize: 56, lineHeight: 1.2, color: tokens.ink, maxWidth: 540, marginBottom: 12 }}>
            One scheduler.
          </div>
          <div style={{ fontFamily: "Instrument Serif, serif", fontSize: 56, lineHeight: 1.2, color: tokens.ink, maxWidth: 540, marginBottom: 40 }}>
            <span style={{ fontStyle: "italic", color: "#7C3AED" }}>Per-therapist</span> memory.
            <span style={{ fontStyle: "italic", color: "#EC4899" }}> Zero leakage.</span>
          </div>

          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 14, lineHeight: 1.7, color: tokens.inkSoft, maxWidth: 480 }}>
            MediSync runs a shared background scheduler across your practice. When it fires,
            each therapist gets their own calendar check, their own VectorAI memory lookup,
            and their own pre-session brief — separated by identity walls that make
            cross-clinician data access architecturally impossible.
          </div>
        </div>
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          <Eyebrow>Powered by</Eyebrow>
          <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: tokens.inkSoft, letterSpacing: 0.4 }}>
            Scalekit · Actian VectorAI · Render
          </div>
        </div>
      </div>

      {/* Right — clinician selector */}
      <div style={{ padding: "64px 72px", display: "flex", flexDirection: "column", justifyContent: "center", ...glassMixin, borderRadius: 0, borderLeft: "none", position: "relative", zIndex: 1 }}>
        <Eyebrow>Demo sign-in</Eyebrow>
        <div style={{ marginTop: 16, fontFamily: "Instrument Serif, serif", fontSize: 24, color: tokens.ink }}>
          Continue as a clinician
        </div>
        <div style={{ marginTop: 12, fontFamily: "Inter, sans-serif", fontSize: 13, color: tokens.inkSoft, maxWidth: 420, lineHeight: 1.6 }}>
          Two practitioners share this prototype practice. Each holds their own caseload — choose one to begin, or open split-screen demo mode.
        </div>

        <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 14 }}>
          {Object.values(identities).map((id) => (
            <button
              key={id.id}
              onClick={() => onLogin(id)}
              style={{ ...glassMixin, borderRadius: 14, padding: "20px 24px", cursor: "pointer", textAlign: "left", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "space-between" }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 8px 32px ${id.accentGlow}, inset 0 1px 0 rgba(255,255,255,0.9)`; e.currentTarget.style.borderColor = `${id.accent}55`; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = glassMixin.boxShadow; e.currentTarget.style.borderColor = tokens.glassBorder; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <IdentitySeal identity={id} />
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: tokens.inkSoft }}>{id.title}</div>
                <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: tokens.inkMute, marginTop: 4 }}>
                  {seedMemories[id.id].length} memories · {clientDirectory[id.id].length} clients
                </div>
              </div>
            </button>
          ))}
        </div>

        <div style={{ marginTop: 32, padding: "14px 18px", ...glassMixin, borderRadius: 10, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <AlertCircle size={13} style={{ color: tokens.inkMute, marginTop: 1, flexShrink: 0 }} />
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: tokens.inkSoft, lineHeight: 1.55 }}>
            Prototype. All client names are fictional pseudonyms. No real patient data is stored or transmitted.
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// TOP NAV
// ──────────────────────────────────────────────────────────────────────

function TopNav({ identity, page, setPage, onLogout }) {
  const items = [
    { k: "dash", label: "Today" },
    { k: "clients", label: "Caseload" },
    { k: "notes", label: "Session Notes" },
    { k: "memory", label: "Memory" },
    { k: "audit", label: "Audit" },
  ];
  return (
    <div
      style={{
        ...glassMixin,
        borderRadius: 0,
        borderLeft: "none",
        borderRight: "none",
        borderTop: "none",
        padding: "14px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div className="flex items-center gap-10">
        <div className="flex items-center gap-2">
          <div style={{
            width: 24, height: 24, borderRadius: 6,
            background: "linear-gradient(135deg, #7C3AED, #EC4899)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 3px 10px rgba(124,58,237,0.4)",
          }}>
            <Square size={10} style={{ color: "white" }} strokeWidth={2} />
          </div>
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: 13,
              letterSpacing: 0.3,
              color: tokens.ink,
            }}
          >
            MediSync
          </span>
        </div>
        <nav style={{ display: "flex", gap: 4 }}>
          {items.map((it) => (
            <button
              key={it.k}
              onClick={() => setPage(it.k)}
              style={{
                padding: "7px 14px",
                background: page === it.k
                  ? `linear-gradient(135deg, ${identity.accent}22, ${identity.accent}11)`
                  : "transparent",
                border: page === it.k
                  ? `1px solid ${identity.accent}33`
                  : "1px solid transparent",
                borderRadius: 8,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
                fontSize: 13,
                color: page === it.k ? identity.accent : tokens.inkMute,
                fontWeight: page === it.k ? 600 : 400,
                transition: "all 0.15s",
              }}
            >
              {it.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 12px",
            background: `linear-gradient(135deg, ${identity.accent}22, ${identity.accent}11)`,
            border: `1px solid ${identity.accent}33`,
            borderRadius: 20,
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <Lock size={10} style={{ color: identity.accent }} />
          <span
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 10,
              color: identity.accent,
              letterSpacing: 0.4,
            }}
          >
            sealed · {identity.id}
          </span>
        </div>
        <IdentitySeal identity={identity} size="sm" />
        <button
          onClick={onLogout}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
            fontSize: 12,
            color: tokens.inkMute,
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// DASHBOARD
// ──────────────────────────────────────────────────────────────────────

function DashboardPage({ identity, audit, setPage, setActiveClient }) {
  const schedule = todaysSchedule[identity.id];
  const memories = seedMemories[identity.id];
  const recent = memories.slice(0, 3);
  const reflections = memories.filter((m) => m.type === "reflection");

  // Compute next upcoming session
  const nowMins = new Date().getHours() * 60 + new Date().getMinutes();
  const nextSession =
    schedule.find((s) => {
      const [h, m] = s.time.split(":").map(Number);
      return h * 60 + m > nowMins;
    }) || schedule[0];
  const briefMemories = retrieveMemories(identity.id, nextSession.client, nextSession.client, 3);

  // Integrations
  const { connected, needsSetup, connecting, connectNotion, searchNotion } = useNotion(identity.id);
  const { vaiStatus, syncing, syncResult, initAndSync, syncFromNotion } = useVectorAI(identity.id);
  const {
    calStatus, calNeedsSetup, connecting: calConnecting, syncing: calSyncing,
    seeding: calSeeding, events: calEvents, connectCalendar, syncCalendar, seedDemoCalendar,
  } = useCalendar(identity.id);

  const [notionBriefing, setNotionBriefing] = useState([]);
  const [notionLoading, setNotionLoading] = useState(false);

  // Pre-session brief state
  const [briefSession, setBriefSession] = useState(null);   // which session triggered it
  const [briefData, setBriefData] = useState(null);         // the brief payload
  const [briefVisible, setBriefVisible] = useState(false);
  const [briefLoading, setBriefLoading] = useState(false);

  useEffect(() => {
    if (!connected) return;
    setNotionLoading(true);
    searchNotion(nextSession.client, 4)
      .then((pages) => setNotionBriefing(pages.map(notionPageToMemory)))
      .finally(() => setNotionLoading(false));
  }, [connected, nextSession.client]);

  const handleVAISync = () => {
    initAndSync(memories, schedule.map((s) => ({
      clientName: s.client,
      date: "2026-06-27",
      time: s.time,
      duration: s.duration,
    })));
  };

  // Fetch pre-session brief from server
  const openBrief = async (session) => {
    setBriefSession(session);
    setBriefVisible(true);
    setBriefData(null);
    setBriefLoading(true);
    try {
      const r = await fetch("/api/brief/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicianId: identity.id,
          clientName: session.client,
          sessionTime: session.time,
          notionConnected: connected,
        }),
      });
      const data = await r.json();
      setBriefData(data);
    } catch (e) {
      console.error("Brief fetch error:", e);
    } finally {
      setBriefLoading(false);
    }
  };

  // Auto-trigger brief when a session is ≤ 10 minutes away
  useEffect(() => {
    if (!vaiStatus) return; // only auto-trigger when VectorAI is connected
    const check = () => {
      const now = new Date();
      const currMins = now.getHours() * 60 + now.getMinutes();
      const upcoming = schedule.find((s) => {
        const [h, m] = s.time.split(":").map(Number);
        const sessionMins = h * 60 + m;
        return sessionMins > currMins && sessionMins - currMins <= 10;
      });
      if (upcoming && !briefVisible) {
        openBrief(upcoming);
      }
    };
    check();
    const id = setInterval(check, 30000); // re-check every 30 seconds
    return () => clearInterval(id);
  }, [vaiStatus, schedule, briefVisible]);

  return (
    <>
      {/* Pre-session brief overlay */}
      {briefVisible && (
        <PreSessionBrief
          identity={identity}
          session={briefSession}
          brief={briefLoading ? null : briefData}
          onDismiss={() => { setBriefVisible(false); setBriefData(null); }}
        />
      )}

    <div style={{ padding: "56px 72px", maxWidth: 1280, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <div>
          <Eyebrow>Saturday · June 27 · 2026</Eyebrow>
          <h1
            style={{
              fontFamily: "Instrument Serif, serif",
              fontSize: 56,
              color: tokens.ink,
              marginTop: 12,
              lineHeight: 1.05,
            }}
          >
            Good morning,{" "}
            <span style={{
              background: `linear-gradient(135deg, ${identity.accent}, #EC4899)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              {identity.name.split(" ").slice(-1)[0]}.
            </span>
          </h1>
          <div
            style={{
              marginTop: 14,
              fontFamily: "Inter, sans-serif",
              fontSize: 15,
              color: tokens.inkSoft,
              maxWidth: 540,
              lineHeight: 1.6,
            }}
          >
            Three sessions ahead. Your agent has been holding {memories.length} threads
            of your work — here's what feels alive.
          </div>
        </div>
      </div>

      {/* Notion connect banner */}
      {connected === false && (
        <div style={{ marginTop: 32 }}>
          <NotionConnectBanner
            identity={identity}
            connecting={connecting}
            needsSetup={needsSetup}
            onConnect={connectNotion}
          />
        </div>
      )}

      {/* Status row — Notion + VectorAI badges */}
      {(connected === true || vaiStatus !== null) && (
        <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          {connected === true && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: tokens.good, boxShadow: `0 0 6px ${tokens.good}88` }} />
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: tokens.good, letterSpacing: 0.5 }}>
                NOTION CONNECTED
              </span>
            </div>
          )}
          {vaiStatus === true && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#8B5CF6", boxShadow: "0 0 6px rgba(139,92,246,0.5)" }} />
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: "#8B5CF6", letterSpacing: 0.5 }}>
                VECTORAI DB CONNECTED
              </span>
            </div>
          )}
          {vaiStatus === false && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: tokens.inkMute }} />
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: tokens.inkMute, letterSpacing: 0.5 }}>
                VECTORAI DB OFFLINE
              </span>
            </div>
          )}
        </div>
      )}

      {/* VectorAI DB panel — sync + status */}
      <div style={{
        marginTop: 24,
        padding: "18px 24px",
        ...glassMixin,
        borderRadius: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 24,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: vaiStatus ? "linear-gradient(135deg, #7C3AED, #4F46E5)" : "rgba(139,92,246,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, flexShrink: 0,
            boxShadow: vaiStatus ? "0 4px 14px rgba(124,58,237,0.4)" : "none",
          }}>
            🗃️
          </div>
          <div>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 600, color: tokens.ink }}>
              Actian VectorAI DB
            </div>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: tokens.inkSoft, marginTop: 2 }}>
              {vaiStatus === null ? "Checking connection…"
                : vaiStatus ? `Storing notes, history, schedule & conversations as vectors`
                : "Not reachable — start Docker: docker run -p 6573:6573 -p 6574:6574 -p 6575:6575 actian/vectorai-db"}
            </div>
            {syncResult && (
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, marginTop: 4, color: syncResult.ok ? tokens.good : tokens.warn }}>
                {syncResult.ok
                  ? `✓ synced ${syncResult.notesSynced ?? 0} notes + ${syncResult.scheduleSynced ?? 0} schedule entries${syncResult.notionSynced != null ? ` + ${syncResult.notionSynced} Notion pages` : ""}`
                  : `✗ ${syncResult.error}`}
              </div>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          {vaiStatus && (
            <>
              <button
                onClick={handleVAISync}
                disabled={syncing}
                style={{
                  padding: "8px 16px",
                  background: syncing ? "rgba(124,58,237,0.3)" : "linear-gradient(135deg, #7C3AED, #4F46E5)",
                  color: "white", border: "none", borderRadius: 8,
                  cursor: syncing ? "not-allowed" : "pointer",
                  fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 600,
                  display: "flex", alignItems: "center", gap: 6,
                  boxShadow: syncing ? "none" : "0 4px 12px rgba(124,58,237,0.4)",
                }}
              >
                {syncing ? "Syncing…" : "Sync notes & schedule"}
              </button>
              {connected && (
                <button
                  onClick={syncFromNotion}
                  disabled={syncing}
                  style={{
                    padding: "8px 14px",
                    ...glassMixin, borderRadius: 8,
                    cursor: syncing ? "not-allowed" : "pointer",
                    fontFamily: "Inter, sans-serif", fontSize: 12, color: tokens.inkSoft,
                    border: `1px solid ${tokens.glassBorder}`,
                    display: "flex", alignItems: "center", gap: 5,
                  }}
                >
                  <span>📝</span> Sync from Notion
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Google Calendar panel */}
      <div style={{
        marginTop: 16,
        padding: "18px 24px",
        ...glassMixin,
        borderRadius: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 24,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: (calStatus === true || calStatus === "demo")
              ? "linear-gradient(135deg, #EA4335, #FBBC04)"
              : "rgba(234,67,53,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, flexShrink: 0,
            boxShadow: (calStatus === true || calStatus === "demo") ? "0 4px 14px rgba(234,67,53,0.35)" : "none",
          }}>📅</div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 600, color: tokens.ink }}>
                Google Calendar
              </div>
              {calStatus === "demo" && (
                <span style={{
                  fontFamily: "JetBrains Mono, monospace", fontSize: 9,
                  color: "#EA4335", background: "rgba(234,67,53,0.1)",
                  padding: "2px 7px", borderRadius: 4, letterSpacing: 0.5,
                }}>
                  DEMO
                </span>
              )}
            </div>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: tokens.inkSoft, marginTop: 2 }}>
              {calStatus === null ? "Loading…"
                : calStatus === true ? `Connected · ${calEvents.length} sessions synced`
                : calStatus === "demo" ? `Demo data · ${calEvents.length} sessions loaded from seed`
                : "Not connected — use demo data or connect Google Calendar"}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {/* Real calendar sync (when connected) */}
          {calStatus === true && (
            <button
              onClick={syncCalendar}
              disabled={calSyncing}
              style={{
                padding: "8px 16px",
                background: calSyncing ? "rgba(234,67,53,0.3)" : "linear-gradient(135deg, #EA4335, #FBBC04)",
                color: "white", border: "none", borderRadius: 8,
                cursor: calSyncing ? "not-allowed" : "pointer",
                fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 600,
                boxShadow: calSyncing ? "none" : "0 4px 12px rgba(234,67,53,0.35)",
              }}
            >
              {calSyncing ? "Syncing…" : "Sync today"}
            </button>
          )}

          {/* Seed demo data (when not connected) */}
          {(calStatus === false || calStatus === null || calNeedsSetup || calStatus === "demo") && (
            <button
              onClick={seedDemoCalendar}
              disabled={calSeeding}
              style={{
                padding: "8px 16px",
                background: calSeeding
                  ? "rgba(234,67,53,0.3)"
                  : "linear-gradient(135deg, #EA4335, #FBBC04)",
                color: "white", border: "none", borderRadius: 8,
                cursor: calSeeding ? "not-allowed" : "pointer",
                fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 600,
                boxShadow: "0 4px 12px rgba(234,67,53,0.35)",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              {calSeeding ? "Loading…" : calStatus === "demo" ? "🔄 Refresh demo" : "📅 Load demo schedule"}
            </button>
          )}

          {/* Connect real calendar */}
          {!calNeedsSetup && calStatus !== true && calStatus !== "demo" && (
            <button
              onClick={connectCalendar}
              disabled={calConnecting}
              style={{
                padding: "8px 14px",
                ...glassMixin, borderRadius: 8,
                cursor: calConnecting ? "not-allowed" : "pointer",
                fontFamily: "Inter, sans-serif", fontSize: 12,
                color: tokens.inkSoft,
              }}
            >
              {calConnecting ? "Redirecting…" : "Connect real calendar"}
            </button>
          )}
        </div>
      </div>

      {/* Calendar events list (when synced) */}
      {calEvents.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <Eyebrow>From Google Calendar · today</Eyebrow>
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
            {calEvents.map((ev, i) => (
              <div key={i} style={{
                padding: "10px 16px",
                ...glassMixin,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <span style={{ fontFamily: "Instrument Serif, serif", fontSize: 20, color: identity.accent, fontStyle: "italic" }}>
                    {ev.time || "—"}
                  </span>
                  <div>
                    <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 500, color: tokens.ink }}>
                      {ev.client_name || ev.summary || "Session"}
                    </div>
                    <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: tokens.inkMute, marginTop: 1 }}>
                      {ev.duration} · {ev.status}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => openBrief({ client: ev.client_name || ev.summary, time: ev.time, duration: ev.duration })}
                  style={{
                    padding: "6px 12px",
                    background: `${identity.accent}15`,
                    border: `1px solid ${identity.accent}33`,
                    borderRadius: 7,
                    cursor: "pointer",
                    fontFamily: "Inter, sans-serif",
                    fontSize: 11,
                    color: identity.accent,
                    fontWeight: 600,
                  }}
                >
                  Brief
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pre-session Briefing — from diagram's "Briefing → Dr. X" node */}
      <div
        style={{
          marginTop: 40,
          padding: "24px 32px",
          background: `linear-gradient(135deg, ${identity.accent}18, ${identity.accent}0a)`,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: `1px solid ${identity.accent}33`,
          borderRadius: 16,
          boxShadow: `0 4px 24px ${identity.accentGlow}`,
          display: "flex",
          gap: 32,
          alignItems: "flex-start",
        }}
      >
        <div style={{ minWidth: 200 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: identity.accent,
              boxShadow: `0 0 10px ${identity.accentGlow}`,
            }} />
            <Eyebrow color={identity.accent}>Pre-session brief</Eyebrow>
          </div>
          <div style={{
            marginTop: 10,
            fontFamily: "Instrument Serif, serif",
            fontSize: 32,
            color: tokens.ink,
            lineHeight: 1.1,
          }}>
            {nextSession.client}
          </div>
          <div style={{
            marginTop: 6,
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 11,
            color: identity.accent,
            letterSpacing: 0.4,
          }}>
            {nextSession.time} · {nextSession.duration}
          </div>
          <div style={{
            marginTop: 10,
            fontFamily: "Inter, sans-serif",
            fontSize: 11,
            color: tokens.inkMute,
            letterSpacing: 0.3,
          }}>
            {clientDirectory[identity.id].find((c) => c.name === nextSession.client)?.note}
          </div>
        </div>

        <div style={{ flex: 1, borderLeft: `1px solid ${identity.accent}22`, paddingLeft: 32 }}>
          {connected ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <Eyebrow color={tokens.inkMute}>From Notion · via Scalekit AgentKit</Eyebrow>
                <span style={{ fontSize: 14 }}>📝</span>
              </div>
              {notionLoading ? (
                <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: tokens.inkMute, letterSpacing: 0.4 }}>
                  Pulling from Notion…
                </div>
              ) : notionBriefing.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {notionBriefing.map((m) => (
                    <div key={m.id} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 9, color: identity.accent, background: `${identity.accent}15`, padding: "2px 6px", borderRadius: 3, marginTop: 2, whiteSpace: "nowrap", letterSpacing: 0.4, textTransform: "uppercase" }}>
                        {m.type}
                      </span>
                      <div>
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: tokens.ink, lineHeight: 1.5 }}>
                          {m.text}
                        </span>
                        {m.notionUrl && (
                          <a href={m.notionUrl} target="_blank" rel="noreferrer" style={{ display: "block", fontFamily: "JetBrains Mono, monospace", fontSize: 9, color: identity.accent, marginTop: 2, textDecoration: "none", letterSpacing: 0.3 }}>
                            Open in Notion ↗
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: tokens.inkMute, fontStyle: "italic" }}>
                  No Notion pages found for {nextSession.client}. Session notes you write will appear here once synced.
                </div>
              )}
            </>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <Eyebrow color={tokens.warn}>Notion not connected</Eyebrow>
              </div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: tokens.inkSoft, marginBottom: 12, lineHeight: 1.5 }}>
                Connect Notion (above) to search session notes you've written. Notes are saved automatically when you use Session Notes page.
              </div>
              <Eyebrow color={tokens.inkMute} style={{ marginTop: 16 }}>Fallback: Seed memory</Eyebrow>
              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                {briefMemories.length > 0 ? briefMemories.map((m) => (
                  <div key={m.id} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 9, color: identity.accent, background: `${identity.accent}15`, padding: "2px 6px", borderRadius: 3, marginTop: 2, whiteSpace: "nowrap", letterSpacing: 0.4, textTransform: "uppercase" }}>
                      {m.type}
                    </span>
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: tokens.ink, lineHeight: 1.5 }}>
                      {m.text}
                    </span>
                  </div>
                )) : (
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: tokens.inkMute, fontStyle: "italic" }}>
                    No seed memories available.
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <button
          onClick={() => { setActiveClient(nextSession.client); setPage("clients"); }}
          style={{
            alignSelf: "center",
            background: `linear-gradient(135deg, ${identity.accent}ee, ${identity.accent}bb)`,
            color: "white",
            border: "none",
            borderRadius: 10,
            padding: "10px 18px",
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
            fontSize: 12,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 6,
            whiteSpace: "nowrap",
            boxShadow: `0 4px 14px ${identity.accentGlow}`,
          }}
        >
          Open session <ChevronRight size={14} />
        </button>
        <button
          onClick={() => openBrief(nextSession)}
          style={{
            alignSelf: "center",
            padding: "10px 18px",
            ...glassMixin,
            borderRadius: 10,
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
            fontSize: 12,
            fontWeight: 600,
            color: identity.accent,
            border: `1px solid ${identity.accent}44`,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          📋 Read brief
        </button>
      </div>

      <div
        style={{
          marginTop: 56,
          display: "grid",
          gridTemplateColumns: "1.3fr 1fr",
          gap: 40,
        }}
      >
        {/* Schedule */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Eyebrow>Today's sessions</Eyebrow>
            <span
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 10,
                color: tokens.inkMute,
              }}
            >
              {schedule.length} scheduled
            </span>
          </div>
          <Card style={{ marginTop: 20, overflow: "hidden" }}>
            {schedule.map((s, i) => (
              <div key={i}>
                <button
                  onClick={() => {
                    setActiveClient(s.client);
                    setPage("clients");
                  }}
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: "20px 24px",
                    display: "grid",
                    gridTemplateColumns: "80px 1fr auto",
                    alignItems: "center",
                    gap: 24,
                    textAlign: "left",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${identity.accent}08`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <div
                    style={{
                      fontFamily: "Instrument Serif, serif",
                      fontSize: 28,
                      color: identity.accent,
                      fontStyle: "italic",
                    }}
                  >
                    {s.time}
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: 16,
                        color: tokens.ink,
                        fontWeight: 500,
                      }}
                    >
                      {s.client}
                    </div>
                    <div
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: 12,
                        color: tokens.inkMute,
                        marginTop: 2,
                      }}
                    >
                      {s.duration} ·{" "}
                      {clientDirectory[identity.id].find((c) => c.name === s.client)?.note}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); openBrief(s); }}
                      style={{
                        padding: "4px 10px",
                        background: `${identity.accent}15`,
                        border: `1px solid ${identity.accent}33`,
                        borderRadius: 6,
                        cursor: "pointer",
                        fontFamily: "Inter, sans-serif",
                        fontSize: 10,
                        fontWeight: 600,
                        color: identity.accent,
                        letterSpacing: 0.3,
                      }}
                    >
                      Brief
                    </button>
                    <ChevronRight size={16} style={{ color: tokens.inkMute }} />
                  </div>
                </button>
                {i < schedule.length - 1 && <Hairline />}
              </div>
            ))}
          </Card>
        </div>

        {/* Live from your memory */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Eyebrow>Live from your memory</Eyebrow>
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: 99,
                background: identity.accent,
                boxShadow: `0 0 8px ${identity.accentGlow}`,
                animation: "pulse 2s infinite",
              }}
            />
          </div>
          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>
            {recent.map((m) => (
              <Card key={m.id} style={{ padding: 18 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 10,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: 9,
                      letterSpacing: 0.5,
                      textTransform: "uppercase",
                      color: identity.accent,
                      background: `${identity.accent}15`,
                      padding: "2px 8px",
                      borderRadius: 4,
                    }}
                  >
                    {m.type}
                  </span>
                  {m.client && (
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: 11,
                        color: tokens.inkSoft,
                      }}
                    >
                      · {m.client}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 13,
                    color: tokens.ink,
                    lineHeight: 1.55,
                  }}
                >
                  {m.text}
                </div>
              </Card>
            ))}
          </div>

          {reflections.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <Eyebrow>Your own reflections</Eyebrow>
              <div style={{ marginTop: 16 }}>
                {reflections.map((r) => (
                  <Card
                    key={r.id}
                    style={{
                      borderLeft: `3px solid ${identity.accent}`,
                      padding: "12px 18px",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "Instrument Serif, serif",
                        fontStyle: "italic",
                        fontSize: 16,
                        color: tokens.inkSoft,
                        lineHeight: 1.45,
                      }}
                    >
                      {r.text}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────
// CLIENTS PAGE
// ──────────────────────────────────────────────────────────────────────

function ClientsPage({ identity, audit, activeClient, setActiveClient }) {
  const clients = clientDirectory[identity.id];
  const current = activeClient || clients[0].name;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", minHeight: "calc(100vh - 65px)" }}>
      {/* Sidebar */}
      <div
        style={{
          ...glassMixin,
          borderRadius: 0,
          borderTop: "none",
          borderLeft: "none",
          borderBottom: "none",
          padding: "40px 24px",
        }}
      >
        <Eyebrow>Caseload</Eyebrow>
        <div style={{ marginTop: 24 }}>
          {clients.map((c) => (
            <button
              key={c.name}
              onClick={() => setActiveClient(c.name)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "14px 16px",
                background: current === c.name
                  ? `linear-gradient(135deg, ${identity.accent}18, ${identity.accent}0a)`
                  : "transparent",
                border: current === c.name
                  ? `1px solid ${identity.accent}33`
                  : "1px solid transparent",
                borderRadius: 10,
                cursor: "pointer",
                marginBottom: 6,
                position: "relative",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                if (current !== c.name) {
                  e.currentTarget.style.background = `${identity.accent}0a`;
                }
              }}
              onMouseLeave={(e) => {
                if (current !== c.name) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              {current === c.name && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 10,
                    bottom: 10,
                    width: 3,
                    background: `linear-gradient(to bottom, ${identity.accent}, ${identity.accent}88)`,
                    borderRadius: "0 2px 2px 0",
                    boxShadow: `2px 0 8px ${identity.accentGlow}`,
                  }}
                />
              )}
              <div
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 14,
                  fontWeight: current === c.name ? 600 : 400,
                  color: current === c.name ? identity.accent : tokens.ink,
                }}
              >
                {c.name}
              </div>
              <div
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 11,
                  color: tokens.inkMute,
                  marginTop: 2,
                }}
              >
                {c.note}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat */}
      <ClientChat identity={identity} client={current} audit={audit} />
    </div>
  );
}

function ClientChat({ identity, client, audit }) {
  const clientNote = clientDirectory[identity.id].find((c) => c.name === client)?.note;
  const clientMemories = seedMemories[identity.id].filter((m) => m.client === client);

  const { connected, needsSetup, searchForClient } = useNotion(identity.id);
  const { vaiStatus, vectorSearch, saveConversation } = useVectorAI(identity.id);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const source = connected ? "Notion + seed memory" : `${clientMemories.length} seed memories`;
    setMessages([
      {
        role: "agent",
        text: connected
          ? `I'm connected to your Notion workspace. I'll search both Notion and seed memory for notes about ${client}. What would you like to explore?`
          : `I'm holding ${clientMemories.length} memories about ${client}. Connect Notion on the Memory page to pull live notes. What would you like to revisit?`,
      },
    ]);
  }, [client, identity.id, connected]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, thinking]);

  const send = async (override) => {
    const q = (override || input).trim();
    if (!q) return;
    setMessages((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setThinking(true);

    // Save the user turn to VectorAI (fire-and-forget)
    saveConversation(client, "user", q);

    const sources = [
      vaiStatus ? "vectorai" : null,
      connected ? "notion" : null,
      "seed",
    ].filter(Boolean).join(" + ");

    audit.push({
      kind: "retrieval",
      user: identity.id,
      collection: `${sources} · user-${identity.id}-memories`,
      query: q,
      filter: { client },
    });

    try {
      let vectorMems = [];
      let notionMems = [];

      // 1. VectorAI semantic search (highest priority when available)
      if (vaiStatus) {
        const vaiResults = await vectorSearch(q, client, 4);
        vectorMems = vaiResults.map((r) => ({
          id: r.original_id || String(Math.random()),
          client: r.client_name,
          type: r.type || "observation",
          text: r.text,
          date: r.date,
          session: r.session_id,
          tags: [],
          score: r.score,
          source: r.source || "vectorai",
          notionUrl: r.notion_url || null,
        }));
      }

      // 2. Notion search via AgentKit (when connected)
      if (connected) {
        const pages = await searchForClient(client, q);
        notionMems = pages.map(notionPageToMemory);
      }

      // 3. Seed keyword search (always as fallback)
      const seedMems = retrieveMemories(identity.id, q, client, 3);

      // Merge: VectorAI > Notion > seed, deduplicate by text
      const seen = new Set();
      const allRetrieved = [...vectorMems, ...notionMems, ...seedMems].filter((m) => {
        if (seen.has(m.text)) return false;
        seen.add(m.text);
        return true;
      });

      audit.push({
        kind: "assertion",
        user: identity.id,
        collection: `${sources} · user-${identity.id}-memories`,
        verified: allRetrieved.length,
        result: "PASS",
        source: `vectorai:${vectorMems.length} notion:${notionMems.length} seed:${seedMems.length}`,
      });

      // Compose reply
      let replyText;
      if (vectorMems.length > 0) {
        const vLines = vectorMems.slice(0, 3).map((m) =>
          `• [${(m.score * 100).toFixed(0)}% match] ${m.text}${m.notionUrl ? " ↗" : ""}`
        );
        replyText = `From VectorAI DB (semantic search):\n\n${vLines.join("\n")}`;
        if (notionMems.length > 0)
          replyText += `\n\nAlso from Notion: ${notionMems.slice(0, 2).map((m) => `• ${m.text}`).join("\n")}`;
        if (seedMems.length > 0)
          replyText += `\n\nFrom session notes: ${seedMems.slice(0, 2).map((m) => `• ${m.text}`).join("\n")}`;
      } else {
        const reply = composeAgentReply(identity.id, q, allRetrieved.length ? allRetrieved : seedMems);
        replyText = reply.text;
      }

      setMessages((m) => [...m, { role: "agent", text: replyText, retrieved: allRetrieved }]);

      // Save the agent reply to VectorAI too
      saveConversation(client, "agent", replyText);

    } catch (e) {
      console.error("send error:", e);
      const retrieved = retrieveMemories(identity.id, q, client, 4);
      const reply = composeAgentReply(identity.id, q, retrieved);
      setMessages((m) => [...m, { role: "agent", text: reply.text, retrieved: reply.retrieved }]);
    } finally {
      setThinking(false);
    }
  };

  const suggestions = [
    `What did we land on with ${client} last session?`,
    `Patterns I've noticed with ${client} this month`,
    `What was I planning to revisit?`,
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 65px)", background: "transparent" }}>
      {/* Client header */}
      <div
        style={{
          padding: "28px 56px 20px",
          borderBottom: `1px solid ${tokens.hairlineSoft}`,
          ...glassMixin,
          borderRadius: 0,
          borderLeft: "none",
          borderRight: "none",
          borderTop: "none",
        }}
      >
        <Eyebrow>Active client · pseudonym</Eyebrow>
        <div style={{ marginTop: 8, display: "flex", alignItems: "baseline", gap: 16 }}>
          <h2
            style={{
              fontFamily: "Instrument Serif, serif",
              fontSize: 40,
              background: `linear-gradient(135deg, ${identity.accent}, #EC4899)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {client}
          </h2>
          <span style={{ fontFamily: "Inter", fontSize: 13, color: tokens.inkMute }}>
            {clientNote}
          </span>
        </div>
      </div>

      {/* Chat thread */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "32px 56px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 28 }}>
          {messages.map((m, i) => (
            <ChatMessage key={i} message={m} identity={identity} />
          ))}
          {thinking && (
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <IdentitySeal identity={identity} size="sm" />
              <div
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: 11,
                  color: tokens.inkMute,
                  letterSpacing: 0.4,
                }}
              >
                searching your collection…
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div style={{
        borderTop: `1px solid ${tokens.hairlineSoft}`,
        padding: "20px 56px 28px",
        ...glassMixin,
        borderRadius: 0,
        borderLeft: "none",
        borderRight: "none",
        borderBottom: "none",
      }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          {messages.length <= 1 && (
            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => send(s)}
                  style={{
                    padding: "8px 14px",
                    ...glassMixin,
                    borderRadius: 20,
                    cursor: "pointer",
                    fontFamily: "Inter, sans-serif",
                    fontSize: 12,
                    color: tokens.inkSoft,
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = identity.accent;
                    e.currentTarget.style.borderColor = `${identity.accent}44`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = tokens.inkSoft;
                    e.currentTarget.style.borderColor = tokens.glassBorder;
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              ...glassMixin,
              borderRadius: 12,
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={`Ask your agent about ${client}…`}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                background: "transparent",
                fontFamily: "Inter, sans-serif",
                fontSize: 14,
                color: tokens.ink,
              }}
            />
            <button
              onClick={() => send()}
              style={{
                background: `linear-gradient(135deg, ${identity.accent}ee, ${identity.accent}bb)`,
                color: "white",
                border: "none",
                borderRadius: 8,
                padding: "8px 14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "Inter, sans-serif",
                fontSize: 12,
                fontWeight: 500,
                boxShadow: `0 4px 14px ${identity.accentGlow}`,
              }}
            >
              <Send size={12} />
              Ask
            </button>
          </div>
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}>
            <Lock size={10} style={{ color: tokens.inkMute }} />
            <span
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 10,
                color: tokens.inkMute,
                letterSpacing: 0.4,
              }}
            >
              query scoped to user-{identity.id}-memories · client={client}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatMessage({ message, identity }) {
  if (message.role === "user") {
    return (
      <div style={{ alignSelf: "flex-end", maxWidth: "70%" }}>
        <div
          style={{
            background: `linear-gradient(135deg, ${identity.accent}22, ${identity.accent}11)`,
            border: `1px solid ${identity.accent}33`,
            borderRadius: 14,
            borderBottomRightRadius: 4,
            padding: "14px 18px",
            fontFamily: "Inter, sans-serif",
            fontSize: 14,
            color: tokens.ink,
            lineHeight: 1.55,
          }}
        >
          {message.text}
        </div>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
      <IdentitySeal identity={identity} size="sm" />
      <div style={{ flex: 1 }}>
        <Card style={{ padding: "14px 18px", borderTopLeftRadius: 4 }}>
          <div
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 14,
              color: tokens.ink,
              lineHeight: 1.65,
              whiteSpace: "pre-wrap",
            }}
          >
            {message.text}
          </div>
          {message.retrieved && message.retrieved.length > 0 && (
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
              <Eyebrow>Citations from your memory</Eyebrow>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                {message.retrieved.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      padding: "4px 10px",
                      background: `${identity.accent}15`,
                      border: `1px solid ${identity.accent}33`,
                      borderRadius: 20,
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: 10,
                      color: identity.accent,
                    }}
                  >
                    {r.id} · {r.type}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// MEMORY PAGE
// ──────────────────────────────────────────────────────────────────────

function MemoryPage({ identity }) {
  const [memories, setMemories] = useState(seedMemories[identity.id]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [notionMemories, setNotionMemories] = useState([]);
  const [notionSearching, setNotionSearching] = useState(false);

  const { connected, needsSetup, connecting, connectNotion, searchNotion } = useNotion(identity.id);

  useEffect(() => {
    setMemories(seedMemories[identity.id]);
  }, [identity.id]);

  // When Notion connects or search changes, fetch from Notion
  useEffect(() => {
    if (!connected) { setNotionMemories([]); return; }
    setNotionSearching(true);
    searchNotion(search || "", 20)
      .then((pages) => setNotionMemories(pages.map(notionPageToMemory)))
      .finally(() => setNotionSearching(false));
  }, [connected, identity.id]);

  // Debounced Notion search
  useEffect(() => {
    if (!connected || !search) return;
    const t = setTimeout(() => {
      setNotionSearching(true);
      searchNotion(search, 20)
        .then((pages) => setNotionMemories(pages.map(notionPageToMemory)))
        .finally(() => setNotionSearching(false));
    }, 400);
    return () => clearTimeout(t);
  }, [search, connected]);

  // Merge seed + notion memories
  const allMemories = connected
    ? [...notionMemories, ...memories]
    : memories;

  const types = ["all", "observation", "intervention", "theme", "plan", "reflection"];
  const filtered = allMemories.filter((m) => {
    const matchesType = filterType === "all" || m.type === filterType;
    const matchesSearch =
      !search ||
      m.text.toLowerCase().includes(search.toLowerCase()) ||
      (m.client && m.client.toLowerCase().includes(search.toLowerCase())) ||
      (m.tags || []).join(" ").toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const remove = (id) => setMemories((m) => m.filter((x) => x.id !== id));

  return (
    <div style={{ padding: "56px 72px", maxWidth: 1280, margin: "0 auto" }}>
      {/* Notion banner */}
      {connected === false && (
        <div style={{ marginBottom: 40 }}>
          <NotionConnectBanner identity={identity} connecting={connecting} onConnect={connectNotion} />
        </div>
      )}

      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <div>
          <Eyebrow>Your memory{connected ? " · Notion + seed" : ""}</Eyebrow>
          <h1
            style={{
              fontFamily: "Instrument Serif, serif",
              fontSize: 56,
              color: tokens.ink,
              marginTop: 12,
              lineHeight: 1.05,
            }}
          >
            Everything I'm holding{" "}
            <span style={{
              background: `linear-gradient(135deg, ${identity.accent}, #EC4899)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>for you.</span>
          </h1>
          <div
            style={{
              marginTop: 14,
              fontFamily: "Inter, sans-serif",
              fontSize: 15,
              color: tokens.inkSoft,
              maxWidth: 580,
              lineHeight: 1.6,
            }}
          >
            This is your collection — every fragment your agent has written down, every
            note you can read, edit, or delete. Nothing here is visible to anyone else in
            the practice.
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{
            fontFamily: "Instrument Serif, serif",
            fontSize: 72,
            lineHeight: 1,
            background: `linear-gradient(135deg, ${identity.accent}, #EC4899)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            {allMemories.length}
          </div>
          <Eyebrow color={tokens.inkSoft}>
            fragments{connected ? ` · ${notionMemories.length} from Notion` : ""}
          </Eyebrow>
          <div
            style={{
              marginTop: 10,
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 10,
              color: tokens.inkMute,
              letterSpacing: 0.4,
            }}
          >
            collection · user-{identity.id}-memories
          </div>
        </div>
      </div>

      {/* Search + filter */}
      <div
        style={{
          marginTop: 48,
          display: "flex",
          gap: 16,
          alignItems: "center",
          paddingBottom: 24,
          borderBottom: `1px solid ${tokens.hairline}`,
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 16px",
            ...glassMixin,
            borderRadius: 12,
          }}
        >
          <Search size={14} style={{ color: tokens.inkMute }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your memory…"
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
              color: tokens.ink,
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              style={{
                padding: "8px 14px",
                background: filterType === t
                  ? `linear-gradient(135deg, ${identity.accent}22, ${identity.accent}11)`
                  : "rgba(255,255,255,0.3)",
                border: filterType === t
                  ? `1px solid ${identity.accent}44`
                  : `1px solid ${tokens.glassBorder}`,
                borderRadius: 20,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
                fontSize: 12,
                color: filterType === t ? identity.accent : tokens.inkSoft,
                textTransform: "capitalize",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                transition: "all 0.15s",
                fontWeight: filterType === t ? 600 : 400,
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Memory list */}
      <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map((m) => (
          <Card
            key={m.id}
            style={{
              padding: "24px 28px",
              display: "grid",
              gridTemplateColumns: "140px 1fr auto",
              gap: 32,
              alignItems: "flex-start",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: 10,
                  color: identity.accent,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                  background: `${identity.accent}15`,
                  display: "inline-block",
                  padding: "2px 8px",
                  borderRadius: 4,
                }}
              >
                {m.type}
              </div>
              <div
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 12,
                  color: tokens.inkMute,
                  marginTop: 8,
                }}
              >
                {new Date(m.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                })}
              </div>
              {m.client && (
                <div
                  style={{
                    marginTop: 4,
                    fontFamily: "Inter, sans-serif",
                    fontSize: 12,
                    color: tokens.inkSoft,
                    fontWeight: 500,
                  }}
                >
                  {m.client}
                </div>
              )}
            </div>

            <div>
              <div
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 15,
                  color: tokens.ink,
                  lineHeight: 1.6,
                }}
              >
                {m.text}
              </div>
              {m.tags && m.tags.length > 0 && (
                <div style={{ marginTop: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {m.tags.map((t) => (
                    <span
                      key={t}
                      style={{
                        fontFamily: "JetBrains Mono, monospace",
                        fontSize: 10,
                        color: tokens.inkMute,
                        letterSpacing: 0.3,
                        background: "rgba(139,92,246,0.08)",
                        padding: "2px 8px",
                        borderRadius: 4,
                      }}
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
              <div style={{ marginTop: 10, fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: tokens.inkMute }}>
                id · {m.id} {m.session && `· session ${m.session}`}
              </div>
              {m.notionUrl && (
                <a href={m.notionUrl} target="_blank" rel="noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 8, fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: identity.accent, textDecoration: "none", letterSpacing: 0.3 }}>
                  <span style={{ fontSize: 12 }}>📝</span> Open in Notion ↗
                </a>
              )}
            </div>

            {m.notionUrl ? (
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "rgba(5,150,105,0.08)", border: "1px solid rgba(5,150,105,0.2)", borderRadius: 8, fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: tokens.good }}>
                <span style={{ fontSize: 11 }}>📝</span> Notion
              </div>
            ) : (
              <button
                onClick={() => remove(m.id)}
                style={{ background: "rgba(244,63,94,0.08)", border: `1px solid rgba(244,63,94,0.2)`, borderRadius: 8, padding: "8px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "Inter, sans-serif", fontSize: 12, color: tokens.warn, transition: "all 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(244,63,94,0.15)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(244,63,94,0.08)"; }}
              >
                <Trash2 size={12} />
                Forget
              </button>
            )}
          </Card>
        ))}

        {filtered.length === 0 && (
          <Card
            style={{
              padding: 48,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "Instrument Serif, serif",
                fontStyle: "italic",
                fontSize: 20,
                color: tokens.inkMute,
              }}
            >
              Nothing matches that search in your memory.
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// AUDIT PAGE
// ──────────────────────────────────────────────────────────────────────

function AuditPage({ identity, audit }) {
  return (
    <div style={{ padding: "56px 72px", maxWidth: 1280, margin: "0 auto" }}>
      <Eyebrow>Isolation guarantees</Eyebrow>
      <h1
        style={{
          fontFamily: "Instrument Serif, serif",
          fontSize: 56,
          color: tokens.ink,
          marginTop: 12,
          lineHeight: 1.05,
          maxWidth: 720,
        }}
      >
        How we prove your memory{" "}
        <span style={{
          background: `linear-gradient(135deg, ${identity.accent}, #EC4899)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>stays yours.</span>
      </h1>
      <div
        style={{
          marginTop: 14,
          fontFamily: "Inter, sans-serif",
          fontSize: 15,
          color: tokens.inkSoft,
          maxWidth: 620,
          lineHeight: 1.6,
        }}
      >
        Three guarantees, in order of how cheap they are to violate. The third is the one
        that holds when everything else fails.
      </div>

      {/* Architecture diagram — matches the uploaded whiteboard */}
      <div style={{ marginTop: 56 }}>
        <Eyebrow>System architecture</Eyebrow>
        <p style={{ marginTop: 8, fontFamily: "Inter, sans-serif", fontSize: 14, color: tokens.inkSoft, lineHeight: 1.6, maxWidth: 620 }}>
          One shared scheduler loops over every active therapist. Each lane is fully isolated — a separate calendar check, a separate VectorAI collection, a separate briefing output.
        </p>

        {/* Shared scheduler top node */}
        <div style={{ marginTop: 32, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Card style={{
            padding: "14px 32px",
            textAlign: "center",
            borderRadius: 12,
            border: `1px solid ${tokens.hairline}`,
            maxWidth: 400,
            width: "100%",
          }}>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 15, fontWeight: 600, color: tokens.ink }}>
              Shared background scheduler
            </div>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: tokens.inkMute, marginTop: 4 }}>
              Loops over all active therapists
            </div>
          </Card>

          {/* Arrow down */}
          <div style={{ height: 28, width: 1, background: tokens.hairline, margin: "0 auto" }} />

          {/* Three-column lanes */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0, width: "100%", position: "relative" }}>
            {/* Identity wall labels */}
            <div style={{
              position: "absolute",
              left: "33.33%",
              top: 0, bottom: 0,
              width: 1,
              borderLeft: "2px dashed rgba(244,63,94,0.5)",
              zIndex: 2,
            }}>
              <span style={{
                position: "absolute", bottom: 0,
                left: 8,
                fontFamily: "Inter, sans-serif", fontSize: 11,
                color: "#F43F5E",
                letterSpacing: 0.3,
                whiteSpace: "nowrap",
              }}>identity wall</span>
            </div>
            <div style={{
              position: "absolute",
              left: "66.66%",
              top: 0, bottom: 0,
              width: 1,
              borderLeft: "2px dashed rgba(244,63,94,0.5)",
              zIndex: 2,
            }}>
              <span style={{
                position: "absolute", bottom: 0,
                left: 8,
                fontFamily: "Inter, sans-serif", fontSize: 11,
                color: "#F43F5E",
                letterSpacing: 0.3,
                whiteSpace: "nowrap",
              }}>identity wall</span>
            </div>

            {[
              { label: "Dr. A", token: "dr-a", accent: "#7C3AED", accentBg: "rgba(124,58,237,0.1)", brief: "Rita in 10 min" },
              { label: "Dr. B", token: "dr-b", accent: "#059669", accentBg: "rgba(5,150,105,0.1)", brief: "Marcus in 10 min" },
              { label: "Dr. C", token: "dr-c", accent: "#EC4899", accentBg: "rgba(236,72,153,0.1)", brief: "James in 10 min" },
            ].map((lane, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 16px", gap: 0 }}>
                {/* Doctor node */}
                <Card style={{
                  padding: "12px 20px",
                  textAlign: "center",
                  border: `1.5px solid ${lane.accent}44`,
                  background: lane.accentBg,
                  borderRadius: 12,
                  width: "100%",
                }}>
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 700, color: lane.accent }}>{lane.label}</div>
                  <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: lane.accent, opacity: 0.7, marginTop: 3 }}>token: {lane.token}</div>
                </Card>
                <div style={{ height: 20, width: 1, background: tokens.hairline }} />

                {/* Calendar check */}
                <Card style={{
                  padding: "10px 16px",
                  textAlign: "center",
                  border: `1px solid rgba(180,140,60,0.3)`,
                  background: "rgba(251,211,141,0.15)",
                  borderRadius: 10,
                  width: "100%",
                }}>
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, color: "#92400E" }}>Calendar check</div>
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "#B45309", marginTop: 2 }}>{lane.label}'s events only</div>
                </Card>
                <div style={{ height: 20, width: 1, background: tokens.hairline }} />

                {/* VectorAI DB */}
                <Card style={{
                  padding: "10px 16px",
                  textAlign: "center",
                  border: `1px solid rgba(124,58,237,0.3)`,
                  background: "rgba(167,139,250,0.12)",
                  borderRadius: 10,
                  width: "100%",
                }}>
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, color: "#5B21B6" }}>VectorAI DB</div>
                  <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: "#7C3AED", marginTop: 2 }}>user-{lane.token}-memories</div>
                </Card>
                <div style={{ height: 20, width: 1, background: tokens.hairline }} />

                {/* Briefing output */}
                <Card style={{
                  padding: "10px 16px",
                  textAlign: "center",
                  border: `1px solid rgba(5,150,105,0.3)`,
                  background: "rgba(167,243,208,0.15)",
                  borderRadius: 10,
                  width: "100%",
                }}>
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, color: "#065F46" }}>
                    Briefing → {lane.label}
                  </div>
                  <div style={{ fontFamily: "Instrument Serif, serif", fontStyle: "italic", fontSize: 13, color: "#059669", marginTop: 2 }}>
                    "{lane.brief}"
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Scale-out message from diagram bottom */}
        <div style={{
          marginTop: 32,
          padding: "16px 24px",
          background: "rgba(167,243,208,0.2)",
          border: "1px solid rgba(5,150,105,0.25)",
          borderRadius: 12,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          textAlign: "center",
          fontFamily: "Inter, sans-serif",
          fontSize: 14,
          color: "#065F46",
          lineHeight: 1.6,
        }}>
          Adding a new therapist = one new Scalekit user + one new VectorAI collection.{" "}
          <strong>Nothing else changes.</strong>
        </div>
      </div>

      <div style={{ marginTop: 56, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
        <GuaranteeCard
          n="01"
          title="Auth-bound collection naming"
          body="The collection name your agent reads is derived from your Scalekit identity at request time. It is never accepted as input."
          identity={identity}
        />
        <GuaranteeCard
          n="02"
          title="Payload-level identity stamp"
          body="Every memory fragment carries the therapist_id of who wrote it. We verify it on read, not just on write."
          identity={identity}
        />
        <GuaranteeCard
          n="03"
          title="Defense-in-depth assert"
          body="Before any retrieved memory reaches the language model, we assert its stamp matches the active identity. A mismatch raises, not warns."
          identity={identity}
        />
      </div>

      {/* The code */}
      <div style={{ marginTop: 56 }}>
        <Eyebrow>The line of code that makes a leak impossible</Eyebrow>
        <div
          style={{
            marginTop: 16,
            background: "rgba(26, 10, 60, 0.88)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(124, 58, 237, 0.3)",
            boxShadow: "0 8px 40px rgba(109,40,217,0.25)",
            color: "#E8E3FF",
            padding: 28,
            borderRadius: 16,
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 12.5,
            lineHeight: 1.7,
            overflow: "auto",
          }}
        >
          <span style={{ color: "#A78BFA" }}>def</span>{" "}
          <span style={{ color: "#F9A8D4" }}>retrieve_memories</span>(request_ctx, query_embedding, k=
          <span style={{ color: "#EC4899" }}>4</span>):
          <br />
          {"    "}user_id = request_ctx.scalekit_user.id{" "}
          <span style={{ color: "#7C3AED88" }}># from verified JWT, not request body</span>
          <br />
          {"    "}collection = <span style={{ color: "#86EFAC" }}>{`f"user-{"{"}user_id{"}"}-memories"`}</span>
          <br />
          {"    "}results = vectorai.points.search(collection, vector=query_embedding, limit=k)
          <br />
          {"    "}
          <br />
          {"    "}
          <span style={{ color: "#7C3AED88" }}># belt &amp; suspenders — every point must carry our identity</span>
          <br />
          {"    "}
          <span style={{ color: "#A78BFA" }}>for</span> point{" "}
          <span style={{ color: "#A78BFA" }}>in</span> results:
          <br />
          {"        "}
          <span style={{ color: "#F472B6" }}>assert</span> point.payload[
          <span style={{ color: "#86EFAC" }}>"therapist_id"</span>] == user_id,{" "}
          <span style={{ color: "#86EFAC" }}>"ISOLATION BREACH"</span>
          <br />
          {"    "}
          <br />
          {"    "}<span style={{ color: "#A78BFA" }}>return</span> results
        </div>
      </div>

      {/* Live audit log */}
      <div style={{ marginTop: 56 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <Eyebrow>Live audit log · this session</Eyebrow>
          <span
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 10,
              color: tokens.inkMute,
              letterSpacing: 0.4,
            }}
          >
            {audit.log.length} entries
          </span>
        </div>
        <div style={{ marginTop: 20 }}>
          {audit.log.length === 0 ? (
            <Card style={{ padding: 32, textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "Instrument Serif, serif",
                  fontStyle: "italic",
                  color: tokens.inkMute,
                  fontSize: 16,
                }}
              >
                No queries yet. Go ask your agent something — every retrieval signs an entry here.
              </div>
            </Card>
          ) : (
            <Card>
              {audit.log.map((e, i) => (
                <div
                  key={i}
                  style={{
                    padding: "14px 20px",
                    borderBottom: i < audit.log.length - 1 ? `1px solid ${tokens.hairlineSoft}` : "none",
                    display: "grid",
                    gridTemplateColumns: "90px 100px 1fr auto",
                    gap: 20,
                    alignItems: "center",
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: 11,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.3)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <span style={{ color: tokens.inkMute }}>
                    {e.at.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                  <span
                    style={{
                      color: e.kind === "assertion" ? tokens.good : identity.accent,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      fontWeight: 500,
                    }}
                  >
                    {e.kind}
                  </span>
                  <span style={{ color: tokens.ink, fontFamily: "Inter, sans-serif", fontSize: 12 }}>
                    {e.kind === "retrieval"
                      ? `"${e.query}" · client=${e.filter?.client || "any"}`
                      : `verified ${e.verified} points · ${e.result}`}
                  </span>
                  <span style={{ color: tokens.inkMute, fontSize: 10 }}>{e.collection}</span>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function GuaranteeCard({ n, title, body, identity }) {
  return (
    <Card style={{ padding: 28 }}>
      <div
        style={{
          fontFamily: "Instrument Serif, serif",
          fontStyle: "italic",
          fontSize: 56,
          background: `linear-gradient(135deg, ${identity.accent}, #EC4899)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          lineHeight: 1,
          opacity: 0.5,
        }}
      >
        {n}
      </div>
      <div
        style={{
          marginTop: 16,
          fontFamily: "Inter, sans-serif",
          fontSize: 15,
          fontWeight: 600,
          color: tokens.ink,
          lineHeight: 1.4,
        }}
      >
        {title}
      </div>
      <div
        style={{
          marginTop: 10,
          fontFamily: "Inter, sans-serif",
          fontSize: 13,
          color: tokens.inkSoft,
          lineHeight: 1.6,
        }}
      >
        {body}
      </div>
    </Card>
  );
}

// ──────────────────────────────────────────────────────────────────────
// DEMO MODE
// ──────────────────────────────────────────────────────────────────────

function DemoPage() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");

  const ask = () => {
    if (!query.trim()) return;
    setSubmitted(query);
  };

  return (
    <div style={{ minHeight: "calc(100vh - 65px)" }}>
      <div style={{ padding: "48px 72px 32px", maxWidth: 1400, margin: "0 auto" }}>
        <Eyebrow>Side-by-side · prove it</Eyebrow>
        <h1
          style={{
            fontFamily: "Instrument Serif, serif",
            fontSize: 48,
            color: tokens.ink,
            marginTop: 12,
            lineHeight: 1.05,
            maxWidth: 780,
          }}
        >
          Same product. Same question.{" "}
          <span style={{
            background: "linear-gradient(135deg, #7C3AED, #EC4899)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>Two identities.</span>
        </h1>
        <div
          style={{
            marginTop: 14,
            fontFamily: "Inter, sans-serif",
            fontSize: 15,
            color: tokens.inkSoft,
            maxWidth: 620,
            lineHeight: 1.6,
          }}
        >
          Both clinicians have a client pseudonymed{" "}
          <span style={{ fontStyle: "italic", color: "#7C3AED" }}>Maya</span>. They are different people in
          different rooms. Ask anything — each agent answers only from its own
          collection.
        </div>

        <div
          style={{
            marginTop: 32,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 18px",
            ...glassMixin,
            borderRadius: 14,
            maxWidth: 720,
          }}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ask()}
            placeholder='Try: "What do I know about Maya?"'
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontFamily: "Inter, sans-serif",
              fontSize: 14,
              color: tokens.ink,
            }}
          />
          <button
            onClick={ask}
            style={{
              background: "linear-gradient(135deg, #7C3AED, #EC4899)",
              color: "white",
              border: "none",
              borderRadius: 10,
              padding: "9px 18px",
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 4px 18px rgba(124,58,237,0.4)",
            }}
          >
            Ask both <ArrowRight size={12} />
          </button>
        </div>

        <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            "What do I know about Maya?",
            "What patterns have I noticed this week?",
            "What was I planning to revisit?",
          ].map((s) => (
            <button
              key={s}
              onClick={() => {
                setQuery(s);
                setSubmitted(s);
              }}
              style={{
                padding: "7px 14px",
                ...glassMixin,
                borderRadius: 20,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
                fontSize: 12,
                color: tokens.inkSoft,
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = tokens.ink;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = tokens.inkSoft;
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Split screens */}
      <div
        style={{
          padding: "0 72px 72px",
          maxWidth: 1400,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1px 1fr",
          gap: 32,
          marginTop: 32,
        }}
      >
        <DemoPanel identity={identities.chen} query={submitted} />
        <div style={{ background: tokens.hairline, position: "relative" }}>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              ...glassMixin,
              borderRadius: 20,
              padding: "10px 8px",
            }}
          >
            <Lock size={14} style={{ color: tokens.inkMute }} />
          </div>
        </div>
        <DemoPanel identity={identities.patel} query={submitted} />
      </div>
    </div>
  );
}

function DemoPanel({ identity, query }) {
  const [response, setResponse] = useState(null);

  useEffect(() => {
    if (!query) {
      setResponse(null);
      return;
    }
    setTimeout(() => {
      const retrieved = retrieveMemories(identity.id, query, null, 3);
      setResponse(composeAgentReply(identity.id, query, retrieved));
    }, 400);
  }, [query, identity.id]);

  return (
    <div>
      <Card
        style={{
          padding: "24px",
          borderTop: `3px solid ${identity.accent}`,
          borderRadius: 16,
          minHeight: 480,
          boxShadow: `0 8px 40px ${identity.accentGlow}, inset 0 1px 0 rgba(255,255,255,0.9)`,
        }}
      >
        <IdentitySeal identity={identity} />
        <div
          style={{
            marginTop: 12,
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 10,
            color: tokens.inkMute,
            letterSpacing: 0.4,
          }}
        >
          reading · user-{identity.id}-memories
        </div>

        <Hairline className="my-6" />

        {!query && (
          <div
            style={{
              fontFamily: "Instrument Serif, serif",
              fontStyle: "italic",
              fontSize: 18,
              color: tokens.inkMute,
              marginTop: 32,
              lineHeight: 1.5,
            }}
          >
            Waiting for a question. This panel will only ever respond from{" "}
            {identity.name.split(" ").slice(-1)[0]}'s collection.
          </div>
        )}

        {query && !response && (
          <div
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 11,
              color: identity.accent,
              letterSpacing: 0.4,
              marginTop: 24,
            }}
          >
            searching {identity.name.split(" ").slice(-1)[0]}'s collection…
          </div>
        )}

        {response && (
          <>
            <div
              style={{
                marginTop: 16,
                fontFamily: "Inter, sans-serif",
                fontSize: 13,
                color: tokens.ink,
                lineHeight: 1.65,
                whiteSpace: "pre-wrap",
              }}
            >
              {response.text}
            </div>
            {response.retrieved.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <Eyebrow>Drawn from</Eyebrow>
                <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {response.retrieved.map((r) => (
                    <span
                      key={r.id}
                      style={{
                        padding: "4px 10px",
                        background: `${identity.accent}15`,
                        border: `1px solid ${identity.accent}33`,
                        borderRadius: 20,
                        fontFamily: "JetBrains Mono, monospace",
                        fontSize: 10,
                        color: identity.accent,
                      }}
                    >
                      {r.id}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// SESSION NOTES PAGE — write notes during/after session → Notion + VectorAI
// ──────────────────────────────────────────────────────────────────────

const NOTE_TYPES = [
  { k: "observation", label: "Observation", icon: "👁", color: "#7C3AED" },
  { k: "theme",       label: "Theme",       icon: "🔁", color: "#2563EB" },
  { k: "intervention",label: "Intervention",icon: "✦",  color: "#059669" },
  { k: "plan",        label: "Plan / Follow-up", icon: "📌", color: "#DC2626" },
  { k: "reflection",  label: "Reflection",  icon: "🪞", color: "#9B8EC4" },
];

function SessionNotesPage({ identity }) {
  const clients = clientDirectory[identity.id];
  const schedule = todaysSchedule[identity.id] || [];

  const getCurrentOrUpcomingSession = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinutes;

    for (const session of schedule) {
      const [h, m] = session.time.split(":").map(Number);
      const sessionTimeInMinutes = h * 60 + m;
      const sessionEndInMinutes = sessionTimeInMinutes + 50; // 50 min default

      if (currentTimeInMinutes >= sessionTimeInMinutes && currentTimeInMinutes < sessionEndInMinutes) {
        return session;
      }
    }

    return schedule[0] || null;
  };

  const currentSession = getCurrentOrUpcomingSession();
  const defaultClient = currentSession?.client || clients[0].name;

  const [selectedClient, setSelectedClient] = useState(defaultClient);
  const [noteType, setNoteType] = useState("observation");
  const [noteText, setNoteText] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null); // null | "saved" | "error"
  const [savedNotes, setSavedNotes] = useState([]);
  const textRef = useRef(null);

  const activeType = NOTE_TYPES.find((t) => t.k === noteType);

  const saveNote = async () => {
    if (!noteText.trim()) return;
    setSaving(true);
    setStatus(null);
    try {
      const matchingSession = schedule.find((s) => s.client === selectedClient);
      const r = await fetch("/api/notion/save-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicianId: identity.id,
          clientName: selectedClient,
          noteType,
          text: noteText.trim(),
          sessionDate: new Date().toISOString().split("T")[0],
          sessionTime: matchingSession?.time || null,
          sessionDuration: matchingSession?.duration || null,
        }),
      });
      const d = await r.json();
      if (d.ok) {
        setSavedNotes((prev) => [{
          client: selectedClient,
          type: noteType,
          text: noteText.trim(),
          notionUrl: d.notionUrl,
          savedTo: d.savedTo,
          time: new Date(),
          sessionTime: matchingSession?.time || null,
        }, ...prev]);
        setNoteText("");
        setStatus("saved");
        textRef.current?.focus();
        setTimeout(() => setStatus(null), 4000);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") saveNote();
  };

  return (
    <div style={{ padding: "48px 72px", maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <Eyebrow>Session Notes · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</Eyebrow>
        <h1 style={{ fontFamily: "Instrument Serif, serif", fontSize: 48, color: tokens.ink, marginTop: 10, lineHeight: 1.1 }}>
          Write &amp; sync to{" "}
          <span style={{ background: "linear-gradient(135deg, #000, #444)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Notion
          </span>
        </h1>
        <div style={{ marginTop: 8, fontFamily: "Inter, sans-serif", fontSize: 14, color: tokens.inkSoft }}>
          Notes save to your Notion workspace and VectorAI DB simultaneously. Press{" "}
          <kbd style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, background: "rgba(0,0,0,0.08)", padding: "2px 6px", borderRadius: 4 }}>
            ⌘ Enter
          </kbd>{" "}
          to save.
        </div>
      </div>

      {/* Current session indicator */}
      {currentSession && (
        <div style={{
          marginBottom: 24,
          padding: "16px 20px",
          background: `linear-gradient(135deg, ${identity.accent}12, ${identity.accent}06)`,
          border: `1px solid ${identity.accent}33`,
          borderRadius: 10,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}>
          <span style={{ fontSize: 20 }}>🔴</span>
          <div>
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, color: tokens.ink }}>
              Current session: {currentSession.client}
            </span>
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: tokens.inkSoft }}> · {currentSession.time} ({currentSession.duration})</span>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 32, alignItems: "start" }}>
        {/* Left sidebar — client + type */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Client selector */}
          <Card style={{ padding: "20px" }}>
            <Eyebrow>Client</Eyebrow>
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
              {clients.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedClient(c.name)}
                  style={{
                    padding: "10px 14px",
                    background: selectedClient === c.name
                      ? `linear-gradient(135deg, ${identity.accent}22, ${identity.accent}0a)`
                      : "transparent",
                    border: selectedClient === c.name
                      ? `1px solid ${identity.accent}44`
                      : "1px solid transparent",
                    borderRadius: 8,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s",
                    position: "relative",
                  }}
                >
                  {selectedClient === c.name && (
                    <div style={{
                      position: "absolute", left: 0, top: 8, bottom: 8,
                      width: 3, borderRadius: "0 2px 2px 0",
                      background: identity.accent,
                      boxShadow: `2px 0 6px ${identity.accentGlow}`,
                    }} />
                  )}
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: selectedClient === c.name ? 600 : 400, color: selectedClient === c.name ? identity.accent : tokens.ink }}>
                    {c.name}
                  </div>
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: tokens.inkMute, marginTop: 2 }}>
                    {c.note}
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Note type */}
          <Card style={{ padding: "20px" }}>
            <Eyebrow>Note type</Eyebrow>
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
              {NOTE_TYPES.map((t) => (
                <button
                  key={t.k}
                  onClick={() => setNoteType(t.k)}
                  style={{
                    padding: "9px 14px",
                    background: noteType === t.k ? `${t.color}15` : "transparent",
                    border: noteType === t.k ? `1px solid ${t.color}44` : "1px solid transparent",
                    borderRadius: 8,
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    transition: "all 0.15s",
                  }}
                >
                  <span style={{ fontSize: 16 }}>{t.icon}</span>
                  <span style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 13,
                    fontWeight: noteType === t.k ? 600 : 400,
                    color: noteType === t.k ? t.color : tokens.inkSoft,
                  }}>
                    {t.label}
                  </span>
                </button>
              ))}
            </div>
          </Card>

          {/* Sync destination badges */}
          <Card style={{ padding: "16px 20px" }}>
            <Eyebrow>Saving to</Eyebrow>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>📝</span>
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: tokens.ink, fontWeight: 500 }}>
                  Notion · Notes database
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>🗃️</span>
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: tokens.ink, fontWeight: 500 }}>
                  VectorAI DB · medisync_notes
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right — note editor */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Active context bar */}
          <div style={{
            padding: "12px 20px",
            background: `linear-gradient(135deg, ${activeType.color}18, ${activeType.color}0a)`,
            border: `1px solid ${activeType.color}33`,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}>
            <span style={{ fontSize: 20 }}>{activeType.icon}</span>
            <div>
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, color: activeType.color }}>
                {activeType.label}
              </span>
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: tokens.inkSoft }}> for </span>
              <span style={{ fontFamily: "Instrument Serif, serif", fontSize: 16, color: tokens.ink }}>
                {selectedClient}
              </span>
            </div>
            {identity.name && (
              <div style={{ marginLeft: "auto", fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: tokens.inkMute }}>
                {identity.name}
              </div>
            )}
          </div>

          {/* Text area */}
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <textarea
              ref={textRef}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Write your ${activeType.label.toLowerCase()} for ${selectedClient}…\n\nCapture what stood out, patterns noticed, or what to carry into the next session.`}
              style={{
                width: "100%",
                minHeight: 260,
                padding: "24px 28px",
                border: "none",
                outline: "none",
                resize: "vertical",
                fontFamily: "Inter, sans-serif",
                fontSize: 15,
                lineHeight: 1.7,
                color: tokens.ink,
                background: "transparent",
                boxSizing: "border-box",
              }}
            />
            {/* Character count */}
            <div style={{
              padding: "10px 20px",
              borderTop: `1px solid ${tokens.hairlineSoft}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "rgba(255,255,255,0.3)",
            }}>
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: tokens.inkMute }}>
                {noteText.length} chars
              </span>
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: tokens.inkMute }}>
                ⌘ Enter to save
              </span>
            </div>
          </Card>

          {/* Save button + status */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              onClick={saveNote}
              disabled={saving || !noteText.trim()}
              style={{
                padding: "13px 32px",
                background: saving || !noteText.trim()
                  ? "rgba(124,58,237,0.3)"
                  : `linear-gradient(135deg, ${identity.accent}ee, ${identity.accent}bb)`,
                color: "white",
                border: "none",
                borderRadius: 10,
                cursor: saving || !noteText.trim() ? "not-allowed" : "pointer",
                fontFamily: "Inter, sans-serif",
                fontSize: 14,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: !noteText.trim() ? "none" : `0 4px 18px ${identity.accentGlow}`,
                transition: "all 0.2s",
              }}
            >
              {saving ? (
                <>Saving…</>
              ) : (
                <>
                  <span style={{ fontSize: 16 }}>📝</span>
                  Save to Notion + VectorAI
                </>
              )}
            </button>

            {status === "saved" && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 18px",
                background: "rgba(5,150,105,0.1)",
                border: "1px solid rgba(5,150,105,0.25)",
                borderRadius: 10,
                fontFamily: "Inter, sans-serif",
                fontSize: 13,
                color: tokens.good,
                fontWeight: 500,
              }}>
                ✓ Saved to Notion &amp; VectorAI
              </div>
            )}
            {status === "error" && (
              <div style={{
                padding: "10px 18px",
                background: "rgba(244,63,94,0.08)",
                border: "1px solid rgba(244,63,94,0.2)",
                borderRadius: 10,
                fontFamily: "Inter, sans-serif",
                fontSize: 13,
                color: tokens.warn,
              }}>
                Save failed — check server logs
              </div>
            )}
          </div>

          {/* Notes saved this session */}
          {savedNotes.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <Eyebrow>Saved this session ({savedNotes.length})</Eyebrow>
              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                {savedNotes.map((n, i) => {
                  const t = NOTE_TYPES.find((x) => x.k === n.type);
                  return (
                    <Card key={i} style={{ padding: "16px 20px" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                            <span style={{
                              fontFamily: "JetBrains Mono, monospace",
                              fontSize: 9,
                              color: t?.color || identity.accent,
                              background: `${t?.color || identity.accent}15`,
                              padding: "2px 8px",
                              borderRadius: 4,
                              letterSpacing: 0.4,
                              textTransform: "uppercase",
                            }}>
                              {t?.icon} {n.type}
                            </span>
                            <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: tokens.inkSoft }}>
                              {n.client}
                            </span>
                            {n.sessionTime && (
                              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: tokens.good, background: "rgba(5,150,105,0.15)", padding: "2px 8px", borderRadius: 4 }}>
                                🕐 {n.sessionTime}
                              </span>
                            )}
                            <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: tokens.inkMute, marginLeft: "auto" }}>
                              {n.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: tokens.ink, lineHeight: 1.55 }}>
                            {n.text}
                          </div>
                        </div>
                      </div>
                      <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center" }}>
                        {n.savedTo?.map((src) => (
                          <span key={src} style={{
                            fontFamily: "JetBrains Mono, monospace",
                            fontSize: 10,
                            color: src === "notion" ? "#059669" : "#7C3AED",
                            background: src === "notion" ? "rgba(5,150,105,0.1)" : "rgba(124,58,237,0.1)",
                            padding: "2px 8px",
                            borderRadius: 4,
                          }}>
                            {src === "notion" ? "📝 Notion" : "🗃️ VectorAI"}
                          </span>
                        ))}
                        {n.notionUrl && (
                          <a
                            href={n.notionUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontFamily: "JetBrains Mono, monospace",
                              fontSize: 10,
                              color: identity.accent,
                              textDecoration: "none",
                              marginLeft: "auto",
                              letterSpacing: 0.3,
                            }}
                          >
                            Open in Notion ↗
                          </a>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// ROOT
// ──────────────────────────────────────────────────────────────────────

function DemoModeShell({ onExit }) {
  return (
    <div style={{ background: "transparent", minHeight: "100vh" }}>
      <div style={{
          ...glassMixin,
          borderRadius: 0,
          borderLeft: "none",
          borderRight: "none",
          borderTop: "none",
          padding: "14px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div className="flex items-center gap-2">
          <div style={{
            width: 24, height: 24, borderRadius: 6,
            background: "linear-gradient(135deg, #7C3AED, #EC4899)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 3px 10px rgba(124,58,237,0.4)",
          }}>
            <Square size={10} style={{ color: "white" }} strokeWidth={2} />
          </div>
          <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: 0.3, color: tokens.ink }}>
            MediSync · Demo Mode
          </span>
        </div>
        <button
          onClick={onExit}
          style={{ background: "transparent", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: 12, color: tokens.inkMute }}
        >
          Exit demo
        </button>
      </div>
      <DemoPage />
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dash");
  const [activeClient, setActiveClient] = useState(null);
  const audit = useAuditLog();

  useEffect(() => {
    if (!document.getElementById("vellum-fonts")) {
      const link = document.createElement("link");
      link.id = "vellum-fonts";
      link.rel = "stylesheet";
      link.href = FONTS_HREF;
      document.head.appendChild(link);
    }
    document.body.style.background = tokens.rootGradient;
    document.body.style.minHeight = "100vh";
  }, []);

  const goLogin = (id) => {
    if (id === "DEMO") {
      setUser({ kind: "demo" });
      setPage("demo");
    } else {
      setUser(id);
      setPage("dash");
    }
  };

  if (!user) return <LoginPage onLogin={goLogin} />;

  if (user.kind === "demo") {
    return <DemoModeShell onExit={() => setUser(null)} />;
  }

  return (
    <div style={{ background: "transparent", minHeight: "100vh" }}>
      <TopNav
        identity={user}
        page={page}
        setPage={setPage}
        onLogout={() => setUser(null)}
      />
      {page === "dash" && (
        <DashboardPage
          identity={user}
          audit={audit}
          setPage={setPage}
          setActiveClient={setActiveClient}
        />
      )}
      {page === "clients" && (
        <ClientsPage
          identity={user}
          audit={audit}
          activeClient={activeClient}
          setActiveClient={setActiveClient}
        />
      )}
      {page === "notes" && <SessionNotesPage identity={user} />}
      {page === "memory" && <MemoryPage identity={user} />}
      {page === "audit" && <AuditPage identity={user} audit={audit} />}
      {page === "demo" && <DemoPage />}
    </div>
  );
}
