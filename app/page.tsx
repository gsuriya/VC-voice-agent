import { Navigation } from "@/components/navigation"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Phone, Plus } from "lucide-react"
import { PipelineStats } from "@/components/pipeline-stats"
import { PipelineView } from "@/components/pipeline-view"

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="px-6 py-8">
        <PageHeader
          title="Pipeline Dashboard"
          description="AI-powered deal sourcing and pipeline management for venture capital"
        >
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Company
            </Button>
            <Button>
              <Phone className="h-4 w-4 mr-2" />
              Start AI Call
            </Button>
          </div>
        </PageHeader>

        <div className="mt-8">
          <PipelineStats />
        </div>

        <div className="mt-8">
          <PipelineView />
        </div>
      </main>
    </div>
  )
}
