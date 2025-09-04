import { Navigation } from "@/components/navigation"
import { PageHeader } from "@/components/page-header"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { Button } from "@/components/ui/button"
import { Download, Filter } from "lucide-react"

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="px-6 py-8">
        <PageHeader
          title="Analytics Dashboard"
          description="Comprehensive insights and trends across your AI agent conversations and deal flow"
        >
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </PageHeader>

        <div className="mt-8">
          <AnalyticsDashboard />
        </div>
      </main>
    </div>
  )
}
