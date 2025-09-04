import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Calendar, Globe, MapPin, Target, AlertTriangle, CheckCircle, ThumbsUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface Company {
  id: string
  name: string
  sector: string
  stage: string
  funding: string
  status: string
  lastContact: string
  aiScore: number
  foundedYear: number
  teamSize: number
  revenue: string
  description: string
  website: string
  location: string
  founders: Array<{
    name: string
    role: string
    background: string
  }>
  fundingHistory: Array<{
    round: string
    amount: string
    date: string
    investors: string[]
  }>
  keyMetrics: {
    arr: string
    growth: string
    customers: number
    churn: string
    cac: string
    ltv: string
  }
  conversations: Array<{
    id: string
    date: string
    duration: string
    type: string
    summary: string
    keyPoints: string[]
    transcript: string
    sentiment: string
    nextSteps: string[]
  }>
  aiInsights: {
    investmentThesis: string
    strengths: string[]
    concerns: string[]
    marketAnalysis: string
    recommendation: string
  }
}

interface CompanyProfileProps {
  company: Company
}

const statusColors = {
  "Initial Contact": "bg-muted text-muted-foreground",
  Qualified: "bg-chart-3/20 text-chart-3",
  "Due Diligence": "bg-chart-2/20 text-chart-2",
  "Hot Lead": "bg-chart-1 text-white",
  Passed: "bg-destructive/20 text-destructive",
}

export function CompanyProfile({ company }: CompanyProfileProps) {
  return (
    <div className="space-y-6">
      {/* Company Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{company.name}</CardTitle>
                <CardDescription className="text-base mt-2">{company.description}</CardDescription>
              </div>
              <Badge className={cn("text-sm", statusColors[company.status as keyof typeof statusColors])}>
                {company.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a href={company.website} className="text-sm text-primary hover:underline">
                  Website
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{company.location}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Founded {company.foundedYear}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{company.teamSize} employees</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AI Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div
                className={cn(
                  "text-4xl font-bold",
                  company.aiScore >= 80
                    ? "text-chart-4"
                    : company.aiScore >= 60
                      ? "text-chart-2"
                      : "text-muted-foreground",
                )}
              >
                {company.aiScore}
              </div>
              <div className="text-sm text-muted-foreground">Investment Score</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Last Contact</div>
              <div className="text-sm text-muted-foreground">{company.lastContact}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Current Stage</div>
              <div className="text-sm text-muted-foreground">{company.stage}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="funding">Funding</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold">{company.keyMetrics.arr}</div>
                    <div className="text-sm text-muted-foreground">ARR</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-chart-4">{company.keyMetrics.growth}</div>
                    <div className="text-sm text-muted-foreground">Growth Rate</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{company.keyMetrics.customers}</div>
                    <div className="text-sm text-muted-foreground">Customers</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{company.keyMetrics.churn}</div>
                    <div className="text-sm text-muted-foreground">Churn Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Unit Economics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">CAC</span>
                    <span className="font-medium">{company.keyMetrics.cac}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">LTV</span>
                    <span className="font-medium">{company.keyMetrics.ltv}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-sm font-medium">LTV/CAC Ratio</span>
                    <span className="font-bold text-chart-4">40:1</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Funding Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-2xl font-bold">{company.funding}</div>
                  <div className="text-sm text-muted-foreground">Current Round</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Stage</div>
                  <Badge variant="outline">{company.stage}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conversations" className="space-y-6">
          {company.conversations.map((conversation) => (
            <Card key={conversation.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{conversation.type}</CardTitle>
                    <CardDescription>
                      {conversation.date} • {conversation.duration}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={conversation.sentiment === "Positive" ? "default" : "secondary"}>
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      {conversation.sentiment}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Summary</h4>
                  <p className="text-sm text-muted-foreground">{conversation.summary}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Key Points</h4>
                  <ul className="space-y-1">
                    {conversation.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-chart-4 mt-0.5 flex-shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Next Steps</h4>
                  <ul className="space-y-1">
                    {conversation.nextSteps.map((step, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm">
                        <Target className="h-4 w-4 text-chart-2 mt-0.5 flex-shrink-0" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <details className="border-t pt-4">
                  <summary className="cursor-pointer font-medium text-sm">View Full Transcript</summary>
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <pre className="text-sm whitespace-pre-wrap font-mono">{conversation.transcript}</pre>
                  </div>
                </details>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Investment Thesis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{company.aiInsights.investmentThesis}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-chart-4" />
                  <span>Strengths</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {company.aiInsights.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-chart-4 mt-2 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-chart-2" />
                  <span>Concerns</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {company.aiInsights.concerns.map((concern, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-chart-2 mt-2 flex-shrink-0" />
                      <span>{concern}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Market Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{company.aiInsights.marketAnalysis}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recommendation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed font-medium">{company.aiInsights.recommendation}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {company.founders.map((founder, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {founder.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{founder.name}</CardTitle>
                      <CardDescription>{founder.role}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{founder.background}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="funding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Funding History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {company.fundingHistory.map((round, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <div className="font-medium">{round.round}</div>
                      <div className="text-sm text-muted-foreground">{round.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{round.amount}</div>
                      <div className="text-sm text-muted-foreground">{round.investors.join(", ")}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
