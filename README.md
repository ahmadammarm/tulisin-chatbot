# Tulisin - Academic Writing Assistant for Microsoft Word

An AI-powered writing companion built as a Microsoft Word add-in with an interactive chat panel to assist Indonesian university students and scientific authors directly within their documents.

Repository: [ahmadammarm/tulisin-chatbot](https://github.com/ahmadammarm/tulisin-chatbot)

---

## Overview

Writing academic papers, theses (skripsi, tesis, disertasi), and scientific journal manuscripts requires strict adherence to formal writing standards:
- Indonesian: Pedoman Umum Ejaan Bahasa Indonesia (PUEBI / EYD V), Kamus Besar Bahasa Indonesia (KBBI), and effective sentence construction (kalimat efektif).
- English: Formal scholarly diction, precise academic terminology, and grammatical accuracy for international indexing (Scopus, DOAJ, IEEE).

Tulisin operates directly inside Microsoft Word Desktop as a task pane add-in. Authors can inspect, refine, and paraphrase selected text using natural language directives without leaving their manuscript. Crucially, Tulisin integrates with native Microsoft Word Track Changes, ensuring authors and thesis advisors retain full agency over which revisions are accepted or rejected.

---

## Key Features

- Context-Aware Selection: Automatically detects the active cursor position or highlighted text block in Word, alongside surrounding paragraph context, to maintain tone and terminology coherence across the document.
- One-Click Academic Directives:
  - Bakukan (EYD V & KBBI): Standardizes informal Indonesian words and corrects spelling, capitalization, and punctuation.
  - Parafrase Ilmiah: Rewrites sentences in Indonesian or English to enhance fluency and reduce similarity indices while preserving academic meaning.
  - Kalimat Efektif / Conciseness: Eliminates wordy phrases, tautologies, and grammatical redundancies.
  - Academic Tone: Converts casual or first-person narrative into objective, scholarly third-person voice.
- Native Word Track Changes: Inserts suggested revisions directly into the document using Word's native change tracking system, allowing authors and advisors to accept or reject edits individually.
- Real-Time Side-by-Side Diff Preview: Displays visual comparisons of original text versus AI-proposed revisions (additions highlighted, deletions struck through) before applying them to the manuscript.
- Citation and Formula Protection: Detects and safeguards in-text citations (such as APA, IEEE, and Vancouver formats) and mathematical notations against unintended alteration during paraphrasing.
- Bilingual Support: Seamlessly handles academic manuscripts written in standard Indonesian or academic English.
- Free-form Conversational Prompt Bar: Enables custom, user-defined directives for nuanced editing (e.g., "Translate to formal academic English using IEEE passive voice").
- Interaction History: Persists revision logs, prompts, and transformation history to allow auditing and review throughout the writing process.

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
|   |  - Track Changes API  |         |  - Diff Viewer & Chat   |   |
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
   - Reads active selection and neighboring paragraphs, passes them to the backend, and applies changes via Word's native track changes API.

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
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=your_gemini_model_here
   ```

4. Run the development server:
   ```bash
   pnpm dev
   ```
   The application will be accessible at `http://localhost:3000`.

### Sideloading the Add-in in Microsoft Word Desktop

To run the add-in inside Word Desktop during local development:

1. Configure Local HTTPS:
   Office Add-ins require HTTPS. You can configure an HTTPS dev server using tools such as `office-addin-dev-certs` or a local reverse proxy like `mkcert`.
   ```bash
   pnpm dlx office-addin-dev-certs install
   ```

2. Manifest Configuration:
   Verify that `manifest.xml` points to your development URL (`https://localhost:3000`).

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
|-- public/                   # Static assets, icons, and branding
|-- src/
|   |-- app/                  # Next.js App Router
|   |   |-- api/              # AI backend routes
|   |   |   |-- assist/       # Gemini streaming and prompt handlers
|   |   |   `-- history/      # Interaction history persistence
|   |   |-- globals.css       # Tailwind CSS styles
|   |   |-- layout.tsx        # Root HTML shell with Office.js script tag
|   |   `-- page.tsx          # Task pane main interface
|   |-- components/           # React UI components
|   |   |-- chat/             # Chat panel and custom prompt bar
|   |   |-- diff/             # Side-by-side diff preview component
|   |   |-- directives/       # Quick action chips (EYD, Paraphrase, etc.)
|   |   |-- history/          # Revision history drawer
|   |   `-- ui/               # Reusable shadcn/ui primitives
|   `-- lib/                  # Utilities and business logic
|       |-- gemini.ts         # Google Gemini client configuration
|       |-- office.ts         # Office.js document interaction helpers
|       |-- prompts.ts        # Indonesian & English academic prompt templates
|       `-- utils.ts          # General helper functions
|-- manifest.xml              # Microsoft Office Add-in manifest
|-- package.json              # Project dependencies and scripts
|-- pnpm-lock.yaml            # pnpm lockfile
|-- tsconfig.json             # TypeScript configuration
`-- README.md                 # Project documentation
```

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
