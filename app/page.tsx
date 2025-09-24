import { Navigation } from "@/components/navigation"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Phone, Plus, Database, Key } from "lucide-react"

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="px-6 py-8">
        <PageHeader
          title="Core Infrastructure Dashboard"
          description="Clean foundation with Google OAuth, OpenAI API, VAPI, and Pinecone DB"
        >
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Key className="h-4 w-4 mr-2" />
              Google Auth
            </Button>
            <Button>
              <Phone className="h-4 w-4 mr-2" />
              Test VAPI
            </Button>
          </div>
        </PageHeader>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-2">Google OAuth</h3>
            <p className="text-sm text-muted-foreground">Authentication and calendar integration ready</p>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-2">OpenAI API</h3>
            <p className="text-sm text-muted-foreground">AI completions and embeddings configured</p>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-2">VAPI Integration</h3>
            <p className="text-sm text-muted-foreground">Voice AI calling system ready</p>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-2">Pinecone DB</h3>
            <p className="text-sm text-muted-foreground">Vector database for semantic search</p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20">
              <div className="text-center">
                <Key className="h-6 w-6 mx-auto mb-2" />
                <div>Test Google Auth</div>
              </div>
            </Button>
            
            <Button variant="outline" className="h-20">
              <div className="text-center">
                <Database className="h-6 w-6 mx-auto mb-2" />
                <div>Test Pinecone</div>
              </div>
            </Button>
            
            <Button variant="outline" className="h-20">
              <div className="text-center">
                <Phone className="h-6 w-6 mx-auto mb-2" />
                <div>Test VAPI Call</div>
              </div>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}