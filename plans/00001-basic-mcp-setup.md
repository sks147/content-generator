# Plan: MCP Client/Server + Poem Generator API + PostgreSQL

## Context

The project has a uWebSockets.js backend with a single health endpoint, empty `ts_root/mcp_client/` and `ts_root/mcp_servers/` directories, and Docker Compose files for dev/prod. This plan adds:
- An MCP server (FastMCP, HTTP Streamable transport) as a separate Docker service exposing a `generate_poem` tool
- LLM integration via LangChain.js — provider-agnostic, using a **local LLM** (omlx serving `Qwen3-4B-MLX-4bit` on the host Mac, OpenAI-compatible API at port 1234)
- An MCP client library that connects to the MCP server over HTTP
- Backend API endpoints that use the MCP client to generate poems and persist them in PostgreSQL
- PostgreSQL 18.4 to the Docker Compose stack

Architecture: **stateless, HTTP-based** — MCP server in its own container (port 3001), backend connects via HTTP Streamable transport. LLM runs on the host (omlx), not in Docker.

---

## 1. MCP Server (`ts_root/mcp_servers/`)

Uses **FastMCP** for HTTP Streamable transport. Uses **LangChain.js** with `@langchain/openai` (`ChatOpenAI`) pointed at the local omlx server — provider-agnostic, all LLM code uses `BaseChatModel`.

**New files:**
- `package.json` — deps: `fastmcp`, `@langchain/core`, `@langchain/openai`, `zod`; devDeps: `@types/node`, `typescript`
- `tsconfig.json` — mirrors backend tsconfig
- `.gitignore` — `node_modules/`, `dist/`
- `Dockerfile` — dev (watch mode)
- `Dockerfile_prod` — multi-stage production build
- `docker-entrypoint.sh` — same pattern as backend
- `src/index.ts` — creates `FastMCP` server, registers tool, starts httpStream on port 3001
- `src/tools/generatePoem.ts` — tool definition, calls LLM via provider-agnostic `BaseChatModel`
- `src/llm/model.ts` — **only provider-specific file**: creates `ChatOpenAI` pointed at omlx

**LLM layer — provider-agnostic, local LLM:**
```ts
// src/llm/model.ts — ONLY provider-specific file
import { ChatOpenAI } from "@langchain/openai";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";

export const llm: BaseChatModel = new ChatOpenAI({
  model: process.env.LLM_MODEL ?? "Qwen3-4B-MLX-4bit",
  configuration: {
    baseURL: process.env.LLM_BASE_URL ?? "http://host.docker.internal:11434/v1",
    apiKey: process.env.LLM_API_KEY ?? "not-needed",
  },
});

// src/tools/generatePoem.ts — fully provider-agnostic
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { llm } from "../llm/model.ts";

export async function generatePoemText(theme, style, length): Promise<string> {
  const response = await llm.invoke([
    new SystemMessage("You are a poet. Return only the poem, no commentary."),
    new HumanMessage(`Write a ${style} poem about "${theme}". Target: ${length}.`),
  ]);
  return typeof response.content === "string" ? response.content : "";
}
```

**Tool: `generate_poem`**
- Params: `theme` (string), `style` (free_verse|haiku|sonnet|limerick|ballad, default free_verse), `length` (short|medium|long, default medium)
- Returns MCP text content with the generated poem

## 2. MCP Client (`ts_root/mcp_client/`)

Reusable library consumed via **TypeScript project references**. Uses `@modelcontextprotocol/sdk` client with `StreamableHTTPClientTransport`.

**New files:**
- `package.json` — name: `mcp-client`; deps: `@modelcontextprotocol/sdk`; devDeps: `@types/node`, `typescript`
- `tsconfig.json` — same compiler options, plus `"composite": true`, `"declaration": true`, `"declarationMap": true` (required for project references)
- `.gitignore`
- `src/index.ts` — re-exports `McpClient`
- `src/client.ts` — `McpClient` class wrapping SDK `Client` + `StreamableHTTPClientTransport`. Constructor takes server URL. Methods: `connect()`, `callTool(name, args)`, `disconnect()`

### How the backend consumes it (TypeScript project references)

Backend `tsconfig.json` adds:
```json
{
  "compilerOptions": {
    "composite": true,
    "paths": { "mcp-client": ["../mcp_client/src/index.ts"] }
  },
  "references": [{ "path": "../mcp_client" }]
}
```

The backend imports directly: `import { McpClient } from "mcp-client"`. TypeScript resolves this via the `paths` mapping. At runtime, the backend's `package.json` adds `"mcp-client": "file:../mcp_client"` so Node.js can also resolve the import. Both are needed — `paths` for compile-time, `file:` for runtime.

## 3. Backend Changes (`ts_root/backend/`)

