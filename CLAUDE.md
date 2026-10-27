<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Tulisin

Microsoft Word task-pane add-in that revises academic text (Indonesian or English) with Gemini. The user selects text, picks a one-click action, previews a word-level diff, and applies it; the selection is replaced in place.

Stack: Next.js 16 (App Router, React Compiler), React 19, Tailwind v4, shadcn/ui (Base UI), Office.js, `@google/genai`, Zod v4, Vitest. Package manager: **pnpm**.

## Commands

```bash
pnpm dev                # browser preview at http://localhost:3000 (mock document)
pnpm dev:https          # HTTPS dev server for Word (needs `pnpm certs:install` once)
pnpm lint               # strict type-aware ESLint
pnpm typecheck          # next typegen + tsc
pnpm test               # Vitest (tests/unit, tests/integration)
pnpm build
pnpm manifest:validate  # validate manifest.xml
```

Run `pnpm lint && pnpm typecheck && pnpm test` before finishing any change.

## Flow

1. `features/document` reads the Word selection plus the paragraphs around it through a `DocumentAdapter` (Office.js in Word, in-memory mock in the browser in development).
2. `features/assist/api` POSTs to `app/api/assist/route.ts`, which validates with Zod and streams plain text from `features/assist/server/stream-revision.ts` (Gemini).
3. `features/assist/model/assist-reducer.ts` is the state machine: idle → streaming → ready → applying → applied, or failed. `hasChanges` is false when the revision differs only in whitespace, and the reducer refuses to apply it.
4. Applying replaces the selection directly: Track Changes is paused and then restored, and the revision takes the first word's font name, size, and color.

## Structure

- `src/app/`: routes only.
- `src/components/ui/`: generated shadcn primitives.
- `src/features/<feature>/`: `api/`, `components/`, `hooks/`, `model/`, `server/`, `adapters/` as needed.
- `src/lib/<module>/`: generic modules (`config`, `diff`, `errors`, `gemini`, `text`, `ui`), each exported from `index.ts`.
- `src/shared/`: code shared across features (`components/`, `constants/strings.ts`, `types/`).
- `tests/unit`, `tests/integration`, `tests/helpers`: tests live outside `src`, named `<subject>.test.ts`.

To add a one-click action, add an entry to `src/features/directives/model/directives.ts` and its icon in `directive-chips.tsx`. All UI copy is Indonesian and lives in `src/shared/constants/strings.ts`.

## Rules

- **No `any` or `unknown`.** Both are lint errors. Parse external data with Zod. Convert caught errors with `toAppError` in `src/lib/errors/app-error.ts`, the only file allowed to use `unknown`.
- **Use `type`, not `interface`.** Model state as discriminated unions and handle every case in a `switch` (`switch-exhaustiveness-check`).
- **Imports.** Use `@/` for `src` and `@tests/` for `tests`; relative imports only within the same folder. Import lib modules through their barrel (`@/lib/text`, not `@/lib/text/words`).
- **Server code stays on the server.** Client code (`components/`, `hooks/`, `features/*/api/`) must not import `@/lib/gemini`, `@/lib/config`, or `features/*/server/*`. ESLint enforces this.
- **No manual memoization.** The React Compiler is on, so skip `useMemo` and `useCallback`.

## Gotchas

- **Office.js and the router.** Office.js nulls `history.pushState` and `replaceState` inside Office hosts. `src/app/layout.tsx` saves them before Office.js loads and restores them after, using ordered `beforeInteractive` scripts. Keep that order.
- **Gemini 3.x sampling params.** Gemini 3.x ignores `temperature`, `topP`, and `topK`, and later models reject them. Don't send them. The model comes from the `GEMINI_MODEL` env var (default `gemini-3.5-flash-lite`).
- **Gemini SDK stream type.** The SDK types its stream's return value as `any`. `textChunks()` in `stream-revision.ts` re-types it; keep that wrapper.
- **ESLint and typescript-eslint.** `eslint-config-next` already registers the `@typescript-eslint` plugin, so `eslint.config.mjs` takes only the rules from the typescript-eslint presets. Re-adding the presets whole crashes ESLint with "Cannot redefine plugin".
- **Word line endings.** Word uses `\r` line endings. Compare text with `normalizeWhitespace` from `@/lib/text`, and keep the selection's edge whitespace (`preserveEdgeWhitespace`) so the paragraph mark survives.
- **Word API version.** `manifest.xml` requires WordApi 1.4, which is needed for `changeTrackingMode`.
- **pnpm build scripts.** `pnpm-workspace.yaml` disables the install scripts of `@google/genai`, `protobufjs`, and `unrs-resolver` on purpose; none of them are needed.
- **No `AGENTS.md`.** The Next.js block lives at the top of this file, so `next dev` doesn't recreate `AGENTS.md`. Keep the block word for word; if it changes, `next dev` rewrites it.
