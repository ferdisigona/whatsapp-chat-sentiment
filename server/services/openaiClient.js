import OpenAI from "openai";

let cachedClient = null;

export function getOpenAIClient() {
  if (!cachedClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not set");
    }
    cachedClient = new OpenAI({ apiKey });
  }
  return cachedClient;
}

