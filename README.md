# AI Support Triage & Recovery Hub

Full Stack MVP for Kiros technical assessment - an AI-powered ticket triage system with async processing.

## 🎯 Project Overview

This system receives customer complaints, processes them asynchronously using AI to categorize and draft responses, then presents them to support agents in a dashboard.

### Key Features

- ✅ Non-blocking ticket submission (< 100ms response time)
- ✅ Background AI processing (categorization, sentiment analysis, urgency scoring)
- ✅ Agent dashboard with color-coded urgency
- ✅ Editable AI-generated draft responses

## 🏗️ Tech Stack

| Layer           | Technology                                        |
| --------------- | ------------------------------------------------- |
| Frontend        | Next.js 14 (TypeScript, App Router, Tailwind CSS) |
| Backend         | Express.js (TypeScript, Node.js)                  |
| Database        | PostgreSQL 15                                     |
| AI              | Gemini/Groq API                                   |
| Dev Environment | Docker Compose                                    |

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- npm or pnpm

### 1. Clone and Install

```bash
# Clone repository
git clone <repo-url>
cd kiros

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env and add your LLM API key
```

### 3. Start Database

```bash
# From project root
docker-compose up -d
```

This will:

- Start PostgreSQL on port 5432
- Automatically run migrations to create tables

### 4. Start Backend

```bash
cd backend
npm run dev
```

Backend runs at `http://localhost:4000`

### 5. Start Frontend

```bash
cd frontend
npm run dev
```

Frontend runs at `http://localhost:3000`

### 6. Verify Setup

- Backend health: http://localhost:4000/health
- Database test: http://localhost:4000/api/test-db

## 📁 Project Structure

```
kiros/
├── backend/                  # Express.js backend
│   ├── src/
│   │   ├── index.ts         # Server entry
│   │   ├── db/              # Database connection
│   │   ├── types/           # TypeScript types
│   │   ├── routes/          # API routes (Phase 2)
│   │   ├── services/        # Business logic (Phase 2-3)
│   │   └── worker/          # Background worker (Phase 3)
│   └── migrations/          # Database migrations
│
├── frontend/                # Next.js frontend
│   └── src/
│       ├── app/            # App Router pages
│       ├── components/     # UI components
│       ├── lib/           # API client
│       └── types/         # TypeScript types
│
└── docker-compose.yml      # Local PostgreSQL
```

## 🗄️ Database Schema

### Tables

**tickets**

- Stores user complaints
- Status: `pending` → `processing` → `processed` → `resolved`

**ticket_ai_results**

- AI analysis results (category, sentiment, urgency, draft_reply)
- One-to-one relationship with tickets

## 📡 API Endpoints

| Method | Endpoint                   | Description                  |
| ------ | -------------------------- | ---------------------------- |
| POST   | `/api/tickets`             | Submit new ticket            |
| GET    | `/api/tickets`             | List tickets with pagination |
| GET    | `/api/tickets/:id`         | Get ticket details           |
| POST   | `/api/tickets/:id/resolve` | Resolve ticket               |

See [api_specification.md](C:\Users\thinkbook\.gemini\antigravity\brain\45867957-6ca8-4b68-9b46-3b2c4c163e6d\api_specification.md) for detailed specs.

## 🔄 How It Works

1. **User submits ticket** → Backend returns 201 immediately (status: `pending`)
2. **Background worker** polls for pending tickets every 5 seconds
3. **Worker calls LLM** to analyze complaint (category, sentiment, urgency, draft)
4. **Worker validates JSON** and saves to `ticket_ai_results` table
5. **Agent views dashboard** → sees tickets color-coded by urgency
6. **Agent edits draft** and clicks "Resolve"

## 🎨 Development Workflow

### Phase 1: Project Setup ✅

- [x] Docker Compose
- [x] Database migrations
- [x] Backend skeleton
- [x] Frontend skeleton

### Phase 2: Backend Core (In Progress)

- [ ] POST /tickets endpoint
- [ ] GET /tickets endpoint
- [ ] GET /tickets/:id endpoint
- [ ] POST /tickets/:id/resolve endpoint

### Phase 3: Background Worker

- [ ] Polling mechanism
- [ ] LLM integration
- [ ] JSON validation
- [ ] Error handling

### Phase 4: Frontend

- [ ] Ticket submission form
- [ ] Agent dashboard
- [ ] Ticket detail view

### Phase 5: Testing & Documentation

- [ ] Manual testing
- [ ] Edge case handling
- [ ] Loom video

## 🧪 Testing

```bash
# Test database connection
curl http://localhost:4000/api/test-db

# Submit ticket (after Phase 2)
curl -X POST http://localhost:4000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","content":"Test complaint"}'
```

## 📚 Documentation

- [System Architecture](C:\Users\thinkbook\.gemini\antigravity\brain\45867957-6ca8-4b68-9b46-3b2c4c163e6d\architecture.md)
- [Database Schema](C:\Users\thinkbook\.gemini\antigravity\brain\45867957-6ca8-4b68-9b46-3b2c4c163e6d\database_schema.md)
- [API Specification](C:\Users\thinkbook\.gemini\antigravity\brain\45867957-6ca8-4b68-9b46-3b2c4c163e6d\api_specification.md)
- [Implementation Plan](C:\Users\thinkbook\.gemini\antigravity\brain\45867957-6ca8-4b68-9b46-3b2c4c163e6d\implementation_plan.md)

## 🐛 Troubleshooting

**Database connection fails**

```bash
# Check if PostgreSQL is running
docker ps

# Restart container
docker-compose restart postgres
```

**Migration not applied**

```bash
# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v

# Restart
docker-compose up -d
```

## 📝 License

MIT
