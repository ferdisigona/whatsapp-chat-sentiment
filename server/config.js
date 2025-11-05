import dotenv from "dotenv";

dotenv.config();

const config = {
  port: Number(process.env.PORT) || 3001,
  modelSource: process.env.MODEL_SOURCE || process.env.DEFAULT_ANALYZER || "ollama",
  defaultAnalyzer: process.env.DEFAULT_ANALYZER || "ollama",
  batchAnalyzer: process.env.BATCH_ANALYZER || "openai",
  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    model: process.env.OLLAMA_MODEL || "llama3",
    embeddingModel: process.env.OLLAMA_EMBED_MODEL || "mxbai-embed-large",
  },
  openai: {
    model: process.env.OPENAI_JSON_MODEL || "gpt-4o-mini",
    temperature: process.env.OPENAI_TEMPERATURE
      ? Number(process.env.OPENAI_TEMPERATURE)
      : 0.3,
  },
};

export default config;

