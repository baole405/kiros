import * as queries from "../db/queries";
import { aiService } from "../services/aiService";

const POLL_INTERVAL = 5000; // 5 seconds
const BATCH_SIZE = 5;

export class PaymentWorker {
  private isProcessing = false;

  start() {
    console.log("👷 Background Worker started. Polling for tickets...");
    setInterval(() => this.processTickets(), POLL_INTERVAL);
  }

  async processTickets() {
    if (this.isProcessing) return; // Prevent overlapping runs
    this.isProcessing = true;

    try {
      // 1. Fetch pending tickets
      const pendingTickets = await queries.getPendingTickets(BATCH_SIZE);

      if (pendingTickets.length === 0) {
        // No tickets to process
        this.isProcessing = false;
        return;
      }

      console.log(`📥 Processing ${pendingTickets.length} pending tickets...`);

      // 2. Process each ticket
      for (const ticket of pendingTickets) {
        await this.processSingleTicket(ticket);
      }
    } catch (error) {
      console.error("❌ Error in worker loop:", error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processSingleTicket(ticket: { id: number; content: string }) {
    console.log(`Processing ticket #${ticket.id}...`);

    try {
      // Mark as processing
      await queries.updateTicketStatus(ticket.id, "processing");

      // Call LLM
      const aiResult = await aiService.analyzeTicket(ticket.content);

      // Save result
      await queries.saveAIResult(ticket.id, aiResult);

      // Mark as processed
      await queries.updateTicketStatus(ticket.id, "processed");

      console.log(
        `✅ Ticket #${ticket.id} processed successfully. Urgency: ${aiResult.urgency}`,
      );
    } catch (error) {
      console.error(`❌ Failed to process ticket #${ticket.id}:`, error);

      // Mark as failed so we don't retry indefinitely efficiently (or implement retry logic)
      // For now, we'll mark as 'ai_failed'
      await queries.updateTicketStatus(ticket.id, "ai_failed");
    }
  }
}

// Start the worker if this file is run directly
if (require.main === module) {
  const worker = new PaymentWorker();
  worker.start();
}
