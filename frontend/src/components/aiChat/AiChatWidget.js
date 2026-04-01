import React, {useMemo, useState} from "react";
import { Link } from "react-router-dom";
import api from "../../api/AxiosConfig";

export default function AiChatWidget() {
  const initialMessages = useMemo(
    () => [
      {
        role: "assistant",
        content: "Hello, I'm the movie site AI assistant. What kind of movies are you looking for?",
        movies: [],
      },
    ],
    []
  );

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState(initialMessages);

  const containerStyle = useMemo(
    () => ({
      position: "fixed",
      right: 16,
      bottom: 16,
      width: open ? 360 : "auto",
      zIndex: 9999,
      fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
    }),
    [open]
  );

  const panelStyle = {
    width: 360,
    height: 520,
    background: "#111",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
  };

  const headerStyle = {
    padding: "10px 12px",
    borderBottom: "1px solid rgba(255,255,255,0.12)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#171717",
  };

  const bodyStyle = {
    padding: 12,
    height: 400,
    overflowY: "auto",
    background: "#111",
  };

  const inputBarStyle = {
    display: "flex",
    gap: 8,
    padding: 12,
    borderTop: "1px solid rgba(255,255,255,0.12)",
    background: "#171717",
  };

  const bubble = (role) => ({
    maxWidth: "85%",
    padding: "10px 12px",
    borderRadius: 12,
    marginBottom: 10,
    whiteSpace: "pre-wrap",
    lineHeight: 1.4,
    background: role === "user" ? "#2563eb" : "#262626",
    alignSelf: role === "user" ? "flex-end" : "flex-start",
  });

  const clearChat = () => {
    const ok = window.confirm("Clear current chat?");
    if (!ok) return;

    setLoading(false);
    setInput("");
    setMessages(initialMessages);
  };

  const trailerTo = (ytTrailerId) => `/Trailer/${ytTrailerId}`;

  const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const renderAssistantContent = (text, movies) => {
    const raw = text ?? "";
    const list = Array.isArray(movies) ? movies : [];
    const usable = list
      .filter((m) => m && typeof m.title === "string" && m.title.trim() && m.ytTrailerId)
      .map((m) => ({ title: m.title.trim(), ytTrailerId: m.ytTrailerId }))
      .sort((a, b) => b.title.length - a.title.length); // longer first to avoid partial matches

    if (!raw || usable.length === 0) return raw;

    const titleToMovie = new Map(usable.map((m) => [m.title.toLowerCase(), m]));

    // Match titles with optional **bold** markers: **Title** or Title
    const titleAlternation = usable.map((m) => escapeRegExp(m.title)).join("|");
    const re = new RegExp(`(\\*\\*)?(${titleAlternation})(\\*\\*)?`, "g");

    // Reduce false positives: only replace if around-match boundary looks safe
    const isBoundary = (ch) => {
      if (ch === undefined) return true;
      return /[\s.,!?:;()"'\[\]{}<>\/\\\n\r\t-]/.test(ch);
    };

    const parts = [];
    let last = 0;
    let match;
    while ((match = re.exec(raw)) !== null) {
      const full = match[0];
      const title = match[2]; // group 2 = the actual title
      const start = match.index;
      const end = start + full.length;

      const prevChar = raw[start - 1];
      const nextChar = raw[end];

      // Skip replacement when embedded in a word/identifier
      if (!isBoundary(prevChar) || !isBoundary(nextChar)) {
        continue;
      }

      const movie = titleToMovie.get(title.toLowerCase());
      if (!movie) continue;

      if (start > last) parts.push(raw.slice(last, start));

      parts.push(
        <Link
          key={`${movie.ytTrailerId}-${start}`}
          to={trailerTo(movie.ytTrailerId)}
          style={{ color: "#93c5fd", textDecoration: "underline" }}
        >
          {title}
        </Link>
      );

      last = end;
    }

    if (last < raw.length) parts.push(raw.slice(last));
    return parts.length === 0 ? raw : parts;
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: "user", content: text }];

    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const MAX_MESSAGES = 20; // keep last N messages to limit payload size
      const payloadMessages = nextMessages.slice(-MAX_MESSAGES).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.post("/api/ai/chat", { messages: payloadMessages });

      const reply = res.data?.reply ?? "(empty reply)";
      const movies = Array.isArray(res.data?.movies) ? res.data.movies : [];

      setMessages((prev) => [...prev, { role: "assistant", content: reply, movies }]);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Request failed";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `ERROR: ${msg}`, movies: [] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <div style={containerStyle}>
        <button
          onClick={() => setOpen(true)}
          style={{
            background: "#111",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 999,
            padding: "10px 14px",
            cursor: "pointer",
          }}
        >
          AI assistant
        </button>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={panelStyle}>
        <div style={headerStyle}>
          <div style={{ fontWeight: 600 }}>AI assistant</div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={clearChat}
              disabled={loading}
              style={{
                background: "transparent",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 8,
                padding: "4px 8px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
              title="Clear chat"
            >
              Clear
            </button>

            <button
              onClick={() => setOpen(false)}
              style={{
                background: "transparent",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 8,
                padding: "4px 8px",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>

        <div style={bodyStyle}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {messages.map((m, idx) => (
              <div key={idx} style={bubble(m.role)}>
                {m.role === "assistant"
                  ? renderAssistantContent(m.content, m.movies)
                  : m.content}
              </div>
            ))}
            {loading && <div style={bubble("assistant")}>Thinking...</div>}
          </div>
        </div>

        <div style={inputBarStyle}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
            placeholder="For example: Recommend a few movies similar to Interstellar."
            style={{
              flex: 1,
              padding: "10px 10px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.2)",
              outline: "none",
              background: "#111",
              color: "#fff",
            }}
          />
          <button
            onClick={send}
            disabled={loading}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.2)",
              background: loading ? "#333" : "#16a34a",
              color: "#fff",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}