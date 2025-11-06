import React, { useState } from "react";
import { analyzeSegments } from "../utils/analyzeSegments.js";

export default function InsightsView({ chat }) {
  const [segments, setSegments] = useState([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [avgTime, setAvgTime] = useState(null);
  const [startTime, setStartTime] = useState(null);

  async function handleAnalyze() {
    setSegments([]);
    setLoading(true);
    setStartTime(Date.now());

    try {
      // 🧠 1. Run main per-segment analysis
      const results = await analyzeSegments(chat.messages, (result, current, total) => {
        setSegments((prev) => [...prev, result]);
        setProgress({ current, total });

        // Update average per-segment timing for remaining estimate
        if (current > 0) {
          const elapsed = (Date.now() - startTime) / 1000;
          setAvgTime(elapsed / current);
        }
      });

      setSegments(results);

    } catch (err) {
      console.error("Analysis failed:", err);
      alert("Something went wrong during analysis. Check console for details.");
    } finally {
      setLoading(false);
    }
  }

  // ⏱️ Remaining time estimate
  const remainingSeconds =
    avgTime && progress.total
      ? Math.max(0, (progress.total - progress.current) * avgTime)
      : 0;

  const pct =
    progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0;

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <h2>Conversation Insights</h2>

      <button
        onClick={handleAnalyze}
        disabled={loading}
        style={{
          marginBottom: "1rem",
          padding: "0.6rem 1.2rem",
          background: loading ? "#ccc" : "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: loading ? "default" : "pointer",
        }}
      >
        {loading
          ? `Analyzing (${progress.current}/${progress.total})...`
          : "Analyze Conversations"}
      </button>

      {loading && (
        <div style={{ marginBottom: "1rem" }}>
          <progress
            value={progress.current}
            max={progress.total}
            style={{ width: "100%" }}
          />
          <p style={{ fontSize: "0.9rem", color: "#666" }}>
            {pct}% complete
            {avgTime && <> — est. {remainingSeconds.toFixed(0)}s remaining</>}
          </p>
        </div>
      )}

      {/* 🧾 Render individual analyzed segments */}
      {segments.length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          {segments.map((seg) => (
            <div
              key={seg.id}
              style={{
                marginBottom: "1rem",
                padding: "1rem",
                borderRadius: "10px",
                background:
                  seg.mood === "positive"
                    ? "#e6ffe6"
                    : seg.mood === "negative"
                    ? "#ffe6e6"
                    : seg.mood === "mixed"
                    ? "#fffbe6"
                    : "#f0f0f0",
              }}
            >
              <h4>
                Conversation {seg.id}{" "}
                <span style={{ color: "#666" }}>({seg.mood})</span>
              </h4>
              <p style={{ fontSize: "0.9rem", color: "#666" }}>
                {seg.start} – {seg.end}
              </p>
              <p>{seg.summary}</p>
            </div>
          ))}
        </div>
      )}

      {/* Semantic themes removed */}
    </div>
  );
}
