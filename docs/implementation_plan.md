# Implementation Plan - AI Support Triage & Recovery Hub

## Overview

Build a Full Stack MVP for Kiros technical assessment: an AI-powered ticket triage system with async processing.

**Timeline**: 7 days  
**Tech Stack**: Next.js, Express.js, PostgreSQL, LLM API (Gemini/Groq)

---

## Project Structure

```
kiros/
├── frontend/                 # Next.js App Router
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx           # Home - redirect or landing
│   │   │   ├── submit/
│   │   │   │   └── page.tsx       # Ticket submission form
│   │   │   └── dashboard/
│   │   │       ├── page.tsx       # Agent dashboard list
│   │   │       └── [id]/
│   │   │           └── page.tsx   # Ticket detail view
│   │   ├── components/            # Reusable UI components
│   │   ├── lib/                   # API client, utils
│   │   └── types/                 # TypeScript types
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/                  # Express.js + TypeScript
│   ├── src/
│   │   ├── index.ts               # Server entry point
│   │   ├── routes/
│   │   │   └── tickets.ts         # Ticket API routes
│   │   ├── services/
│   │   │   ├── ticketService.ts   # Business logic
│   │   │   └── aiService.ts       # LLM integration
│   │   ├── worker/
│   │   │   └── processor.ts       # Background worker
│   │   ├── db/
│   │   │   ├── pool.ts            # PostgreSQL connection
│   │   │   └── queries.ts         # SQL queries
│   │   └── types/                 # TypeScript types
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── package.json
│
├── docker-compose.yml        # Local dev setup
├── .env.example              # Environment template
└── README.md                 # Setup instructions
```

---

## Phase-by-Phase Implementation

### Phase 1: Project Setup (Day 1)

#### 1.1 Initialize Backend

```bash
mkdir backend && cd backend
npm init -y
npm install express cors dotenv pg
npm install -D typescript @types/node @types/express @types/cors @types/pg ts-node nodemon
npx tsc --init
```

#### 1.2 Initialize Frontend

```bash
npx create-next-app@latest frontend --typescript --tailwind --app --src-dir
```

#### 1.3 Docker Compose

```yaml
version: "3.8"
services:
  postgres:
    image: postgres:15
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: kiros_triage
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./backend/migrations:/docker-entrypoint-initdb.d
volumes:
  pgdata:
```

#### 1.4 Run Migrations

Execute `001_initial_schema.sql` on container start.

---

### Phase 2: Backend Core (Day 2-3)

#### 2.1 Database Connection (`db/pool.ts`)

- Configure `pg.Pool` with connection string from env
- Handle connection errors gracefully

#### 2.2 POST /tickets (`routes/tickets.ts`)

**Key Constraint**: Return 201 immediately, no AI blocking

```typescript
router.post("/tickets", async (req, res) => {
  // 1. Validate input
  // 2. Insert into DB (status = 'pending')
  // 3. Return 201 with ticket_id
  // NO AI CALL HERE - worker handles it
});
```

#### 2.3 GET /tickets

- Join `tickets` + `ticket_ai_results`
- Support pagination and filters
- Return list with urgency color hints

#### 2.4 GET /tickets/:id

- Fetch single ticket with AI result
- Return 404 if not found

#### 2.5 POST /tickets/:id/resolve

- Update status to `resolved`
- Optionally update final_reply
- Validate current status allows resolve

---

### Phase 3: Background Worker (Day 3-4)

#### 3.1 Polling Mechanism (`worker/processor.ts`)

```typescript
const POLL_INTERVAL = 5000; // 5 seconds

async function processTickets() {
  const pending = await getPendingTickets(10);

  for (const ticket of pending) {
    await markAsProcessing(ticket.id);

    try {
      const aiResult = await callLLM(ticket.content);
      const validated = validateAIResponse(aiResult);
      await saveAIResult(ticket.id, validated);
      await markAsProcessed(ticket.id);
    } catch (error) {
      await markAsFailed(ticket.id);
      console.error("AI processing failed:", error);
    }
  }
}

setInterval(processTickets, POLL_INTERVAL);
```

#### 3.2 LLM Integration (`services/aiService.ts`)

- Choose provider: Gemini (free tier) or Groq (fast)
- Craft prompt for structured JSON output
- Parse and validate response

**Prompt Template**:

```
Analyze this customer complaint and return valid JSON:

Complaint: "${content}"

Return exactly this JSON format:
{
  "category": "billing" | "technical" | "feature_request",
  "sentiment_score": 1-10,
  "urgency": "high" | "medium" | "low",
  "draft_reply": "polite response"
}
```

