# DocuChat AI

An AI-powered web application that lets you upload PDF documents and chat with them using natural language. Ask questions, generate summaries, extract key insights, and more — all powered by large language models.

## Features

- **PDF Upload & Processing** — drag-and-drop PDF upload with automatic text extraction and chunking
- **Conversational Chat** — multi-turn conversations with your documents, with streaming responses
- **BM25 Semantic Search** — finds the most relevant document excerpts for each question (no external vector DB needed)
- **Multiple AI Models** — choose between free (Groq/Llama) and premium (Anthropic Claude) models
- **Plan Tiers** — Free, Pro ($19/mo), Enterprise ($79/mo) with Stripe billing
- **Auth** — email/password registration with optional Google OAuth
- **Dark Mode** — full light/dark theme support

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Prisma ORM + SQLite |
| Auth | NextAuth.js v4 |
| AI (Free) | Groq — Llama 3.1 8B, Llama 3.3 70B |
| AI (Pro) | Anthropic — Claude Haiku 4.5, Claude Sonnet 4.6 |
| Payments | Stripe |
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
| `GROQ_API_KEY` | Yes (free tier) | Get from [console.groq.com](https://console.groq.com) — free |
| `ANTHROPIC_API_KEY` | Pro/Enterprise only | Get from [console.anthropic.com](https://console.anthropic.com) |
| `STRIPE_*` | Optional | Leave empty to disable payments |

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

| Model | Provider | Plans |
|---|---|---|
| Llama 3.1 8B | Groq | Free, Pro, Enterprise |
| Llama 3.3 70B | Groq | Free, Pro, Enterprise |
| Claude Haiku 4.5 | Anthropic | Pro, Enterprise |
| Claude Sonnet 4.6 | Anthropic | Pro, Enterprise |

Free-tier users can choose any Groq model. Pro/Enterprise users can also use Anthropic models. The model selector is available in the chat header.

## Project Structure

```
app/
├── (auth)/           # Login & register pages
├── api/              # API routes
│   ├── documents/    # Upload, list, delete, chat, summary
│   ├── billing/      # Stripe checkout & portal
│   └── webhooks/     # Stripe webhook handler
├── dashboard/        # Protected app pages
│   ├── documents/    # Document list + upload
│   ├── documents/[id]/ # Chat interface
│   ├── billing/      # Plan management
│   └── settings/     # Profile settings
└── page.tsx          # Landing page

lib/
├── ai.ts             # AI routing (picks provider by model)
├── models.ts         # Model registry & plan access rules
├── plans.ts          # Plan limits & features
├── search.ts         # BM25 retrieval
├── pdf.ts            # PDF parsing & chunking
└── providers/
    ├── anthropic.ts  # Claude streaming chat
    └── groq.ts       # Llama streaming chat
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
4. Configure Stripe webhooks to point to `https://your-domain.com/api/webhooks/stripe`

## License

MIT
