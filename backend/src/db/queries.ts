import { TicketWithAI } from "../types";
import pool from "./pool";

/**
 * Insert a new ticket into the database
 */
export async function createTicket(
  email: string | null,
  content: string,
): Promise<number> {
  const result = await pool.query<{ id: number }>(
    "INSERT INTO tickets (email, content, status) VALUES ($1, $2, $3) RETURNING id",
    [email, content, "pending"],
  );
  return result.rows[0].id;
}

/**
 * Get all tickets with optional filters and pagination
 */
export async function getTickets(params: {
  page?: number;
  limit?: number;
  status?: string;
  urgency?: string;
  category?: string;
}): Promise<{ tickets: TicketWithAI[]; totalCount: number }> {
  const page = params.page || 1;
  const limit = Math.min(params.limit || 50, 100);
  const offset = (page - 1) * limit;

  // Build WHERE clause
  const conditions: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (params.status && params.status !== "all") {
    conditions.push(`t.status = $${paramIndex}`);
    values.push(params.status);
    paramIndex++;
  }

  if (params.urgency && params.urgency !== "all") {
    conditions.push(`r.urgency = $${paramIndex}`);
    values.push(params.urgency);
    paramIndex++;
  }

  if (params.category && params.category !== "all") {
    conditions.push(`r.category = $${paramIndex}`);
    values.push(params.category);
    paramIndex++;
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as count
    FROM tickets t
    LEFT JOIN ticket_ai_results r ON t.id = r.ticket_id
    ${whereClause}
  `;
  const countResult = await pool.query(countQuery, values);
  const totalCount = parseInt(countResult.rows[0].count);

  // Get tickets with pagination
  const dataQuery = `
    SELECT 
      t.id,
      t.email,
      t.content,
      t.status,
      t.created_at,
      t.updated_at,
      r.id as ai_result_id,
      r.category,
      r.sentiment_score,
      r.urgency,
      r.draft_reply,
      r.processed_at
    FROM tickets t
    LEFT JOIN ticket_ai_results r ON t.id = r.ticket_id
    ${whereClause}
    ORDER BY t.created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const dataResult = await pool.query(dataQuery, [...values, limit, offset]);

  const tickets: TicketWithAI[] = dataResult.rows.map((row) => ({
    id: row.id,
    email: row.email,
    content: row.content,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
    ai_result: row.ai_result_id
      ? {
          id: row.ai_result_id,
          ticket_id: row.id,
          category: row.category,
          sentiment_score: row.sentiment_score,
          urgency: row.urgency,
          draft_reply: row.draft_reply,
          processed_at: row.processed_at,
        }
      : null,
  }));

  return { tickets, totalCount };
}

/**
 * Get a single ticket by ID
 */
export async function getTicketById(id: number): Promise<TicketWithAI | null> {
  const result = await pool.query(
    `
    SELECT 
      t.id,
      t.email,
      t.content,
      t.status,
      t.created_at,
      t.updated_at,
      r.id as ai_result_id,
      r.category,
      r.sentiment_score,
      r.urgency,
      r.draft_reply,
      r.processed_at
    FROM tickets t
    LEFT JOIN ticket_ai_results r ON t.id = r.ticket_id
    WHERE t.id = $1
    `,
    [id],
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id,
    email: row.email,
    content: row.content,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
    ai_result: row.ai_result_id
      ? {
          id: row.ai_result_id,
          ticket_id: row.id,
          category: row.category,
          sentiment_score: row.sentiment_score,
          urgency: row.urgency,
          draft_reply: row.draft_reply,
          processed_at: row.processed_at,
        }
      : null,
  };
}

/**
 * Update ticket status
 */
export async function updateTicketStatus(
  id: number,
  status: string,
): Promise<void> {
  await pool.query("UPDATE tickets SET status = $1 WHERE id = $2", [
    status,
    id,
  ]);
}

/**
 * Save AI analysis result
 */
export async function saveAIResult(
  ticketId: number,
  result: any,
): Promise<void> {
  await pool.query(
    `INSERT INTO ticket_ai_results 
    (ticket_id, category, sentiment_score, urgency, draft_reply) 
    VALUES ($1, $2, $3, $4, $5)`,
    [
      ticketId,
      result.category,
      result.sentiment_score,
      result.urgency,
      result.draft_reply,
    ],
  );
}

/**
 * Get pending tickets for processing
 */
export async function getPendingTickets(
  limit: number = 10,
): Promise<{ id: number; content: string }[]> {
  const result = await pool.query(
    "SELECT id, content FROM tickets WHERE status = $1 ORDER BY created_at ASC LIMIT $2",
    ["pending", limit],
  );
  return result.rows;
}

/**
 * Update ticket status to resolved
 */
export async function resolveTicket(
  id: number,
  finalReply?: string,
): Promise<boolean> {
  const ticket = await getTicketById(id);

  if (!ticket) {
    return false;
  }

  await updateTicketStatus(id, "resolved");

  if (finalReply && ticket.ai_result) {
    await pool.query(
      "UPDATE ticket_ai_results SET draft_reply = $1 WHERE ticket_id = $2",
      [finalReply, id],
    );
  }

  return true;
}
