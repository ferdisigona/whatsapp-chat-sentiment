import fetch from "node-fetch";

import config from "../config.js";
import { getOpenAIClient } from "./openaiClient.js";

function extractJsonContent(raw) {
  if (!raw) {
    return { summary: "No summary.", mood: "neutral" };
  }

  try {
    return JSON.parse(raw);
  } catch (err) {
    const match = raw.match(/{[\s\S]*}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (inner) {
        // fall through to fallback below
      }
    }

    return {
      summary: raw,
      mood:
        /positive|negative|mixed|neutral/i.exec(raw)?.[0]?.toLowerCase() || "neutral",
    };
  }
}

export async function summarizeWithOllama(conversationText, options = {}) {
  const { baseUrl, model } = { ...config.ollama, ...options };

  const prompt = `
You are a conversation analyst.
Given the following chat transcript, do two things:
1. Summarize it in one or two sentences.
2. Label its overall emotional tone as one of: "positive", "neutral", "negative", or "mixed".
Respond ONLY with valid JSON using this exact format:
{"summary": "...", "mood": "..."}

Chat:
${conversationText}
`;

  const response = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Ollama generate failed: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const text = data.response?.trim();

  if (!text) {
    console.warn("⚠️ Ollama returned empty response");
    return { summary: "No summary.", mood: "neutral" };
  }

  return extractJsonContent(text);
}

export async function summarizeWithOpenAI(conversationText, options = {}) {
  const client = getOpenAIClient();
  const { model, temperature } = { ...config.openai, ...options };

  const completion = await client.chat.completions.create({
    model,
    temperature,
    messages: [
      {
        role: "system",
        content: `You are a precise conversation analyst.
Summarize the following chat in one or two sentences.
Then, label the overall mood as one of: "positive", "neutral", "negative", or "mixed".
Respond ONLY with a valid JSON object like this:
{"summary": "...", "mood": "..."}`,
      },
      { role: "user", content: conversationText },
    ],
  });

  const raw = completion.choices?.[0]?.message?.content?.trim();
  return extractJsonContent(raw);
}

export async function summarizeConversation(
  conversationText,
  provider = config.defaultAnalyzer
) {
  if (provider === "ollama") {
    return summarizeWithOllama(conversationText);
  }
  return summarizeWithOpenAI(conversationText);
}

