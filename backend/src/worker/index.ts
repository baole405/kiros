import dotenv from "dotenv";
import pool from "../db/pool";
import { PaymentWorker } from "./processor";

// Load environment variables
dotenv.config();

console.log("🚀 Starting Kiros AI Worker...");

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