#### 3.3 JSON Validation (`services/aiService.ts`)

- Check all required fields exist
- Validate ENUM values
- Validate sentiment_score range 1-10
- Retry with stricter prompt if invalid

---

### Phase 4: Frontend (Day 4-5)

#### 4.1 API Client (`lib/api.ts`)

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function createTicket(data: CreateTicketRequest) { ... }
export async function getTickets(params?: TicketFilters) { ... }
export async function getTicket(id: number) { ... }
export async function resolveTicket(id: number, reply?: string) { ... }
```

#### 4.2 Ticket Submission Form (`/submit`)

- Email input (optional)
- Complaint textarea (required, min 10 chars)
- Submit button with loading state
- Success message with ticket ID

#### 4.3 Agent Dashboard (`/dashboard`)

- Fetch tickets with polling (refresh every 10s)
- Cards/rows with color-coded urgency:
  - 🔴 Red = High urgency
  - 🟡 Yellow/Orange = Medium urgency
  - 🟢 Green = Low urgency
- Filter tabs: All / Pending / Processed / Resolved
- Click to navigate to detail page

#### 4.4 Ticket Detail View (`/dashboard/[id]`)

- Display full complaint text
- Show AI analysis: category, sentiment, urgency
- Editable textarea for draft_reply
- "Save & Resolve" button
- Back to dashboard link

---

### Phase 5: Testing & Polish (Day 5-6)

#### 5.1 Manual Test Cases

| #   | Test Case                     | Expected Result                                  |
| --- | ----------------------------- | ------------------------------------------------ |
| 1   | Submit ticket                 | 201 response < 100ms, status = pending           |
| 2   | Wait 10s                      | Status changes to processed, AI result populated |
| 3   | View dashboard                | Tickets show with correct urgency colors         |
| 4   | View detail                   | All AI fields displayed correctly                |
| 5   | Edit & resolve                | Status changes to resolved                       |
| 6   | Submit malformed LLM response | Graceful error, status = ai_failed               |

#### 5.2 Edge Cases to Handle

- [ ] Empty complaint text → validation error
- [ ] LLM timeout → retry logic, then ai_failed
- [ ] Invalid LLM JSON → validation + retry
- [ ] Resolve pending ticket → error message
- [ ] Very long complaint → truncate for LLM if needed
- [ ] Special characters in complaint → proper escaping

#### 5.3 UI Polish

- Loading spinners
- Error toasts
- Responsive design
- Empty state messages

---

### Phase 6: Documentation & Video (Day 6-7)

#### 6.1 README.md Structure

```markdown
# AI Support Triage & Recovery Hub

## Quick Start

1. Clone repo
2. Copy `.env.example` to `.env`
3. Run `docker-compose up -d`
4. cd backend && npm install && npm run dev
5. cd frontend && npm install && npm run dev

## Architecture

[Brief explanation with diagram]

## API Endpoints

[Link to API spec]

## Tech Decisions

- Why polling vs queue
- Why separate AI results table
- How JSON validation works
```

#### 6.2 Loom Video (5 min max)

**Script**:

1. (30s) Demo: Submit ticket → show 201 response
2. (30s) Demo: Watch dashboard update with AI result
3. (30s) Demo: View detail, edit draft, resolve
4. (1min) Explain: Background worker architecture
5. (1min) Explain: Edge case handling (validation, retries)
6. (1min) Explain: How AI tools (Cursor/Gemini) helped
7. (30s) Wrap up

---

## Environment Variables

```env
# Backend
DATABASE_URL=postgres://postgres:password@localhost:5432/kiros_triage
LLM_API_KEY=your_api_key_here
LLM_PROVIDER=gemini  # or groq
PORT=4000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## Risk Mitigation

| Risk                          | Mitigation                                     |
| ----------------------------- | ---------------------------------------------- |
| LLM API quota exceeded        | Use free tier wisely, cache responses          |
| LLM returns inconsistent JSON | Strong validation + retry with stricter prompt |
| Worker crashes                | Status tracking, restart recovery              |
| Database connection issues    | Connection pooling, retry logic                |

---

## Definition of Done

- [ ] POST /tickets returns 201 immediately (non-blocking)
- [ ] Background worker processes tickets async
- [ ] LLM returns valid JSON, stored in separate fields
- [ ] Dashboard shows color-coded urgency
- [ ] Agent can edit draft and resolve ticket
- [ ] README with docker-compose works on fresh machine
- [ ] Loom video demonstrates all features + explains architecture
