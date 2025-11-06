import config from "../config.js";
import { getOpenAIClient } from "./openaiClient.js";

const ALLOWED_MOODS = new Set(["positive", "neutral", "negative", "mixed"]);

function normalizeResult(data) {
  const defaults = {
    summary: "No summary.",
    mood: "neutral",
    relationshipType: "personal",
    topics: [],
  };

  if (!data || typeof data !== "object") {
    return defaults;
  }

  const summary = typeof data.summary === "string" && data.summary.trim().length > 0
    ? data.summary.trim()
    : defaults.summary;

  const rawMood = typeof data.mood === "string" ? data.mood.trim().toLowerCase() : "";
  const mood = ALLOWED_MOODS.has(rawMood) ? rawMood : defaults.mood;

  const rawRelationship = typeof data.relationshipType === "string"
    ? data.relationshipType.trim().toLowerCase()
    : typeof data.relationship === "string"
    ? data.relationship.trim().toLowerCase()
    : "";
  const relationshipType = rawRelationship === "professional"
    ? "professional"
    : rawRelationship === "personal"
    ? "personal"
    : defaults.relationshipType;

  const topicsSource = Array.isArray(data.topics)
    ? data.topics
    : Array.isArray(data.topTopics)
    ? data.topTopics
    : [];
  const topics = topicsSource
    .filter((topic) => typeof topic === "string")
    .map((topic) => topic.trim())
    .filter(Boolean)
    .slice(0, 5);

  return {
    summary,
    mood,
    relationshipType,
    topics,
  };
}

function extractJsonContent(raw) {
  if (!raw) {
    return normalizeResult(null);
  }

  try {
    return normalizeResult(JSON.parse(raw));
  } catch (err) {
    const match = raw.match(/{[\s\S]*}/);
    if (match) {
      try {
        return normalizeResult(JSON.parse(match[0]));
      } catch (inner) {
        // fall through to fallback below
      }
    }

    const fallbackMood =
      /positive|negative|mixed|neutral/i.exec(raw)?.[0]?.toLowerCase() || "neutral";
    return normalizeResult({ summary: raw, mood: fallbackMood });
  }
}

export async function summarizeWithOpenAI(conversationText, options = {}) {
  const client = getOpenAIClient();
  const { chatModel, temperature } = {
    ...config.openai,
    ...options,
  };

  const completion = await client.chat.completions.create({
    model: chatModel,
    temperature,
    messages: [
      {
        role: "system",
        content: `You are a precise conversation analyst.
Review the following chat transcript and respond ONLY with valid minified JSON.
Return an object with this exact shape:
{"summary": "concise 1-2 sentence overview",
 "mood": "positive|neutral|negative|mixed",
 "relationshipType": "personal|professional",
 "topics":["up to five brief sentences describing the most important recurring themes across the entire conversation"]}
Ensure the relationshipType is either "personal" or "professional".
Provide between 3 and 5 sentences, each summarizing a distinct theme that appears multiple times or carries notable weight across full conversation transcript. Avoid focusing on single one-off messages.
Do not include any additional text outside of the JSON object.`,
      },
      { role: "user", content: conversationText },
    ],
  });

  const raw = completion.choices?.[0]?.message?.content?.trim();
  return extractJsonContent(raw);
}

export async function summarizeConversation(conversationText) {
  return summarizeWithOpenAI(conversationText);
}

