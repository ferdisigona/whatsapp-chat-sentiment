import fetch from "node-fetch";

import config from "../config.js";

export async function embedText(text, options = {}) {
  const { baseUrl, embeddingModel } = { ...config.ollama, ...options };

  const res = await fetch(`${baseUrl}/api/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: embeddingModel,
      input: text,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Ollama embedding failed: ${res.status} ${errText}`);
  }

  const data = await res.json();
  return data.embedding;
}

