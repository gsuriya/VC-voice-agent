import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Target, Clock, DollarSign } from "lucide-react"

const pipelineStats = [
  {
    title: "Total Pipeline Value",
    value: "$47.5M",
    change: "+18%",
    trend: "up",
    icon: DollarSign,
    description: "Combined funding across all pipeline companies",
  },
  {
    title: "Active Deals",
    value: "23",
    change: "+5",
    trend: "up",
    icon: Target,
    description: "Companies in Due Diligence or Hot Lead status",
  },
  {
    title: "Avg. Deal Size",
    value: "$4.2M",
    change: "+12%",
    trend: "up",
    icon: TrendingUp,
    description: "Average funding amount per company",
  },
  {
    title: "Pipeline Velocity",
    value: "14 days",
    change: "-3 days",
    trend: "up",
    icon: Clock,
    description: "Average time from contact to qualification",
  },
]

const statusBreakdown = [
  { status: "Hot Lead", count: 8, percentage: 35, color: "bg-chart-1" },
  { status: "Due Diligence", count: 6, percentage: 26, color: "bg-chart-2" },
  { status: "Qualified", count: 5, percentage: 22, color: "bg-chart-3" },
  { status: "Initial Contact", count: 4, percentage: 17, color: "bg-muted" },
]

export function PipelineStats() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Key Metrics */}
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        {pipelineStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <TrendingUp className="h-3 w-3 mr-1 text-chart-4" />
                  <span className="text-chart-4">{stat.change}</span>
                  <span className="ml-1">from last month</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Pipeline Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Pipeline Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {statusBreakdown.map((item) => (
            <div key={item.status} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{item.status}</span>
                <span className="text-muted-foreground">{item.count}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${item.percentage}%` }} />
              </div>
              <div className="text-xs text-muted-foreground">{item.percentage}% of pipeline</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
