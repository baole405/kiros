# System Architecture Diagram (SAD)

## Kiros AI Support Triage & Recovery Hub

---

## High-Level System Architecture

```mermaid
graph TB
    subgraph Client["👥 Client Layer"]
        User["End User<br/>(Submit Complaint)"]
        Agent["Support Agent<br/>(Dashboard)"]
    end

    subgraph Frontend["🎨 Frontend - Next.js (Port 3000)"]
        SubmitPage["Ticket Submission<br/>Page"]
        DashboardPage["Agent Dashboard<br/>List View"]
        DetailPage["Ticket Detail<br/>Edit & Resolve"]
    end

    subgraph Backend["⚙️ Backend - Express.js (Port 4000)"]
        API["REST API Server"]
        Router["Route Layer<br/>(tickets.ts)"]
        Service["Service Layer<br/>(ticketService.ts)"]
        Queries["Data Layer<br/>(queries.ts)"]
    end

    subgraph Worker["🤖 Background Worker"]
        Poller["Polling Mechanism<br/>(Every 5s)"]
        AIService["AI Integration<br/>Service"]
        Validator["JSON Response<br/>Validator"]
    end

    subgraph External["☁️ External Services"]
        LLM["LLM API<br/>(Groq/Gemini)"]
    end

    subgraph Database["🗄️ PostgreSQL (Port 5433)"]
        TicketsTable[("tickets<br/>table")]
        AIResultsTable[("ticket_ai_results<br/>table")]
    end

    User -->|1. Submit| SubmitPage
    Agent -->|View| DashboardPage
    Agent -->|Click ticket| DetailPage

    SubmitPage -->|POST /api/tickets| Router
    DashboardPage -->|GET /api/tickets| Router
    DetailPage -->|GET /api/tickets/:id| Router
    DetailPage -->|POST /api/tickets/:id/resolve| Router

    Router --> Service
    Service --> Queries
    Queries -->|SQL| TicketsTable
    Queries -->|SQL JOIN| AIResultsTable

    Poller -->|SELECT status=pending| TicketsTable
    Poller --> AIService
    AIService -->|HTTP Request| LLM
    LLM -->|JSON Response| Validator
    Validator -->|INSERT| AIResultsTable
    Validator -->|UPDATE status| TicketsTable

    style Client fill:#E8F5E9
    style Frontend fill:#E3F2FD
    style Backend fill:#FFF3E0
    style Worker fill:#FCE4EC
    style External fill:#E1F5FE
    style Database fill:#F3E5F5
```

---

## Detailed Component Architecture

```mermaid
graph LR
    subgraph FE["Frontend Components"]
        direction TB
        Form["Submission Form"]
        List["Ticket List"]
        Detail["Ticket Detail"]
    end

    subgraph BE["Backend Layers"]
        direction TB
        Routes["Routes<br/>(Express Router)"]
        Services["Business Logic<br/>(Validation)"]
        DataLayer["Database Queries<br/>(pg Pool)"]
    end

    subgraph DB["Database Schema"]
        direction TB
        T1["tickets<br/>├─ id<br/>├─ email<br/>├─ content<br/>└─ status"]
        T2["ticket_ai_results<br/>├─ ticket_id<br/>├─ category<br/>├─ urgency<br/>└─ draft_reply"]
    end

    FE -->|HTTP/JSON| Routes
    Routes --> Services
    Services --> DataLayer
    DataLayer -->|SQL| T1
    DataLayer -->|SQL| T2
    T2 -.->|FK| T1

    style FE fill:#42A5F5
    style BE fill:#66BB6A
    style DB fill:#AB47BC
```

---

