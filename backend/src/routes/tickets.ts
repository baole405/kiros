import { Router } from "express";
import { TicketService } from "../services/ticketService";

const router = Router();

/**
 * POST /api/tickets
 * Create a new ticket
 */
router.post("/tickets", TicketService.createTicket);

/**
 * GET /api/tickets
 * Get all tickets with pagination and filters
 * Query params: page, limit, status, urgency, category
 */
router.get("/tickets", TicketService.getTickets);

/**
 * GET /api/tickets/:id
 * Get a single ticket by ID
 */
router.get("/tickets/:id", TicketService.getTicketById);

/**
 * POST /api/tickets/:id/resolve
 * Mark a ticket as resolved
 * Body (optional): { final_reply: string }
 */
router.post("/tickets/:id/resolve", TicketService.resolveTicket);

export default router;
