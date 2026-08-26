# DocuChat AI

A free, AI-powered web application that lets you upload PDF documents and chat with them using natural language. Ask questions, generate summaries, extract key insights, and more.

**🔗 Live app: [docuchat-ai-seven.vercel.app](https://docuchat-ai-seven.vercel.app)**

## Features

- **PDF Upload & Processing** — drag-and-drop PDF upload with automatic text extraction and chunking
- **Conversational Chat** — multi-turn conversations with your documents, with streaming responses
- **Conversation History** — every chat is saved; switch between past conversations or start a new one per document
- **Document Summaries & Key Insights** — generate a structured summary or extract the most important points on demand
- **BM25 Search** — finds the most relevant document excerpts for each question (no external vector DB needed)
- **Multiple Free AI Models** — choose between fast and more capable open-weight models via Groq
- **100% Free** — no plans, no limits beyond generous per-account fair-use caps, no credit card
- **Auth** — email/password registration with optional Google OAuth
- **Dark Mode** — full light/dark theme support

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Prisma ORM + Postgres (e.g. Neon) |
| Auth | NextAuth.js v4 |
| AI | Groq — GPT-OSS 20B, GPT-OSS 120B |
| PDF Parsing | unpdf |

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/docuchat-ai.git
cd docuchat-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in the required values:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Pooled Postgres connection string (e.g. from a free [Neon](https://neon.tech) project) |
| `DATABASE_URL_UNPOOLED` | Yes | Direct (non-pooled) Postgres connection string, used by Prisma for schema pushes |
| `NEXTAUTH_SECRET` | Yes | Run `openssl rand -base64 32` to generate |
| `GROQ_API_KEY` | Yes | Get a free key from [console.groq.com](https://console.groq.com) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional | Enables "Sign in with Google" |

### 4. Set up the database

```bash
npx prisma db push
```

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Models

| Model | Provider |
|---|---|
| GPT-OSS 20B | Groq |
| GPT-OSS 120B | Groq |

All models are free for every user. The model selector is available in the chat header.

## Project Structure

```
app/
├── (auth)/           # Login & register pages
├── api/              # API routes
│   └── documents/    # Upload, list, delete, chat, summary, insights
├── dashboard/        # Protected app pages
│   ├── documents/    # Document list + upload
│   ├── documents/[id]/ # Chat interface
│   └── settings/     # Profile settings
└── page.tsx          # Landing page

lib/
├── ai.ts             # AI routing (Groq)
├── models.ts         # Model registry
├── limits.ts         # Upload limits (doc count, file size)
├── search.ts         # BM25 retrieval
├── pdf.ts             # PDF parsing & chunking
└── providers/
    └── groq.ts        # Llama streaming chat, summaries & insights
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npx prisma db push` | Apply schema changes to database |
| `npx prisma studio` | Visual database browser |

## Deployment

The app is deployed for free on **Vercel** (Hobby plan) with a **Neon** Postgres database (also free, provisioned via Vercel's marketplace integration). No local disk is used anywhere — uploaded PDFs are parsed entirely in memory during the upload request, so nothing needs a persistent filesystem, which makes the app a good fit for serverless hosting.

To deploy your own copy:

1. `vercel link` to create/link a Vercel project.
2. `vercel install neon --plan free_v3` to provision a free Postgres database and auto-populate `DATABASE_URL` / `DATABASE_URL_UNPOOLED`.
3. Set the remaining env vars with `vercel env add`: `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`), `GROQ_API_KEY`, `NEXTAUTH_URL`, and `NEXT_PUBLIC_APP_URL` (the last two should be your Vercel production domain).
4. `npx prisma db push` once, pointed at the new database, to create the schema.
5. `vercel deploy --prod`.

The `postinstall` script (`prisma generate`) is required for Prisma Client to regenerate correctly on Vercel's cached-dependency builds.

## License

MIT
