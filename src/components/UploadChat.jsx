import React from 'react';
import parseWhatsapp from '../utils/parseWhatsapp.js';

export default function UploadChat({ onUpload }) {
  const handleFile = async (e) => {
    const file = e.target.files[0];
    const text = await file.text();
    const chatData = parseWhatsapp(text);
    onUpload(chatData);
  };

  return (
    <div className="upload">
      <h2>Upload your WhatsApp chat export (.txt)</h2>
      <input type="file" accept=".txt" onChange={handleFile} />
    </div>
  );
}