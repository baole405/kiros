export type TicketStatus =
  | "pending"
  | "processing"
  | "processed"
  | "resolved"
  | "ai_failed";
export type TicketCategory = "billing" | "technical" | "feature_request";
export type TicketUrgency = "high" | "medium" | "low";

export interface AIResult {
  id: number;
  ticket_id: number;
  category: TicketCategory;
  sentiment_score: number;
  urgency: TicketUrgency;
  draft_reply: string;
  processed_at: string;
}

export interface Ticket {
  id: number;
  email: string | null;
  content: string;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
  ai_result: AIResult | null;
}

export interface CreateTicketRequest {
  email?: string;
  content: string;
}

export interface CreateTicketResponse {
  success: boolean;
  data: {
    ticket_id: number;
    status: string;
    message: string;
    processing_time_ms?: number;
  };
}

export interface GetTicketsResponse {
  success: boolean;
  data: {
    tickets: Ticket[];
    pagination: {
      page: number;
      limit: number;
      total_count: number;
      total_pages: number;
    };
  };
}

export interface GetTicketResponse {
  success: boolean;
  data: Ticket;
}
