import dotenv from "dotenv";
import pool from "../db/pool";
import { PaymentWorker } from "./processor";

// Load environment variables
dotenv.config();

console.log("🚀 Starting Kiros AI Worker...");

if (!process.env.LLM_API_KEY) {
  console.warn("⚠️ WARNING: LLM_API_KEY is missing. AI features will fail.");
}
if (!process.env.DATABASE_URL) {
  console.error("❌ ERROR: DATABASE_URL is missing.");
  process.exit(1);
}

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  console.log("🛑 SIGTERM received. Shutting down worker...");
  await pool.end();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("🛑 SIGINT received. Shutting down worker...");
  await pool.end();
  process.exit(0);
});

// Start the worker
const worker = new PaymentWorker();
worker.start();
