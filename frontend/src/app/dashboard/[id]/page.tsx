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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiClient } from "@/lib/api";
import type { Ticket } from "@/types";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = Number(params.id);

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [draftReply, setDraftReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await ApiClient.getTicket(ticketId);
        if (response.success) {
          setTicket(response.data);
          setDraftReply(response.data.ai_result?.draft_reply || "");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load ticket");
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [ticketId]);

  const handleResolve = async () => {
    if (!ticket) return;

    setResolving(true);
    setError("");

    try {
      await ApiClient.resolveTicket(ticket.id, draftReply);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resolve ticket");
    } finally {
      setResolving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-4xl mx-auto pt-12">
          <p className="text-center text-muted-foreground">Loading ticket...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-4xl mx-auto pt-12">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-destructive">Ticket not found</p>
              <Link href="/dashboard">
                <Button className="mt-4">Back to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto pt-12 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Ticket #{ticket.id}</h1>
            <p className="text-muted-foreground mt-1">
              {ticket.email || "No email"} •{" "}
              <span suppressHydrationWarning>
                {new Date(ticket.created_at).toLocaleString()}
              </span>
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">← Back</Button>
          </Link>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Customer Complaint */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Complaint</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{ticket.content}</p>
          </CardContent>
        </Card>

        {/* AI Analysis */}
        {ticket.ai_result ? (
          <Card>
            <CardHeader>
              <CardTitle>AI Analysis</CardTitle>
              <CardDescription>
                Processed{" "}
                <span suppressHydrationWarning>
                  {new Date(ticket.ai_result.processed_at).toLocaleString()}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Status
                  </Label>
                  <div className="mt-1">
                    <Badge className={statusColors[ticket.status]}>
                      {ticket.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Urgency
                  </Label>
                  <div className="mt-1">
                    <Badge
                      variant="outline"
                      className={urgencyColors[ticket.ai_result.urgency]}
                    >
                      {ticket.ai_result.urgency.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Category
                  </Label>
                  <div className="mt-1">
                    <Badge variant="secondary">
                      {ticket.ai_result.category}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Sentiment
                  </Label>
                  <div className="mt-1">
                    <Badge variant="outline">
                      {ticket.ai_result.sentiment_score}/10
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              {ticket.status === "pending" && "⏳ Waiting for AI analysis..."}
              {ticket.status === "processing" && "🤖 AI is analyzing..."}
              {ticket.status === "ai_failed" && "❌ AI analysis failed"}
            </CardContent>
          </Card>
        )}

        {/* Draft Reply */}
        {ticket.ai_result && (
          <Card>
            <CardHeader>
              <CardTitle>Draft Reply</CardTitle>
              <CardDescription>Edit and resolve when ready</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="draft">Reply to customer</Label>
                <Textarea
                  id="draft"
                  value={draftReply}
                  onChange={(e) => setDraftReply(e.target.value)}
                  rows={8}
                  className="mt-2"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleResolve}
                  disabled={resolving || ticket.status === "resolved"}
                  className="flex-1"
                >
                  {resolving
                    ? "Resolving..."
                    : ticket.status === "resolved"
                      ? "Already Resolved"
                      : "Save & Resolve"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
