# Backend API Test Examples

## 1. Create a new ticket

```powershell
curl -X POST http://localhost:4000/api/tickets `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"user@example.com\",\"content\":\"I was charged twice for my subscription this month. Please refund the duplicate payment.\"}'
```

Expected response:

```json
{
  "success": true,
  "data": {
    "ticket_id": 1,
    "status": "pending",
    "message": "Ticket submitted successfully. Our AI is analyzing your request."
  }
}
```

##2. Get all tickets

```powershell
curl http://localhost:4000/api/tickets
```

## 3. Get tickets with filters

```powershell
# Get only processed tickets
curl "http://localhost:4000/api/tickets?status=processed"

# Get high urgency tickets
curl "http://localhost:4000/api/tickets?urgency=high"

# Pagination
curl "http://localhost:4000/api/tickets?page=2&limit=20"
```

## 4. Get a single ticket

```powershell
curl http://localhost:4000/api/tickets/1
```

## 5. Resolve a ticket

```powershell
curl -X POST http://localhost:4000/api/tickets/1/resolve `
  -H "Content-Type: application/json" `
  -d '{\"final_reply\":\"Thank you for your patience. Your refund has been processed.\"}'
```

## 6. Test validation errors

```powershell
# Empty content
curl -X POST http://localhost:4000/api/tickets `
  -H "Content-Type: application/json" `
  -d '{\"content\":\"\"}'

# Content too short
curl -X POST http://localhost:4000/api/tickets `
  -H "Content-Type: application/json" `
  -d '{\"content\":\"short\"}'

# Invalid email
curl -X POST http://localhost:4000/api/tickets `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"invalid-email\",\"content\":\"This is a test complaint message\"}'
```
