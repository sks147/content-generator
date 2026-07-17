# Mantine Design System + Poem UI

## Context

The frontend (`ts_root/frontend`) is an untouched TanStack Start scaffold with 5 files — zero components, zero API code. The backend already has working poem endpoints (`POST /api/poems`, `GET /api/poems`, `GET /api/poems/:id`) backed by an MCP/LLM pipeline. The `ts_root/shared` package exports `Poem` and `PoemInput` types and is already wired to the backend via `"shared": "file:../shared"`. The user wants to:

1. Install official Mantine Claude skills from `mantinedev/skills`
2. Update the `react-dev` agent to use Mantine skills
3. Build a basic poem list + generate UI using Mantine components
4. Wire the shared types package to the frontend (no code duplication)

---

## Part 1: Install Mantine Claude Skills

**Source**: `github.com/mantinedev/skills` (MIT, commit `222191c6`)

Three skills to vendor, each with `SKILL.md` + `references/{api.md, patterns.md}`:
- `mantine-combobox` — dropdown/select/autocomplete primitives
- `mantine-form` — `useForm`, validation, nested fields
- `mantine-custom-components` — `factory()`, Styles API, theming

**Layout**: Flat under `.claude/skills/` (Claude Code discovers skills at exactly one nesting level):
```
.claude/skills/
  mantine-combobox/SKILL.md, references/{api.md, patterns.md}
  mantine-form/SKILL.md, references/{api.md, patterns.md}
  mantine-custom-components/SKILL.md, references/{api.md, patterns.md}
```

**Action**: Fetch all 9 files via `gh api` and write them to `.claude/skills/`.

---

## Part 2: Update `react-dev` Agent

File: `.claude/agents/react-dev.md`

Current `tools: [Read, Write, Edit, Glob, Grep, Bash]` — missing `Skill`, so the agent cannot invoke any skills.

**Change**: Add `Skill` to the tools list:
```yaml
tools: [Read, Write, Edit, Glob, Grep, Bash, Skill]
```

---

## Part 3: Wire Shared Package to Frontend

The shared package (`ts_root/shared`) already exports `Poem` and `PoemInput` types via its `.` entry point. The `./mcp` subpath is deliberately Node-gated (`"default": null`) — browser-safe to import `.` only.

### 3a. Add shared dependency to frontend `package.json`

Same pattern as backend:
```json
"shared": "file:../shared"
```

### 3b. Add TS project reference to frontend `tsconfig.json`

Same pattern as backend:
```json
"references": [{ "path": "../shared" }]
```

### 3c. Add shared types needed by frontend

Add to `ts_root/shared/src/types/poem.ts`:
- `PoemListResponse` — `{ poems: Poem[], total: number }` (matches `GET /api/poems` response)
- `CreatePoemParams` — `{ theme: string, style?: string, length?: string }` (matches `POST /api/poems` body)
- `PoemStyle` / `PoemLength` string literal union types
- `POEM_STYLES` / `POEM_LENGTHS` const arrays

Re-export new types from `ts_root/shared/src/index.ts`.

### 3d. Update frontend Dockerfile

Current Dockerfile uses `WORKDIR /app` and copies only frontend files. Needs to match the backend pattern (`context: ../ts_root`, install shared first):

```dockerfile
FROM node:26.5.0-slim

WORKDIR /shared
COPY shared/package.json shared/package-lock.json ./
RUN npm ci

WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 5173

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npx", "vite", "dev", "--port", "5173", "--host", "0.0.0.0"]
```

### 3e. Update `docker-compose.yml` frontend service

Change build context and add shared volume mount:
```yaml
frontend:
  build:
    context: ../ts_root
    dockerfile: frontend/Dockerfile
  volumes:
    - ../ts_root/frontend:/app
    - ../ts_root/shared:/shared
    - frontend_node_modules:/app/node_modules
```

### 3f. Rebuild shared

Run `npm run build` in `ts_root/shared/` to ensure dist is up to date after adding new types.

---

## Part 4: Install Mantine Dependencies

Run from `ts_root/frontend/`:
```bash
npm install --save-exact \
  @mantine/core@9.4.1 \
  @mantine/hooks@9.4.1 \
  @mantine/form@9.4.1 \
  postcss@8.5.19 \
  postcss-preset-mantine@1.18.0 \
  postcss-simple-vars@7.0.1
```

