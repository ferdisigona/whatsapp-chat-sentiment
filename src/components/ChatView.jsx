import React from "react";

export default function ChatView({ chat }) {
  const {
    chatName,
    firstDate,
    lastDate,
    messages,
    yourName,
    enteredName,
    participants,
  } = chat;

  const normalize = (name) => (name || "").trim().toLowerCase();
  const participantList = participants || [];
  const normalizedParticipants = participantList.map((p) => ({
    original: p,
    normalized: normalize(p),
  }));
  const normalizedEntered = normalize(enteredName);
  const normalizedStored = normalize(yourName);

  let yourDisplayName = "";

  const matchNormalized = (target) =>
    normalizedParticipants.find((entry) => entry.normalized === target)?.original;

  const matchPartial = (target) =>
    normalizedParticipants.find(
      (entry) =>
        entry.normalized.includes(target) || target.includes(entry.normalized)
    )?.original;

  if (yourName && participantList.includes(yourName)) {
    yourDisplayName = yourName;
  } else if (normalizedStored) {
    yourDisplayName =
      matchNormalized(normalizedStored) || matchPartial(normalizedStored) || "";
  }

  if (!yourDisplayName && normalizedEntered) {
    yourDisplayName =
      matchNormalized(normalizedEntered) ||
      matchPartial(normalizedEntered) ||
      enteredName || "";
  }

  if (!yourDisplayName && participantList.length > 0) {
    yourDisplayName = participantList[0];
  }

  const normalizedYou = normalize(yourDisplayName);

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
        {messages.map((m, i) => {
          const isMe = normalize(m.sender) === normalizedYou;
          return (
            <div
              key={i}
              className={`msg ${isMe ? "me" : "them"}`}
              style={{
                textAlign: isMe ? "right" : "left",
                marginBottom: "0.5rem",
              }}
            >
              <p
                style={{
                  display: "inline-block",
                  background: isMe ? "#dcf8c6" : "#fff",
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
          );
        })}
      </div>
    </div>
  );
}
