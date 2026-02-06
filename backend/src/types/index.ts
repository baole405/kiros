// Ticket types
export type TicketStatus =
  | "pending"
  | "processing"
  | "processed"
  | "resolved"
  | "ai_failed";
export type TicketCategory = "billing" | "technical" | "feature_request";
export type TicketUrgency = "high" | "medium" | "low";

export interface Ticket {
  id: number;
  email: string | null;
  content: string;
  status: TicketStatus;
  created_at: Date;
  updated_at: Date;
}

export interface AIResult {
  id: number;
  ticket_id: number;
  category: TicketCategory;
  sentiment_score: number;
  urgency: TicketUrgency;
  draft_reply: string;
  processed_at: Date;
}

export interface TicketWithAI extends Ticket {
  ai_result: AIResult | null;
}

// API Request/Response types
export interface CreateTicketRequest {
  email?: string;
  content: string;
}

export interface CreateTicketResponse {
  success: boolean;
  data?: {
    ticket_id: number;
    status: TicketStatus;
    message: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface ResolveTicketRequest {
  final_reply?: string;
}

export interface TicketListResponse {
  success: boolean;
  data?: {
    tickets: TicketWithAI[];
    pagination: {
      page: number;
      limit: number;
      total_count: number;
      total_pages: number;
    };
  };
  error?: {
    code: string;
    message: string;
  };
}

// LLM types
export interface LLMResponse {
  category: TicketCategory;
  sentiment_score: number;
  urgency: TicketUrgency;
  draft_reply: string;
}
