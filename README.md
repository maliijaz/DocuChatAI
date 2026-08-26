# DocuChat AI

A free, AI-powered web application that lets you upload PDF documents and chat with them using natural language. Ask questions, generate summaries, extract key insights, and more.

## Features

- **PDF Upload & Processing** — drag-and-drop PDF upload with automatic text extraction and chunking
- **Conversational Chat** — multi-turn conversations with your documents, with streaming responses
- **Conversation History** — every chat is saved; switch between past conversations or start a new one per document
- **Document Summaries & Key Insights** — generate a structured summary or extract the most important points on demand
- **BM25 Search** — finds the most relevant document excerpts for each question (no external vector DB needed)
- **Multiple Free AI Models** — choose between fast and more capable Llama models via Groq
- **100% Free** — no plans, no limits beyond generous per-account fair-use caps, no credit card
- **Auth** — email/password registration with optional Google OAuth
- **Dark Mode** — full light/dark theme support

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Prisma ORM + SQLite |
| Auth | NextAuth.js v4 |
| AI | Groq — GPT-OSS 20B, GPT-OSS 120B |
| PDF Parsing | pdf-parse |

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
| `DATABASE_URL` | Yes | SQLite path — keep as `file:./dev.db` for local dev |
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
| Llama 3.1 8B | Groq |
| Llama 3.3 70B | Groq |

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

The app is ready to deploy to any Node.js platform (Vercel, Railway, Render, etc.).

For production:
1. Set `NEXTAUTH_URL` to your public domain
2. Set `NEXT_PUBLIC_APP_URL` to your public domain
3. Use a PostgreSQL database and update `DATABASE_URL` + `prisma/schema.prisma` datasource provider

## License

MIT
