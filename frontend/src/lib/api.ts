import type {
  CreateTicketRequest,
  CreateTicketResponse,
  GetTicketResponse,
  GetTicketsResponse,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export class ApiClient {
  /**
   * Create a new ticket
   */
  static async createTicket(
    data: CreateTicketRequest,
  ): Promise<CreateTicketResponse> {
    const response = await fetch(`${API_URL}/tickets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create ticket: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get all tickets with optional filters
   */
  static async getTickets(params?: {
    page?: number;
    limit?: number;
    status?: string;
    urgency?: string;
    category?: string;
  }): Promise<GetTicketsResponse> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.status) searchParams.set("status", params.status);
    if (params?.urgency) searchParams.set("urgency", params.urgency);
    if (params?.category) searchParams.set("category", params.category);

    const url = `${API_URL}/tickets${searchParams.toString() ? `?${searchParams}` : ""}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch tickets: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get a single ticket by ID
   */
  static async getTicket(id: number): Promise<GetTicketResponse> {
    const response = await fetch(`${API_URL}/tickets/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch ticket: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Resolve a ticket
   */
  static async resolveTicket(
    id: number,
    finalReply?: string,
  ): Promise<{ success: boolean }> {
    const response = await fetch(`${API_URL}/tickets/${id}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ final_reply: finalReply }),
    });

    if (!response.ok) {
      throw new Error(`Failed to resolve ticket: ${response.statusText}`);
    }

    return response.json();
  }
}