### New files
- `src/mcp/poems.ts` — imports `McpClient` from `mcp-client`. Exports `generatePoem(theme, style?, length?)` which connects to `MCP_SERVER_URL`, calls the `generate_poem` tool, and returns the text.
- `src/db/connection.ts` — `postgres` (postgres.js) connection using `PG*` env vars
- `src/db/schema.ts` — `initializeSchema()` runs `CREATE TABLE IF NOT EXISTS poems`
- `src/db/poems.ts` — query functions: `insertPoem()`, `listPoems(limit, offset)`, `getPoemById(id)`
- `src/controller/poemController.ts` — handlers for `createPoem`, `listPoems`, `getPoem`
- `src/routes/poemRoute.ts` — registers `POST /api/poems`, `GET /api/poems`, `GET /api/poems/:id`

### Modified files
- `package.json` — add deps: `postgres`, `"mcp-client": "file:../mcp_client"`
- `src/routes/index.ts` — add `setupPoemRoutes(app)` call
- `src/server.ts` — call `initializeSchema()` in `startServer()` before `app.listen()`

### API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/poems` | Generate poem via MCP, save to DB. Body: `{theme, style?, length?}`. Returns 201. |
| GET | `/api/poems` | List poems. Query: `?limit=20&offset=0`. Returns `{poems, total}`. |
| GET | `/api/poems/:id` | Get single poem. Returns poem or 404. |

### PostgreSQL Schema
```sql
CREATE TABLE IF NOT EXISTS poems (
  id         SERIAL PRIMARY KEY,
  theme      TEXT NOT NULL,
  style      TEXT NOT NULL DEFAULT 'free_verse',
  length     TEXT NOT NULL DEFAULT 'medium',
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### uWebSockets.js notes
- All async handlers call `res.onAborted()` before any `await`
- Follow existing patterns: `withSecurityHeaders` wrapper, `sendJson`/`readJson` utils

## 4. Docker Compose Changes

### `infra/docker-compose.yml` (dev)

```yaml
services:
  postgres:
    image: postgres:18.4
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: content_generator
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d content_generator"]
      interval: 5s
      timeout: 5s
      retries: 5

  mcp-server:
    build:
      context: ../ts_root/mcp_servers
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      LLM_BASE_URL: http://host.docker.internal:11434/v1
      LLM_MODEL: Qwen3-4B-MLX-4bit
      LLM_API_KEY: not-needed
    volumes:
      - ../ts_root/mcp_servers/src:/app/src
      - ../ts_root/mcp_servers/tsconfig.json:/app/tsconfig.json:ro
      - mcp_servers_node_modules:/app/node_modules
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://localhost:3001/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 15s

  backend:
    build:
      context: ../ts_root/backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
      mcp-server:
        condition: service_healthy
    environment:
      PGHOST: postgres
      PGPORT: "5432"
      PGDATABASE: content_generator
      PGUSER: postgres
      PGPASSWORD: postgres
      MCP_SERVER_URL: http://mcp-server:3001
    volumes:
      - ../ts_root/backend/src:/app/src
      - ../ts_root/backend/tsconfig.json:/app/tsconfig.json:ro
      - backend_node_modules:/app/node_modules
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://localhost:3000/api/healthz').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 15s

  frontend:
    build:
      context: ../ts_root/frontend
      dockerfile: Dockerfile
    ports:
      - "5173:5173"
    volumes:
      - ../ts_root/frontend:/app
      - frontend_node_modules:/app/node_modules

volumes:
  pgdata:
  backend_node_modules:
  frontend_node_modules:
  mcp_servers_node_modules:
```

Key: MCP server reaches omlx on the host via `host.docker.internal:1234`.

### `infra/docker-compose-prod.yml` (prod)
- Same services with `restart: unless-stopped`, no volume mounts, env vars from host
- MCP server uses `Dockerfile_prod`, no external port exposure (Docker-network only)
- `LLM_BASE_URL` configurable via env for prod deployment

## 5. End-to-End Request Flow

```
POST /api/poems {theme: "ocean"}
  → backend (port 3000) poemController.createPoem
    → MCP client → HTTP Streamable → mcp-server (port 3001)
      → FastMCP calls generate_poem tool
      → LangChain ChatOpenAI → omlx (host:11434) → Qwen3-4B-MLX-4bit
      → Returns poem text
    → Backend inserts poem into PostgreSQL
    → Returns 201 with saved poem
```

## 6. Verification

1. Ensure omlx is running: `curl http://localhost:11434/v1/models`
2. Start stack: `cd infra && docker compose up --build`
3. Test health: `curl http://localhost:3000/api/healthz`
4. Generate poem: `curl -X POST http://localhost:3000/api/poems -H 'Content-Type: application/json' -d '{"theme":"ocean","style":"haiku","length":"short"}'`
5. List poems: `curl http://localhost:3000/api/poems`
6. Get poem: `curl http://localhost:3000/api/poems/1`
