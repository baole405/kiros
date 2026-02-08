import { Request, Response } from "express";
import * as queries from "../db/queries";

/**
 * Service layer for ticket operations
 * Contains business logic and validation
 */

export class TicketService {
  /**
   * Create a new ticket
   */
  static async createTicket(req: Request, res: Response) {
    try {
      const { email, content } = req.body;

      // Validation
      if (!content || typeof content !== "string") {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Content is required and must be a string",
          },
        });
      }

      if (content.length < 10) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Content must be at least 10 characters",
          },
        });
      }

      if (content.length > 5000) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Content must be less than 5000 characters",
          },
        });
      }

      // Validate email if provided
      if (email && typeof email === "string") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Invalid email format",
            },
          });
        }
      }

      // Create ticket (non-blocking)
      const startTime = performance.now();
      const ticketId = await queries.createTicket(email || null, content);
      const endTime = performance.now();
      const processingTime = Math.round(endTime - startTime);

      // Return immediately with 201 status
      return res.status(201).json({
        success: true,
        data: {
          ticket_id: ticketId,
          status: "pending",
          message:
            "Ticket submitted successfully. Our AI is analyzing your request.",
          processing_time_ms: processingTime,
        },
      });
    } catch (error) {
      console.error("Error creating ticket:", error);
      return res.status(500).json({
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to create ticket. Please try again.",
        },
      });
    }
  }

  /**
   * Get all tickets with filters and pagination
   */
  static async getTickets(req: Request, res: Response) {
    try {
      const page = parseInt((req.query.page as string) || "1") || 1;
      const limit = parseInt((req.query.limit as string) || "50") || 50;
      const status = Array.isArray(req.query.status)
        ? (req.query.status[0] as string)
        : (req.query.status as string | undefined);
      const urgency = Array.isArray(req.query.urgency)
        ? (req.query.urgency[0] as string)
        : (req.query.urgency as string | undefined);
      const category = Array.isArray(req.query.category)
        ? (req.query.category[0] as string)
        : (req.query.category as string | undefined);

      // Validate filters
      const validStatuses = [
        "pending",
        "processing",
        "processed",
        "resolved",
        "ai_failed",
        "all",
      ];
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_PARAMETER",
            message: `Invalid status filter. Must be one of: ${validStatuses.join(", ")}`,
          },
        });
      }

      const validUrgencies = ["high", "medium", "low", "all"];
      if (urgency && !validUrgencies.includes(urgency)) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_PARAMETER",
            message: `Invalid urgency filter. Must be one of: ${validUrgencies.join(", ")}`,
          },
        });
      }

      const validCategories = [
        "billing",
        "technical",
        "feature_request",
        "all",
      ];
      if (category && !validCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_PARAMETER",
            message: `Invalid category filter. Must be one of: ${validCategories.join(", ")}`,
          },
        });
      }

      const { tickets, totalCount } = await queries.getTickets({
        page,
        limit,
        status,
        urgency,
        category,
      });

      const totalPages = Math.ceil(totalCount / limit);

      return res.status(200).json({
        success: true,
        data: {
          tickets,
          pagination: {
            page,
            limit,
            total_count: totalCount,
            total_pages: totalPages,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching tickets:", error);
      return res.status(500).json({
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to fetch tickets.",
        },
      });
    }
  }

  /**
   * Get a single ticket by ID
   */
  static async getTicketById(req: Request, res: Response) {
    try {
      const id = parseInt(
        Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
      );

      if (isNaN(id) || id <= 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_ID",
            message: "Ticket ID must be a positive integer",
          },
        });
      }

      const ticket = await queries.getTicketById(id);

      if (!ticket) {
        return res.status(404).json({
          success: false,
          error: {
            code: "TICKET_NOT_FOUND",
            message: `Ticket with ID ${id} not found`,
          },
        });
      }

      return res.status(200).json({
        success: true,
        data: ticket,
      });
    } catch (error) {
      console.error("Error fetching ticket:", error);
      return res.status(500).json({
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to fetch ticket.",
        },
      });
    }
  }

  /**
   * Resolve a ticket
   */
  static async resolveTicket(req: Request, res: Response) {
    try {
      const id = parseInt(
        Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
      );
      const final_reply = req.body.final_reply as string | undefined;

      if (isNaN(id) || id <= 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_ID",
            message: "Ticket ID must be a positive integer",
          },
        });
      }

      // Validate final_reply if provided
      if (final_reply && typeof final_reply !== "string") {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "final_reply must be a string",
          },
        });
      }

      if (final_reply && final_reply.length > 5000) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "final_reply must be less than 5000 characters",
          },
        });
      }

      const success = await queries.resolveTicket(id, final_reply || undefined);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: {
            code: "TICKET_NOT_FOUND",
            message: `Ticket with ID ${id} not found`,
          },
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          ticket_id: id,
          status: "resolved",
          message: "Ticket resolved successfully",
        },
      });
    } catch (error) {
      console.error("Error resolving ticket:", error);
      return res.status(500).json({
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to resolve ticket.",
        },
      });
    }
  }
}
