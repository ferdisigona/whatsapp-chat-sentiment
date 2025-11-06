function resolveBaseUrl() {
  if (typeof process !== "undefined" && process.env?.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }

  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  return "http://localhost:3001";
}

const BASE_URL = resolveBaseUrl();

async function request(path, { body, ...options } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    ...options,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Request to ${path} failed: ${res.status} ${errText}`);
  }

  return res.json();
}

export function analyzeConversation(conversationText) {
  return request("/analyze", { body: { conversationText } });
}

export function analyzeConversationBatch(conversationText) {
  return request("/analyze-batch", { body: { conversationText } });
}

