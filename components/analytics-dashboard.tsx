"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  Users,
  Phone,
  Target,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
} from "lucide-react"

// Mock analytics data
const dealFlowData = [
  { month: "Jan", conversations: 45, qualified: 12, invested: 2 },
  { month: "Feb", conversations: 52, qualified: 15, invested: 3 },
  { month: "Mar", conversations: 38, qualified: 10, invested: 1 },
  { month: "Apr", conversations: 61, qualified: 18, invested: 4 },
  { month: "May", conversations: 55, qualified: 16, invested: 3 },
  { month: "Jun", conversations: 68, qualified: 22, invested: 5 },
]

const sectorData = [
  { name: "AI/ML", value: 35, companies: 28, avgScore: 82 },
  { name: "FinTech", value: 25, companies: 20, avgScore: 78 },
  { name: "HealthTech", value: 20, companies: 16, avgScore: 85 },
  { name: "CleanTech", value: 12, companies: 10, avgScore: 74 },
  { name: "EdTech", value: 8, companies: 6, avgScore: 71 },
]

const performanceMetrics = [
  {
    title: "Conversion Rate",
    value: "24.5%",
    change: "+3.2%",
    trend: "up",
    description: "Conversations to qualified leads",
  },
  {
    title: "Investment Rate",
    value: "8.1%",
    change: "+1.4%",
    trend: "up",
    description: "Qualified leads to investment",
  },
  {
    title: "Avg. Call Duration",
    value: "18.5m",
    change: "-2.1m",
    trend: "down",
    description: "Average conversation length",
  },
  {
    title: "AI Accuracy",
    value: "91.2%",
    change: "+2.8%",
    trend: "up",
    description: "Prediction accuracy vs outcomes",
  },
]

const emergingTrends = [
  {
    trend: "AI Infrastructure Startups",
    growth: "+45%",
    companies: 12,
    avgFunding: "$3.2M",
    description: "Growing demand for AI tooling and infrastructure",
  },
  {
    trend: "Climate Tech Solutions",
    growth: "+32%",
    companies: 8,
    avgFunding: "$2.8M",
    description: "Increased focus on sustainability and carbon reduction",
  },
  {
    trend: "Developer Tools",
    growth: "+28%",
    companies: 15,
    avgFunding: "$1.9M",
    description: "Rising demand for productivity and automation tools",
  },
]

const painPoints = [
  { issue: "Customer Acquisition", frequency: 78, severity: "High" },
  { issue: "Product-Market Fit", frequency: 65, severity: "High" },
  { issue: "Fundraising Strategy", frequency: 52, severity: "Medium" },
  { issue: "Team Scaling", frequency: 48, severity: "Medium" },
  { issue: "Competition", frequency: 41, severity: "Medium" },
  { issue: "Technical Debt", frequency: 35, severity: "Low" },
]

const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"]

