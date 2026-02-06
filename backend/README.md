# Backend

Express.js + TypeScript backend for Kiros AI Support Triage system.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment file:

```bash
cp .env.example .env
```

3. Update `.env` with your LLM API key

4. Start PostgreSQL (from project root):

```bash
docker-compose up -d
```

5. Run development server:

```bash
npm run dev
```

The server will start at `http://localhost:4000`

## API Endpoints

- `GET /health` - Health check
- `GET /api/test-db` - Test database connection
- `POST /api/tickets` - Create new ticket (Phase 2)
- `GET /api/tickets` - List tickets (Phase 2)
- `GET /api/tickets/:id` - Get ticket details (Phase 2)
- `POST /api/tickets/:id/resolve` - Resolve ticket (Phase 2)

## Project Structure

```
backend/
├── src/
│   ├── index.ts          # Server entry point
│   ├── db/
│   │   └── pool.ts       # PostgreSQL connection
│   ├── types/
│   │   └── index.ts      # TypeScript types
│   ├── routes/           # API routes (Phase 2)
│   ├── services/         # Business logic (Phase 2-3)
│   └── worker/           # Background worker (Phase 3)
└── migrations/
    └── 001_initial_schema.sql
```
