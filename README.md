# Tulisin - Academic Writing Assistant for Microsoft Word

An AI-powered writing companion built as a Microsoft Word add-in with an interactive chat panel to assist Indonesian university students and scientific authors directly within their documents.

Repository: [ahmadammarm/tulisin-chatbot](https://github.com/ahmadammarm/tulisin-chatbot)

---

## Overview

Writing academic papers, theses (skripsi, tesis, disertasi), and scientific journal manuscripts requires strict adherence to formal writing standards:
- Indonesian: Pedoman Umum Ejaan Bahasa Indonesia (PUEBI / EYD V), Kamus Besar Bahasa Indonesia (KBBI), and effective sentence construction (kalimat efektif).
- English: Formal scholarly diction, precise academic terminology, and grammatical accuracy for international indexing (Scopus, DOAJ, IEEE).

Tulisin operates directly inside Microsoft Word Desktop as a task pane add-in. Authors can inspect, refine, and paraphrase selected text using natural language directives without leaving their manuscript. Every revision is previewed in the task pane first, so authors decide what goes into the manuscript before anything changes.

---

## Key Features

- Context-Aware Selection: Automatically detects the active cursor position or highlighted text block in Word, alongside surrounding paragraph context, to maintain tone and terminology coherence across the document.
- One-Click Academic Directives:
  - Bakukan (EYD V & KBBI): Standardizes informal Indonesian words and corrects spelling, capitalization, and punctuation.
  - Parafrase Ilmiah: Rewrites sentences in Indonesian or English to enhance fluency and reduce similarity indices while preserving academic meaning.
  - Kalimat Efektif / Conciseness: Eliminates wordy phrases, tautologies, and grammatical redundancies.
  - Academic Tone: Converts casual or first-person narrative into objective, scholarly third-person voice.
- Direct In-Place Editing: Applying a revision replaces the selected text directly, without tracked changes (Track Changes is paused for the edit and restored afterwards). The new text keeps the font, size, and color of the original, and the edit can be undone with Ctrl+Z.
- Change Summary: Shows how many words were added and removed, and tells the author when the text is already fine and no changes are suggested.
- Real-Time Side-by-Side Diff Preview: Displays visual comparisons of original text versus AI-proposed revisions (additions highlighted, deletions struck through) before applying them to the manuscript.
- Bilingual Support: Seamlessly handles academic manuscripts written in standard Indonesian or academic English.

Planned (not yet implemented):

- Citation and Formula Protection: Detects and safeguards in-text citations (such as APA, IEEE, and Vancouver formats) and mathematical notations against unintended alteration during paraphrasing. The MVP relies on prompt instructions only.
- Free-form Conversational Prompt Bar: Enables custom, user-defined directives for nuanced editing (e.g., "Translate to formal academic English using IEEE passive voice").
- Interaction History: Persists revision logs, prompts, and transformation history to allow auditing and review throughout the writing process.
- Mixed Formatting Preservation: The revision takes the formatting of the selection's first word; mixed formatting inside the selection (bold, italic, footnotes) is not preserved.

---

## Architecture and System Design

Tulisin is designed around a decoupled client-server architecture:

```text
+-------------------------------------------------------------------+
|                     Microsoft Word Desktop                        |
|                                                                   |
|   +-----------------------+         +-------------------------+   |
|   | Document Body         |         | Tulisin Task Pane (UI)  |   |
|   |                       |         |                         |   |
|   |  - Active Selection   |<------->|  - Next.js / React 19   |   |
|   |  - Surrounding Text   |Office.js|  - shadcn/ui + Tailwind |   |
|   |  - Text Replace API   |         |  - Diff Viewer & Chat   |   |
|   +-----------------------+         +------------+------------+   |
+--------------------------------------------------|----------------+
                                                   | HTTPS / JSON
                                                   v
                                      +-------------------------+
                                      | Next.js App Router API  |
                                      |                         |
                                      | - Academic Prompts      |
                                      | - Citation Safeguard    |
                                      | - History Storage       |
                                      +------------+------------+
                                                   |
                                                   v
                                      +-------------------------+
                                      |   Google Gemini Model   |
                                      |                         |
                                      +-------------------------+
```

1. Client (Word Task Pane):
   - Built with Next.js (App Router), React 19, TypeScript, Tailwind CSS, and shadcn/ui.
   - Interfaces with the active Word document using the Microsoft Office JavaScript API (`Office.js`).
   - Reads active selection and neighboring paragraphs, passes them to the backend, and replaces the selection in place once the author applies a revision.

2. Backend API and Processing:
   - Next.js route handlers orchestrating prompt construction and streaming responses.
   - Communicates with Google Gemini models for fast, context-rich inference.
   - Enforces linguistic constraints (EYD V, KBBI, academic tone) and citation boundaries.

3. Storage:
   - Persistence layer for session history, prompts, and accepted revisions.

---

## Tech Stack

- Package Manager: pnpm
- Framework: Next.js (App Router), React 19, TypeScript
- Styling and Components: Tailwind CSS, shadcn/ui, Lucide React
- Office Integration: Microsoft Office Add-ins API (`Office.js` / Word JavaScript API)
- AI Engine: Google Gemini models
- Target Environment: Microsoft Word Desktop (Windows / macOS)

---

## Getting Started

### Prerequisites

- Node.js (v18.18.0 or later)
- pnpm (v9 or later recommended)
- Microsoft Word Desktop (Windows 10/11 or macOS with Microsoft 365)
- Google Gemini API Key (obtained from Google AI Studio)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ahmadammarm/tulisin-chatbot.git
   cd tulisin-chatbot
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env.local` and fill in the values:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-3.5-flash-lite
   ```

4. Run the development server:
   ```bash
   pnpm dev
   ```
   The application will be accessible at `http://localhost:3000`. Outside Word, the task pane runs in preview mode against an in-memory sample document, so you can develop the UI in a normal browser.

### Scripts

| Script | Purpose |
|---|---|
| `pnpm dev` | Dev server over HTTP (browser preview mode) |
| `pnpm dev:https` | Dev server over HTTPS with the Office dev certificates (for Word) |
| `pnpm certs:install` | Generate and trust the Office dev certificates |
| `pnpm manifest:validate` | Validate `manifest.xml` |
| `pnpm lint` | ESLint with strict type-aware rules (`any` and `unknown` are banned) |
| `pnpm typecheck` | TypeScript type check |
| `pnpm test` | Vitest unit tests |

### Sideloading the Add-in in Microsoft Word Desktop

To run the add-in inside Word Desktop during local development:

1. Configure Local HTTPS:
   Office Add-ins require HTTPS with a certificate Word trusts. Install the Office dev certificates once, then start the HTTPS dev server:
   ```bash
   pnpm certs:install
   pnpm dev:https
   ```

2. Manifest Configuration:
   `manifest.xml` points to `https://localhost:3000` and requires Word API 1.4 (needed to pause Track Changes while applying). Check it with `pnpm manifest:validate`.

3. Sideload on Windows:
   - Create a local shared network folder (e.g., `C:\WordAddinCatalog`).
   - Place `manifest.xml` into this folder.
   - In Word Desktop, go to File > Options > Trust Center > Trust Center Settings > Trusted Add-in Catalogs.
   - Add the folder path and check "Show in Menu".
   - Restart Word, open an empty document, navigate to Insert > My Add-ins > Shared Folder, and select Tulisin.

4. Sideload on macOS:
   - Place `manifest.xml` into `/Users/<username>/Library/Containers/com.microsoft.Word/Data/Documents/wef`.
   - Open Word, navigate to Insert > My Add-ins dropdown, and open Tulisin.

---

## Project Structure

```text
tulisin-chatbot/
|-- public/assets/                # Add-in icons
|-- scripts/dev-https.mjs         # HTTPS dev server using Office dev certificates
|-- src/
|   |-- app/                      # Next.js routes only: layout, page, api/assist/route.ts
|   |-- components/ui/            # shadcn/ui primitives (generated, do not edit by hand)
|   |-- features/                 # Feature code, one folder per feature
|   |   |-- assist/
|   |   |   |-- api/              # Client fetch wrapper for /api/assist
|   |   |   |-- components/       # RevisionPanel
|   |   |   |-- hooks/            # useAssist
|   |   |   |-- model/            # Schema, prompts, reducer, output sanitizing
|   |   |   `-- server/           # Gemini revision streaming (server-only)
|   |   |-- directives/           # Action registry (model/) and its chips (components/)
|   |   |-- document/             # Office.js and mock adapters, selection hooks and card
|   |   `-- task-pane/            # Composes the features into the task pane
|   |-- lib/                      # Generic, feature-agnostic modules (import via barrel)
|   |   |-- config/               # Zod-validated server env (server-only)
|   |   |-- diff/                 # Word-level diff and change summary
|   |   |-- errors/               # AppError, error codes, toAppError
|   |   |-- gemini/               # Gemini client (server-only) and its test-facing type
|   |   |-- text/                 # Whitespace and word helpers
|   |   `-- ui/                   # cn() class merging
|   `-- shared/                   # App-specific code shared across features
|       |-- components/           # DiffView, StatusBanner
|       |-- constants/            # strings.ts: all Indonesian UI copy
|       `-- types/                # Cross-feature types (selection, status)
|-- tests/
|   |-- helpers/                  # Test doubles (fake Gemini, server-only stub)
|   |-- integration/              # API route and Gemini streaming
|   `-- unit/                     # Pure logic: prompts, reducer, diff, text, adapters
|-- manifest.xml                  # Microsoft Office Add-in manifest
`-- vitest.config.mts             # Test runner config
```

### Where new code goes

| Code | Location |
|---|---|
| Generic helper with no app knowledge | `src/lib/<module>/`, exported from its `index.ts` |
| Code used by more than one feature | `src/shared/` (`components/`, `constants/`, `types/`) |
| Code for one feature | `src/features/<feature>/` in `api/`, `components/`, `hooks/`, `model/`, or `server/` |
| A new one-click action | One entry in `src/features/directives/model/directives.ts` plus its icon |
| UI text | `src/shared/constants/strings.ts` |
| Tests | `tests/unit/` or `tests/integration/`, named `<subject>.test.ts`; helpers in `tests/helpers/` |

### Import rules (enforced by ESLint)

- Use the `@/` alias for `src/` and `@tests/` for `tests/`. Relative imports are only for files in the same folder.
- Import lib modules through their barrel (`@/lib/text`), never a file inside them (`@/lib/text/words`).
- Client code (`components/`, `hooks/`, `features/*/api/`) must not import server-only modules (`@/lib/gemini`, `@/lib/config`, `features/*/server/`).
- `any` and `unknown` are banned. External data goes through a Zod schema; caught errors go through `toAppError` (the only file allowed to use `unknown`).

---

## Contributing

Contributions are welcome. Please open an issue to discuss proposed enhancements before submitting a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m "Add your feature"`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.
