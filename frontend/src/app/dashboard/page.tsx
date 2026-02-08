"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ApiClient } from "@/lib/api";
import type { Ticket } from "@/types";
import Link from "next/link";
import { useEffect, useState } from "react";

const urgencyColors = {
  high: "bg-red-100 text-red-800 border-red-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-green-100 text-green-800 border-green-200",
};

const statusColors = {
  pending: "bg-gray-100 text-gray-800",
  processing: "bg-blue-100 text-blue-800",
  processed: "bg-green-100 text-green-800",
  resolved: "bg-purple-100 text-purple-800",
  ai_failed: "bg-red-100 text-red-800",
};

import { socket } from "@/lib/socket";

export default function DashboardPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTickets = async () => {
    try {
      const response = await ApiClient.getTickets({ page: 1, limit: 50 });
      if (response.success) {
        setTickets(response.data.tickets);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  // ... inside component ...

  useEffect(() => {
    fetchTickets();

    // 1. Connect Socket
    socket.connect();

    // 2. Listen for Real-time Updates
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socket.on("ticket_processed", (data: any) => {
      console.log("⚡ Real-time update received:", data);

      // Reload tickets immediately
      fetchTickets();

      // Optional: Show toast or highlight (simplified for now)
    });

    // 3. Fallback Polling (in case socket fails)
    const interval = setInterval(fetchTickets, 10000);

    return () => {
      socket.off("ticket_processed");
      socket.disconnect();
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-6xl mx-auto pt-12">
          <p className="text-center text-muted-foreground">
            Loading tickets...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto pt-12 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Agent Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage and resolve customer support tickets
            </p>
          </div>
          <Link href="/submit">
            <Button>+ New Ticket</Button>
          </Link>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="grid gap-4">
          {tickets.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                No tickets found.{" "}
                <Link href="/submit" className="text-primary underline">
                  Submit one
                </Link>{" "}
                to get started.
              </CardContent>
            </Card>
          ) : (
            tickets.map((ticket) => (
              <Link key={ticket.id} href={`/dashboard/${ticket.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          Ticket #{ticket.id}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {ticket.email || "No email provided"} •{" "}
                          <span suppressHydrationWarning>
                            {new Date(ticket.created_at).toLocaleString()}
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge
                          variant="outline"
                          className={statusColors[ticket.status]}
                        >
                          {ticket.status}
                        </Badge>
                        {ticket.ai_result && (
                          <Badge
                            variant="outline"
                            className={urgencyColors[ticket.ai_result.urgency]}
                          >
                            {ticket.ai_result.urgency.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {ticket.content}
                    </p>
                    {ticket.ai_result && (
                      <div className="mt-3 flex gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary">
                          {ticket.ai_result.category}
                        </Badge>
                        <span>
                          Sentiment: {ticket.ai_result.sentiment_score}/10
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