## Data Flow: Ticket Submission (Async)

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant FE as Frontend
    participant API as Backend API
    participant DB as PostgreSQL
    participant W as Worker
    participant AI as LLM API

    U->>FE: Enter complaint
    FE->>API: POST /api/tickets<br/>{email, content}

    Note over API: Validate input
    API->>DB: INSERT INTO tickets<br/>status='pending'
    DB-->>API: ticket_id: 1
    API-->>FE: 201 Created<br/>{ticket_id: 1, status: 'pending'}
    FE-->>U: "Ticket submitted!"

    Note over W: Poll every 5s
    loop Every 5 seconds
        W->>DB: SELECT * WHERE status='pending'
        DB-->>W: [ticket #1]
    end

    W->>DB: UPDATE status='processing'
    W->>AI: Analyze complaint
    AI-->>W: JSON {category, urgency, draft}

    alt Valid JSON
        W->>DB: INSERT ticket_ai_results
        W->>DB: UPDATE status='processed'
    else Invalid JSON
        W->>DB: UPDATE status='ai_failed'
    end
```

---

## Data Flow: Agent Dashboard View

```mermaid
sequenceDiagram
    participant A as 👨‍💼 Agent
    participant D as Dashboard
    participant API as Backend API
    participant DB as PostgreSQL

    A->>D: Open dashboard
    D->>API: GET /api/tickets?page=1
    API->>DB: SELECT tickets<br/>LEFT JOIN ticket_ai_results
    DB-->>API: [{ticket + ai_result}]
    API-->>D: JSON with urgency
    D->>D: Color-code by urgency
    D-->>A: Display list

    A->>D: Click ticket #1
    D->>API: GET /api/tickets/1
    API->>DB: SELECT WHERE id=1
    DB-->>API: Full ticket data
    API-->>D: {ticket + ai_result}
    D-->>A: Show detail view

    A->>D: Edit draft & click Resolve
    D->>API: POST /api/tickets/1/resolve<br/>{final_reply}
    API->>DB: UPDATE status='resolved'
    DB-->>API: Success
    API-->>D: 200 OK
    D-->>A: "Resolved!"
```

---

## Technology Stack Diagram

```mermaid
graph TB
    subgraph Stack["Technology Stack"]
        direction LR

        subgraph FE_Tech["Frontend"]
            NextJS["Next.js 14"]
            React["React 18"]
            Tailwind["Tailwind CSS"]
        end

        subgraph BE_Tech["Backend"]
            Express["Express.js"]
            TypeScript["TypeScript"]
            PG["node-postgres"]
        end

        subgraph DB_Tech["Database"]
            Postgres["PostgreSQL 15"]
            Docker["Docker Compose"]
        end

        subgraph AI_Tech["AI Layer"]
            Groq["Groq API"]
            Gemini["Gemini API"]
        end
    end

    style FE_Tech fill:#61DAFB
    style BE_Tech fill:#68A063
    style DB_Tech fill:#336791
    style AI_Tech fill:#FF6F61
```

---

## Deployment Architecture

```mermaid
graph TB
    subgraph Local["Local Development"]
        FE_Local["Frontend<br/>localhost:3000"]
        BE_Local["Backend + Worker<br/>localhost:4000"]
        DB_Local["PostgreSQL<br/>localhost:5433"]
    end

    subgraph Production["Production (Optional)"]
        FE_Prod["Vercel/Netlify"]
        BE_Prod["VPS/Railway"]
        DB_Prod["Managed PostgreSQL"]
    end

    FE_Local -->|API Calls| BE_Local
    BE_Local -->|Connection Pool| DB_Local

    FE_Prod -.->|API Calls| BE_Prod
    BE_Prod -.->|SSL Connection| DB_Prod

    style Local fill:#C8E6C9
    style Production fill:#FFCCBC
```

---

## Error Handling Flow

```mermaid
graph TD
    Start([Request Received])
    Start --> Validate{Valid Input?}

    Validate -->|No| Return400[Return 400<br/>Validation Error]
    Validate -->|Yes| ProcessDB{Database<br/>Available?}

    ProcessDB -->|No| Return500[Return 500<br/>Database Error]
    ProcessDB -->|Yes| CheckResource{Resource<br/>Exists?}

    CheckResource -->|No| Return404[Return 404<br/>Not Found]
    CheckResource -->|Yes| ProcessAI{AI Processing}

    ProcessAI -->|Success| Return200[Return 200/201<br/>Success]
    ProcessAI -->|Timeout| Retry{Retry<br/>Count < 3?}
    ProcessAI -->|Invalid JSON| MarkFailed[Mark as<br/>ai_failed]

    Retry -->|Yes| ProcessAI
    Retry -->|No| MarkFailed
    MarkFailed --> Return200

    style Return400 fill:#FFCDD2
    style Return404 fill:#FFE0B2
    style Return500 fill:#FFCCBC
    style Return200 fill:#C8E6C9
```

---

## Database ER Diagram

```mermaid
erDiagram
    TICKETS ||--o| TICKET_AI_RESULTS : has

    TICKETS {
        int id PK
        varchar email
        text content
        enum status
        timestamp created_at
        timestamp updated_at
    }

    TICKET_AI_RESULTS {
        int id PK
        int ticket_id FK
        enum category
        int sentiment_score
        enum urgency
        text draft_reply
        timestamp processed_at
    }
```

---

## Summary

**Architecture Pattern**: Layered + Async Worker Pattern

**Key Principles**:

- ✅ Non-blocking API (< 100ms response)
- ✅ Background processing (async AI)
- ✅ Separation of concerns (Routes → Services → Data)
- ✅ Robust error handling
- ✅ Type safety (TypeScript)

**Scalability Considerations**:

- Connection pooling for concurrent requests
- Polling can be replaced with job queue (BullMQ)
- Worker can scale horizontally
- Database can be replicated for read operations
