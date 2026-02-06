# API Specification - AI Support Triage & Recovery Hub

## Base URL

```
http://localhost:4000/api
```

---

## Endpoints Overview

| Method | Endpoint               | Description                      | Auth Required |
| ------ | ---------------------- | -------------------------------- | ------------- |
| POST   | `/tickets`             | Submit a new ticket              | No            |
| GET    | `/tickets`             | List all tickets with AI results | No\*          |
| GET    | `/tickets/:id`         | Get single ticket details        | No\*          |
| POST   | `/tickets/:id/resolve` | Mark ticket as resolved          | No\*          |

\*In production, agent endpoints would require authentication. For this MVP, auth is optional.

---

## 1. POST /tickets

**Description**: Submit a new support ticket. Returns immediately while AI processing happens in background.

### Request

**Headers**:

```
Content-Type: application/json
```

**Body**:

```json
{
  "email": "user@example.com", // Optional
  "content": "I was charged twice for my subscription." // Required
}
```

**Validation Rules**:

- `content`: Required, string, min 10 characters, max 5000 characters
- `email`: Optional, valid email format if provided

### Response

**Success (201 Created)**:

```json
{
  "success": true,
  "data": {
    "ticket_id": 123,
    "status": "pending",
    "message": "Ticket submitted successfully. Our AI is analyzing your request."
  }
}
```

**Error (400 Bad Request)**:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Content is required and must be at least 10 characters"
  }
}
```

**Error (500 Internal Server Error)**:

```json
{
  "success": false,
  "error": {
    "code": "DATABASE_ERROR",
    "message": "Failed to create ticket. Please try again."
  }
}
```

### Example cURL

```bash
curl -X POST http://localhost:4000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "content": "I was charged twice for my subscription this month."
  }'
```

---

## 2. GET /tickets

**Description**: List all tickets with AI analysis results. Supports pagination and filtering.

### Request

**Query Parameters**:

| Parameter  | Type    | Default | Description                                                                            |
| ---------- | ------- | ------- | -------------------------------------------------------------------------------------- |
| `page`     | integer | 1       | Page number (1-indexed)                                                                |
| `limit`    | integer | 50      | Items per page (max 100)                                                               |
| `status`   | string  | all     | Filter by status: `pending`, `processing`, `processed`, `resolved`, `ai_failed`, `all` |
| `urgency`  | string  | all     | Filter by urgency: `high`, `medium`, `low`, `all`                                      |
| `category` | string  | all     | Filter by category: `billing`, `technical`, `feature_request`, `all`                   |

### Response

**Success (200 OK)**:

```json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "id": 123,
        "email": "user@example.com",
        "content": "I was charged twice for my subscription.",
        "status": "processed",
        "created_at": "2026-02-06T10:30:00Z",
        "updated_at": "2026-02-06T10:30:15Z",
        "ai_result": {
          "category": "billing",
          "sentiment_score": 7,
          "urgency": "high",
          "draft_reply": "Dear valued customer...",
          "processed_at": "2026-02-06T10:30:15Z"
        }
      },
      {
        "id": 122,
        "email": null,
        "content": "The app crashes when I try to export data.",
        "status": "processed",
        "created_at": "2026-02-06T09:15:00Z",
        "updated_at": "2026-02-06T09:15:20Z",
        "ai_result": {
          "category": "technical",
          "sentiment_score": 8,
          "urgency": "high",
          "draft_reply": "Thank you for reporting this issue...",
          "processed_at": "2026-02-06T09:15:20Z"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total_count": 150,
      "total_pages": 3
    }
  }
}
```

**Note**: If a ticket has no AI result yet (status = `pending` or `processing`), the `ai_result` field will be `null`.

**Error (400 Bad Request)**:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "Invalid status filter. Must be one of: pending, processing, processed, resolved, ai_failed, all"
  }
}
```

### Example cURL

```bash
# Get all tickets
curl http://localhost:4000/api/tickets

# Get high urgency tickets, page 2
curl "http://localhost:4000/api/tickets?urgency=high&page=2&limit=20"

# Get resolved billing tickets
curl "http://localhost:4000/api/tickets?status=resolved&category=billing"
```

---

## 3. GET /tickets/:id

**Description**: Get detailed information for a single ticket.

### Request

**Path Parameters**:

- `id` (integer, required): Ticket ID

### Response

**Success (200 OK)**:

```json
{
  "success": true,
  "data": {
    "id": 123,
    "email": "user@example.com",
    "content": "I was charged twice for my subscription this month. Please refund the duplicate charge.",
    "status": "processed",
    "created_at": "2026-02-06T10:30:00Z",
    "updated_at": "2026-02-06T10:30:15Z",
    "ai_result": {
      "category": "billing",
      "sentiment_score": 7,
      "urgency": "high",
      "draft_reply": "Dear valued customer,\n\nThank you for bringing this to our attention. I sincerely apologize for the duplicate charge on your subscription. I've escalated this to our billing team, and you should see the refund processed within 3-5 business days.\n\nIf you have any questions, please don't hesitate to reach out.\n\nBest regards,\nSupport Team",
      "processed_at": "2026-02-06T10:30:15Z"
    }
  }
}
```

