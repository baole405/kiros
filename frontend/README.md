# Frontend

Next.js 14 frontend for Kiros AI Support Triage system.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local`:

```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:4000/api" > .env.local
```

3. Run development server:

```bash
npm run dev
```

The app will start at `http://localhost:3000`

## Pages

- `/submit` - Ticket submission form (Phase 4)
- `/dashboard` - Agent dashboard list view (Phase 4)
- `/dashboard/[id]` - Ticket detail view (Phase 4)

## Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # Reusable UI components
│   ├── lib/             # API client, utilities
│   └── types/           # TypeScript types
└── public/              # Static assets
```
