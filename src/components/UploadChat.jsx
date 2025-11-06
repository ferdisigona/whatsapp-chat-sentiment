import React, { useState } from 'react';
import parseWhatsapp from '../utils/parseWhatsapp.js';

export default function UploadChat({ onUpload }) {
  const [userName, setUserName] = useState('');

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const trimmedName = userName.trim();
    if (!trimmedName) {
      alert('Please enter your WhatsApp display name before uploading.');
      e.target.value = '';
      return;
    }

    const text = await file.text();
    const chatData = parseWhatsapp(text, trimmedName);
    onUpload(chatData);
  };

  return (
    <div className="upload">
      <h2>Upload your WhatsApp chat export (.txt)</h2>
      <label style={{ display: 'block', marginBottom: '0.5rem' }}>
        Your display name (exactly as it appears in the chat)
      </label>
      <input
        type="text"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        placeholder="e.g. John Smith"
        style={{ marginBottom: '1rem', width: '100%', padding: '0.5rem' }}
      />
      <input type="file" accept=".txt" onChange={handleFile} />
    </div>
  );
}