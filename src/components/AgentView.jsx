import React, { useState } from 'react';

export default function AgentView({ chat }) {
  const [role, setRole] = useState('mentor');
  const [response, setResponse] = useState(null);

  async function handleAsk() {
    const sample = chat.messages.slice(-20).map(m => `${m.sender}: ${m.text}`).join('\n');
    const prompt = {
      mentor: "You are a wise relationship coach.",
      argumentative: "You are a debate strategist helping refine arguments.",
      conciliatory: "You are a mediator finding common ground."
    }[role];

    const res = await fetch('http://localhost:3001/ask', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ rolePrompt: prompt, chat: sample })
    });

    const data = await res.json();
    setResponse(data.reply);
  }

  return (
    <div className="agent-view">
      <select onChange={(e) => setRole(e.target.value)}>
        <option value="mentor">Mentor</option>
        <option value="argumentative">Argumentative</option>
        <option value="conciliatory">Conciliatory</option>
      </select>
      <button onClick={handleAsk}>Ask Agent</button>
      {response && <div className="agent-reply"><p>{response}</p></div>}
    </div>
  );
}