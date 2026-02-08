"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiClient } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SubmitTicketPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [processingTime, setProcessingTime] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await ApiClient.createTicket({
        email: email || undefined,
        content,
      });

      if (response.success) {
        setSuccess(true);
        setProcessingTime(response.data.processing_time_ms || null);
        setContent("");
        setEmail("");

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-2xl mx-auto pt-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Submit a Support Ticket</CardTitle>
            <CardDescription>
              Tell us about your issue and our AI will analyze it immediately
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Describe your issue *</Label>
                <Textarea
                  id="content"
                  placeholder="I cannot access my dashboard. It shows a 500 error..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={6}
                  minLength={10}
                />
                <p className="text-sm text-muted-foreground">
                  Minimum 10 characters required
                </p>
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 text-green-700 p-4 rounded-md text-sm border border-green-200">
                  <div className="font-semibold text-lg flex items-center gap-2">
                    <span>🚀 Ticket Created!</span>
                  </div>
                  <div className="mt-1">
                    Server Response: <strong>{processingTime}ms</strong>
                    <span className="text-green-600 ml-2 text-xs bg-green-100 px-2 py-0.5 rounded-full">
                      Non-blocking AI
                    </span>
                  </div>
                  <div className="mt-1 text-green-600/80 text-xs">
                    Redirecting to dashboard to view AI analysis...
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || content.length < 10}
                className="w-full"
              >
                {loading ? "Submitting..." : "Submit Ticket"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
