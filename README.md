# Tandem Sandbox

Tandem Sandbox is a React + Express playground for exploring WhatsApp chat analytics. Upload an exported chat log to:

- Parse messages and segment them into sessions based on timing gaps
- Summarise each session with an LLM (OpenAI or Ollama)
- Cluster the summaries with embeddings to surface recurring themes
- View sentiment metadata and conversation insights in real time

The project is split into a Vite-powered frontend (`/src`) and an Express backend (`/server`).

## Requirements

- Node.js 20+
- npm (comes with Node)
- Optional: [Ollama](https://ollama.com/) with the `llama3` and `mxbai-embed-large` models pulled locally
- OpenAI API key (only required if you plan to use the OpenAI provider)

## Getting Started

Install dependencies for both the frontend and the backend:

```bash
npm install
cd server && npm install
```

Copy the environment templates and adjust values as needed:

```bash
cp env.example .env            # frontend API base URL (Vite style)
cp server/env.example server/.env  # backend configuration & secrets
```

### Development servers

Start the API server (defaults to port 3001):

```bash
cd server
npm run dev
```

In a separate terminal start the Vite dev server:

```bash
npm run dev
```

## Environment Variables

| Scope    | Variable                | Description | Default |
|----------|-------------------------|-------------|---------|
| Frontend | `VITE_API_BASE_URL`     | Base URL for the Express API | `http://localhost:3001` |
| Backend  | `PORT`                  | Express listen port | `3001` |
| Backend  | `DEFAULT_ANALYZER`      | Provider used by `/analyze` (`ollama` or `openai`) | `ollama` |
| Backend  | `BATCH_ANALYZER`        | Provider used by `/analyze-batch` | `openai` |
| Backend  | `OPENAI_API_KEY`        | Required when using OpenAI | – |
| Backend  | `OPENAI_JSON_MODEL`     | OpenAI chat completion model | `gpt-4o-mini` |
| Backend  | `OPENAI_TEMPERATURE`    | Sampling temperature for OpenAI | `0.3` |
| Backend  | `OLLAMA_BASE_URL`       | URL to local Ollama instance | `http://localhost:11434` |
| Backend  | `OLLAMA_MODEL`          | Ollama model for text summaries | `llama3` |
| Backend  | `OLLAMA_EMBED_MODEL`    | Ollama model for embeddings | `mxbai-embed-large` |

## LLM Providers

### OpenAI

1. Create an OpenAI API key and set `OPENAI_API_KEY` in `server/.env`.
2. (Optional) override `OPENAI_JSON_MODEL` or `OPENAI_TEMPERATURE` to tweak behaviour.
3. Set `DEFAULT_ANALYZER=openai` if you want OpenAI to handle the single conversation endpoint.

### Ollama

1. [Install Ollama](https://ollama.com/download) and ensure the daemon is running.
2. Pull the required models:

   ```bash
   ollama pull llama3
   ollama pull mxbai-embed-large
   ```

3. Optionally adjust `OLLAMA_BASE_URL`, `OLLAMA_MODEL`, or `OLLAMA_EMBED_MODEL` in `server/.env`.
4. Set `DEFAULT_ANALYZER=ollama` (default) to keep the single analyze endpoint local.

## Project Structure

```
├── env.example
├── server/
│   ├── env.example
│   ├── config.js
│   ├── index.js
│   ├── routes/
│   └── services/
└── src/
    ├── api/
    ├── components/
    ├── utils/
    └── styles/
```

## Usage

1. Export a WhatsApp chat (text format) and upload it via the UI.
2. The frontend parses the chat (`parseWhatsapp`) and dispatches segments to the backend.
3. The backend summarises each segment, then clusters summaries using embeddings.
4. Insights and clusters render live in the `InsightsView` component.

> **Privacy tip:** store raw chat exports in a local `data/` directory (ignored by git) and avoid committing personal transcripts to the repository.

## Dependencies & Licensing

- **Frontend**: React 19, Recharts, Sentiment, Vite. All are MIT licensed.
- **Backend**: Express 5, cors, dotenv, node-fetch, OpenAI SDK (MIT licensed).
- **Tooling**: ESLint 9+, Vite React plugin (MIT).

The repository itself is released under the MIT License (see `LICENSE`). Ensure your usage of OpenAI and Ollama complies with their respective terms of service.

## Costs & Security Considerations

- **OpenAI usage**: Each request to `/analyze-batch` (defaulting to OpenAI) consumes tokens and incurs costs. Monitor usage through the OpenAI dashboard and consider reducing segment size or switching the batch analyzer to Ollama for local experiments.
- **Rate limits**: Respect OpenAI rate limits. If you encounter 429 errors, lower concurrency (see `p-limit` usage in `analyzeSegments`) or add retry logic.
- **Local models**: Ollama endpoints are exposed only to `localhost` by default. If you expose the backend publicly, secure access to the Ollama instance and consider authentication for all routes.
- **Not production hardened**: The Express app lacks authentication, input validation, and DoS protections. Treat it as a developer sandbox unless you add proper security middleware, request quotas, and auditing.

## Testing & Quality

- **Linting**: Run `npm run lint` in the project root to apply ESLint rules across the frontend. Backend linting is not yet configured.
- **Tests**: There is no automated test suite today. If you plan to accept contributions, consider adding unit tests for the parsing utilities and integration tests around the Express routes (with mocked OpenAI/Ollama calls).
- **Manual verification**: Before publishing, manually exercise the upload flow, segment analysis, and clustering endpoints with non-sensitive sample chats.

## Contributing

Pull requests and bug reports are welcome. Please open an issue to discuss significant changes.
