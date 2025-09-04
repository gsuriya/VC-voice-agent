import { Navigation } from "@/components/navigation"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Phone, Play, Clock, Eye } from "lucide-react"
import Link from "next/link"

// Mock data for calls
const activeCalls = [
  {
    id: "call-1",
    companyName: "TechFlow AI",
    founderName: "Sarah Chen",
    startTime: "2:34 PM",
    duration: "12:45",
    status: "live",
    type: "Series A Discussion",
    aiScore: 85,
  },
  {
    id: "call-2",
    companyName: "GreenEnergy Solutions",
    founderName: "Marcus Rodriguez",
    startTime: "3:15 PM",
    duration: "8:22",
    status: "live",
    type: "Initial Screening",
    aiScore: 72,
  },
]

const recentCalls = [
  {
    id: "call-3",
    companyName: "FinanceOS",
    founderName: "Alex Kim",
    startTime: "Yesterday 4:20 PM",
    duration: "18:33",
    status: "completed",
    type: "Follow-up Call",
    aiScore: 78,
    outcome: "Qualified",
  },
  {
    id: "call-4",
    companyName: "HealthTech Innovations",
    founderName: "Dr. Lisa Wang",
    startTime: "Yesterday 2:10 PM",
    duration: "25:17",
    status: "completed",
    type: "Due Diligence",
    aiScore: 91,
    outcome: "Hot Lead",
  },
  {
    id: "call-5",
    companyName: "EduPlatform",
    founderName: "James Miller",
    startTime: "2 days ago",
    duration: "15:42",
    status: "completed",
    type: "Initial Screening",
    aiScore: 65,
    outcome: "Passed",
  },
]

export default function CallsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="px-6 py-8">
        <PageHeader title="Live Calls" description="Monitor AI agent conversations with startup founders in real-time">
          <Button>
            <Phone className="h-4 w-4 mr-2" />
            Schedule New Call
          </Button>
        </PageHeader>

        {/* Active Calls */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Active Calls</h2>
            <Badge variant="outline" className="bg-chart-1/10 text-chart-1 border-chart-1/20">
              {activeCalls.length} Live
            </Badge>
          </div>

          {activeCalls.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeCalls.map((call) => (
                <Card key={call.id} className="border-chart-1/20 bg-chart-1/5">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{call.companyName}</CardTitle>
                        <CardDescription>
                          {call.founderName} • {call.type}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-2 bg-chart-1 rounded-full animate-pulse" />
                        <Badge className="bg-chart-1 text-white">LIVE</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Started</div>
                        <div className="font-medium">{call.startTime}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Duration</div>
                        <div className="font-medium">{call.duration}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">AI Score</div>
                        <div className="font-medium text-chart-4">{call.aiScore}/100</div>
                      </div>
                    </div>
                    <Link href={`/calls/${call.id}`}>
                      <Button className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        Monitor Call
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Phone className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No active calls</h3>
                <p className="text-muted-foreground text-center">
                  All AI agents are currently available. Schedule a new call to get started.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Calls */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-6">Recent Calls</h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {recentCalls.map((call) => (
                  <div key={call.id} className="p-6 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Phone className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{call.companyName}</div>
                          <div className="text-sm text-muted-foreground">
                            {call.founderName} • {call.type}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <div className="text-sm font-medium">{call.startTime}</div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {call.duration}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">AI Score</div>
                          <div className="text-sm font-medium">{call.aiScore}/100</div>
                        </div>
                        <Badge
                          variant={
                            call.outcome === "Hot Lead"
                              ? "default"
                              : call.outcome === "Qualified"
                                ? "secondary"
                                : "outline"
                          }
                          className={
                            call.outcome === "Hot Lead"
                              ? "bg-chart-1 text-white"
                              : call.outcome === "Qualified"
                                ? "bg-chart-3/20 text-chart-3"
                                : ""
                          }
                        >
                          {call.outcome}
                        </Badge>
                        <Link href={`/calls/${call.id}`}>
                          <Button variant="outline" size="sm">
                            <Play className="h-4 w-4 mr-2" />
                            Review
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