**Error (404 Not Found)**:

```json
{
  "success": false,
  "error": {
    "code": "TICKET_NOT_FOUND",
    "message": "Ticket with ID 999 not found"
  }
}
```

**Error (400 Bad Request)**:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_ID",
    "message": "Ticket ID must be a positive integer"
  }
}
```

### Example cURL

```bash
curl http://localhost:4000/api/tickets/123
```

---

## 4. POST /tickets/:id/resolve

**Description**: Mark a ticket as resolved. Optionally update the draft reply before resolving.

### Request

**Path Parameters**:

- `id` (integer, required): Ticket ID

**Headers**:

```
Content-Type: application/json
```

**Body** (optional):

```json
{
  "final_reply": "Updated response text that agent wants to send" // Optional
}
```

**Validation Rules**:

- `final_reply`: Optional, string, max 5000 characters
- If not provided, the original `draft_reply` from AI is kept

### Response

**Success (200 OK)**:

```json
{
  "success": true,
  "data": {
    "ticket_id": 123,
    "status": "resolved",
    "message": "Ticket resolved successfully"
  }
}
```

**Error (404 Not Found)**:

```json
{
  "success": false,
  "error": {
    "code": "TICKET_NOT_FOUND",
    "message": "Ticket with ID 999 not found"
  }
}
```

**Error (400 Bad Request)**:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_STATUS",
    "message": "Cannot resolve ticket with status 'pending'. Wait for AI processing to complete."
  }
}
```

### Example cURL

```bash
# Resolve without updating reply
curl -X POST http://localhost:4000/api/tickets/123/resolve

# Resolve with updated reply
curl -X POST http://localhost:4000/api/tickets/123/resolve \
  -H "Content-Type: application/json" \
  -d '{
    "final_reply": "Thank you for your patience. Your refund has been processed."
  }'
```

---

## Error Codes Reference

| Code                | HTTP Status | Description                                     |
| ------------------- | ----------- | ----------------------------------------------- |
| `VALIDATION_ERROR`  | 400         | Request body validation failed                  |
| `INVALID_PARAMETER` | 400         | Invalid query parameter                         |
| `INVALID_ID`        | 400         | Invalid ticket ID format                        |
| `INVALID_STATUS`    | 400         | Operation not allowed for current ticket status |
| `TICKET_NOT_FOUND`  | 404         | Ticket does not exist                           |
| `DATABASE_ERROR`    | 500         | Database operation failed                       |
| `INTERNAL_ERROR`    | 500         | Unexpected server error                         |

---

## Response Format Standards

All API responses follow this structure:

### Success Response

```json
{
  "success": true,
  "data": {
    /* response data */
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

---

## Rate Limiting (Optional for MVP)

To prevent abuse, implement rate limiting:

| Endpoint                  | Limit                        |
| ------------------------- | ---------------------------- |
| POST /tickets             | 10 requests per hour per IP  |
| GET /tickets              | 100 requests per hour per IP |
| GET /tickets/:id          | 100 requests per hour per IP |
| POST /tickets/:id/resolve | 50 requests per hour per IP  |

**Rate Limit Response (429 Too Many Requests)**:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again in 30 minutes.",
    "retry_after": 1800
  }
}
```

---

## CORS Configuration

For local development, allow frontend to access backend:

```javascript
// Express CORS config
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  }),
);
```

---

## TypeScript Types (for Frontend)

```typescript
// Request types
interface CreateTicketRequest {
  email?: string;
  content: string;
}

interface ResolveTicketRequest {
  final_reply?: string;
}

// Response types
interface Ticket {
  id: number;
  email: string | null;
  content: string;
  status: "pending" | "processing" | "processed" | "resolved" | "ai_failed";
  created_at: string;
  updated_at: string;
  ai_result: AIResult | null;
}

interface AIResult {
  category: "billing" | "technical" | "feature_request";
  sentiment_score: number; // 1-10
  urgency: "high" | "medium" | "low";
  draft_reply: string;
  processed_at: string;
}

interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

interface TicketListResponse {
  tickets: Ticket[];
  pagination: {
    page: number;
    limit: number;
    total_count: number;
    total_pages: number;
  };
}
```

---

## Testing with Postman/Insomnia

Import this collection for quick testing:

```json
{
  "name": "Kiros Triage API",
  "requests": [
    {
      "name": "Create Ticket",
      "method": "POST",
      "url": "http://localhost:4000/api/tickets",
      "body": {
        "email": "test@example.com",
        "content": "Test complaint message"
      }
    },
    {
      "name": "List Tickets",
      "method": "GET",
      "url": "http://localhost:4000/api/tickets?limit=10"
    },
    {
      "name": "Get Ticket Details",
      "method": "GET",
      "url": "http://localhost:4000/api/tickets/1"
    },
    {
      "name": "Resolve Ticket",
      "method": "POST",
      "url": "http://localhost:4000/api/tickets/1/resolve"
    }
  ]
}
```

---

## Next Steps

1. ✅ API specification complete
2. → Create implementation plan
3. → Begin project setup