export function AnalyticsDashboard() {
  return (
    <div className="space-y-8">
      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceMetrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
              {metric.trend === "up" ? (
                <TrendingUp className="h-4 w-4 text-chart-4" />
              ) : (
                <TrendingDown className="h-4 w-4 text-chart-2" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <span className={metric.trend === "up" ? "text-chart-4" : "text-chart-2"}>{metric.change}</span>
                <span className="ml-1">from last month</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sectors">Sectors</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Deal Flow Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Deal Flow Trends</CardTitle>
                <CardDescription>Monthly conversation and conversion metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dealFlowData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="conversations" stackId="1" stroke="#6366f1" fill="#6366f1" />
                    <Area type="monotone" dataKey="qualified" stackId="2" stroke="#f59e0b" fill="#f59e0b" />
                    <Area type="monotone" dataKey="invested" stackId="3" stroke="#10b981" fill="#10b981" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Sector Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Sector Distribution</CardTitle>
                <CardDescription>Portfolio breakdown by industry sector</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sectorData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sectorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Emerging Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5" />
                <span>Emerging Market Trends</span>
              </CardTitle>
              <CardDescription>Hot sectors and investment themes identified by AI analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {emergingTrends.map((trend, index) => (
                  <div key={index} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{trend.trend}</h4>
                      <Badge className="bg-chart-4/20 text-chart-4">{trend.growth}</Badge>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Companies:</span>
                        <span>{trend.companies}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg. Funding:</span>
                        <span>{trend.avgFunding}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{trend.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sectors" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sector Performance</CardTitle>
                <CardDescription>AI scores and company counts by sector</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={sectorData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avgScore" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sector Details</CardTitle>
                <CardDescription>Detailed breakdown by industry</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sectorData.map((sector, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{sector.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">{sector.companies} companies</span>
                          <Badge variant="outline">{sector.avgScore} avg score</Badge>
                        </div>
                      </div>
                      <Progress value={sector.value} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Investment Trends Over Time</CardTitle>
              <CardDescription>Monthly trends in deal flow and investment activity</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={dealFlowData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="conversations" stroke="#6366f1" strokeWidth={2} />
                  <Line type="monotone" dataKey="qualified" stroke="#f59e0b" strokeWidth={2} />
                  <Line type="monotone" dataKey="invested" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Agent Performance</CardTitle>
                <CardDescription>Accuracy and efficiency metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Prediction Accuracy</span>
                      <span>91.2%</span>
                    </div>
                    <Progress value={91.2} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Call Quality Score</span>
                      <span>87.5%</span>
                    </div>
                    <Progress value={87.5} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Insight Relevance</span>
                      <span>94.1%</span>
                    </div>
                    <Progress value={94.1} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
                <CardDescription>Pipeline conversion rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>Initial Conversations</span>
                    </div>
                    <span className="font-medium">339</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Qualified Leads</span>
                    </div>
                    <span className="font-medium">93 (27.4%)</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span>Due Diligence</span>
                    </div>
                    <span className="font-medium">28 (30.1%)</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-chart-1/10 rounded-lg border border-chart-1/20">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-chart-1" />
                      <span>Investments</span>
                    </div>
                    <span className="font-medium text-chart-1">18 (64.3%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Common Founder Pain Points</span>
              </CardTitle>
              <CardDescription>Most frequently mentioned challenges across conversations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {painPoints.map((point, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {point.severity === "High" && <AlertTriangle className="h-4 w-4 text-chart-2" />}
                        {point.severity === "Medium" && <Clock className="h-4 w-4 text-chart-5" />}
                        {point.severity === "Low" && <CheckCircle className="h-4 w-4 text-chart-4" />}
                      </div>
                      <div>
                        <div className="font-medium">{point.issue}</div>
                        <div className="text-sm text-muted-foreground">
                          Mentioned in {point.frequency}% of conversations
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          point.severity === "High"
                            ? "destructive"
                            : point.severity === "Medium"
                              ? "default"
                              : "outline"
                        }
                      >
                        {point.severity}
                      </Badge>
                      <div className="w-20">
                        <Progress value={point.frequency} className="h-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Success Factors</CardTitle>
                <CardDescription>Traits of high-scoring companies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-chart-4" />
                    <span className="text-sm">Strong technical founding team</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-chart-4" />
                    <span className="text-sm">Clear product-market fit evidence</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-chart-4" />
                    <span className="text-sm">Healthy unit economics</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-chart-4" />
                    <span className="text-sm">Large addressable market</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-chart-4" />
                    <span className="text-sm">Defensible competitive moat</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Red Flags</CardTitle>
                <CardDescription>Warning signs from AI analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-chart-2" />
                    <span className="text-sm">High customer concentration risk</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-chart-2" />
                    <span className="text-sm">Unclear monetization strategy</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-chart-2" />
                    <span className="text-sm">Weak competitive differentiation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-chart-2" />
                    <span className="text-sm">Regulatory compliance concerns</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-chart-2" />
                    <span className="text-sm">Founder-market fit questions</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
