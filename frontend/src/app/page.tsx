import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl mb-2">🎫 Kiros Support Hub</CardTitle>
          <CardDescription className="text-lg">
            AI-Powered Support Ticket Triage & Resolution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/submit" className="group">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    📝 Submit Ticket
                  </CardTitle>
                  <CardDescription>
                    Report an issue and get instant AI analysis
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/dashboard" className="group">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    👨‍💼 Agent Dashboard
                  </CardTitle>
                  <CardDescription>
                    View and manage all support tickets
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Powered by <strong>Groq AI (Mixtral)</strong> • Background Worker
              • PostgreSQL
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
