import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import pool from "./db/pool";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 4000;

// Setup Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🔌 Client connected to Socket.IO");
  socket.on("disconnect", () => {
    console.log("🔌 Client disconnected");
  });
});

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());

// ... (Health check & DB test code remains same) ...
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Kiros Triage API is running" });
});

app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      success: true,
      message: "Database connected successfully",
      timestamp: result.rows[0].now,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Database connection failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// API Routes
import ticketRoutes from "./routes/tickets";
app.use("/api", ticketRoutes);

// Webhook for Worker to notify completion
app.post("/api/webhooks/ai-completed", (req, res) => {
  const { ticketId, status, aiResult } = req.body;

  if (!ticketId) {
    res.status(400).json({ success: false, error: "Missing ticketId" });
    return;
  }

  console.log(`📡 Emitting ticket_processed for Ticket #${ticketId}`);

  // Real-time update to all clients
  io.emit("ticket_processed", { ticketId, status, aiResult });

  res.json({ success: true, message: "Notification broadcasted" });
});

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("Error:", err);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      },
    });
  },
);

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`⚡ Socket.IO running`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🗄️  Database test: http://localhost:${PORT}/api/test-db`);
});

export default app;