Mantine 9.4.1 requires React `>=19.2.0` (project has 19.2.7). PostCSS plugins required for Mantine's `light-dark()` mixin and `rem()` function support.

---

## Part 5: Configure Mantine + Tailwind Coexistence

### 5a. New file: `postcss.config.cjs`

Standard Mantine PostCSS config with breakpoint vars. Uses `.cjs` because project is `"type": "module"`. Tailwind v4 runs via `@tailwindcss/vite` plugin (not PostCSS), so no conflict.

### 5b. Modify `src/styles.css`

Import Mantine CSS before Tailwind:
```css
@import "@mantine/core/styles.css";
@import "tailwindcss";
/* ...existing resets... */
```

### 5c. Modify `src/routes/__root.tsx`

- Import `ColorSchemeScript`, `MantineProvider` from `@mantine/core`
- Add `ColorSchemeScript` inside `<head>` in `shellComponent`
- Add `component: RootLayout` — wraps `<Outlet />` in `MantineProvider` + `AppLayout`
- Import `Outlet` from `@tanstack/react-router`
- Update page title to "Poem Generator"

### 5d. New file: `.env`

```
VITE_API_URL=http://localhost:3000
```

---

## Part 6: Build Poem UI

### New file structure

```
src/
  api/client.ts              — fetch wrapper with base URL + error class
  api/poems.ts               — fetchPoems(), createPoem() using shared types
  components/AppLayout.tsx   — Mantine AppShell with header
  components/PoemCard.tsx    — Card displaying a single poem
  components/PoemGrid.tsx    — Responsive grid + loading/empty/error states
  components/PoemGenerateForm.tsx  — useForm with theme/style/length inputs
  components/PoemGenerateModal.tsx — Modal wrapping the form
```

No `src/types/` directory — types imported from `shared` package.

### API layer (`src/api/`)

- `client.ts`: `apiFetch<T>(path, options)` — prepends `VITE_API_URL`, throws `ApiRequestError` on non-OK
- `poems.ts`: `fetchPoems(limit, offset)`, `createPoem(params)` — thin typed wrappers using `Poem`, `PoemListResponse`, `CreatePoemParams` from shared

Client-side fetch only (no SSR data loading). Backend CORS is `*`, so browser at `:5173` can call `:3000` directly.

### Components

| Component | Mantine components used | Purpose |
|---|---|---|
| `AppLayout` | `AppShell`, `AppShell.Header`, `AppShell.Main`, `Group`, `Title` | Page shell with header |
| `PoemCard` | `Card`, `Text`, `Badge`, `Group` | Single poem (theme title, style/length badges, content, date) |
| `PoemGrid` | `SimpleGrid`, `Skeleton`, `Center`, `Stack`, `Text`, `Alert` | Responsive grid, loading skeletons, empty state, error alert |
| `PoemGenerateForm` | `TextInput`, `Select`, `Button`, `Stack` + `useForm` | Theme input (validated), style/length selects using `POEM_STYLES`/`POEM_LENGTHS` from shared |
| `PoemGenerateModal` | `Modal` | Wraps form, prevents close during slow LLM generation |

### Route (`src/routes/index.tsx`)

State: `poems[]`, `isLoading`, `fetchError`, `isSubmitting`, `submitError`, `modalOpened` (via `useDisclosure`).

- On mount: fetch poems via `useEffect` + `fetchPoems()`
- Generate: open modal -> submit form -> `createPoem()` -> prepend to local array -> close modal
- Error handling: separate fetch vs submit error states

---

## Verification

1. `cd ts_root/shared && npm run build` succeeds with new types
2. `cd ts_root/frontend && npm install` resolves shared + Mantine deps
3. `npm run build` passes (TypeScript compiles, Vite bundles)
4. `npm run dev` starts dev server on `:5173`
5. Page loads with Mantine AppShell layout and "Poems" header
6. Empty state shows "No poems yet" message
7. "Generate Poem" button opens modal with form
8. Form validates (empty theme shows error)
9. If backend running: form submission generates a poem, card appears in grid
10. If backend down: error notification displays cleanly

---

## Not in scope

- SSR data loading / `createServerFn` (avoids URL split complexity)
- TanStack Query integration (upgrade path for later)
- Pagination (backend supports it; UI can add later)
- Individual poem detail page / route
- Dark mode toggle (MantineProvider supports it; just no toggle UI yet)
