import React from "react";

export default function ChatView({ chat }) {
  const { chatName, firstDate, lastDate, messages } = chat;

  return (
    <div className="chat-view" style={{ maxWidth: 650, margin: "0 auto" }}>
      <div
        className="chat-header"
        style={{
          background: "#f2f2f2",
          padding: "1rem",
          borderRadius: "12px",
          marginBottom: "1rem",
          textAlign: "center",
        }}
      >
        <h2 style={{ margin: 0 }}>{chatName}</h2>
        <p style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>
          {firstDate} – {lastDate}
        </p>
      </div>

      <div className="chat-messages">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`msg ${m.sender === chat.participants[0] ? "me" : "them"}`}
            style={{
              textAlign:
                m.sender === chat.participants[0] ? "right" : "left",
              marginBottom: "0.5rem",
            }}
          >
            <p
              style={{
                display: "inline-block",
                background:
                  m.sender === chat.participants[0] ? "#dcf8c6" : "#fff",
                padding: "0.5rem 0.8rem",
                borderRadius: "10px",
                maxWidth: "75%",
              }}
            >
              {m.text}
            </p>
            <div style={{ fontSize: "0.7rem", color: "#999" }}>
              {m.sender}, {m.date} {m.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
