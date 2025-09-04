import { Navigation } from "@/components/navigation"
import { PageHeader } from "@/components/page-header"
import { CompanyProfile } from "@/components/company-profile"
import { Button } from "@/components/ui/button"
import { Phone, MessageSquare, Edit } from "lucide-react"
import { notFound } from "next/navigation"

// Mock company data - in real app this would come from API
const getCompany = (id: string) => {
  const companies = {
    "1": {
      id: "1",
      name: "TechFlow AI",
      sector: "AI/ML",
      stage: "Series A",
      funding: "$5M",
      status: "Hot Lead",
      lastContact: "2 hours ago",
      aiScore: 92,
      foundedYear: 2021,
      teamSize: 25,
      revenue: "$2M ARR",
      description: "AI-powered workflow automation for enterprise teams",
      website: "https://techflow.ai",
      location: "San Francisco, CA",
      founders: [
        { name: "Sarah Chen", role: "CEO", background: "Former Google AI researcher" },
        { name: "Marcus Rodriguez", role: "CTO", background: "Ex-Tesla Autopilot team" },
      ],
      fundingHistory: [
        { round: "Series A", amount: "$5M", date: "2024-01", investors: ["Accel Partners", "First Round"] },
        { round: "Seed", amount: "$1.2M", date: "2023-03", investors: ["Y Combinator", "Angel investors"] },
      ],
      keyMetrics: {
        arr: "$2M",
        growth: "15% MoM",
        customers: 150,
        churn: "2.5%",
        cac: "$1,200",
        ltv: "$48,000",
      },
      conversations: [
        {
          id: "conv-1",
          date: "2024-01-15",
          duration: "22 minutes",
          type: "Initial Screening",
          summary:
            "Strong technical team with proven AI expertise. Product shows impressive early traction with enterprise customers. Seeking Series A to scale sales and expand internationally.",
          keyPoints: [
            "15% month-over-month growth in ARR",
            "Strong product-market fit in enterprise automation",
            "Experienced team with AI/ML background",
            "Clear path to $10M ARR within 18 months",
          ],
          transcript:
            "AI: Thank you for joining today's call, Sarah. Can you start by telling me about TechFlow AI and what problem you're solving?\n\nSarah: Absolutely. TechFlow AI is revolutionizing how enterprise teams handle repetitive workflows. We use advanced AI to automate complex business processes that traditionally required human intervention...",
          sentiment: "Positive",
          nextSteps: [
            "Schedule technical deep dive",
            "Review financial projections",
            "Connect with reference customers",
          ],
        },
      ],
      aiInsights: {
        investmentThesis:
          "TechFlow AI represents a compelling investment opportunity in the rapidly growing enterprise AI automation market. The company demonstrates strong product-market fit with impressive early metrics and a world-class technical team.",
        strengths: [
          "Experienced founding team with relevant AI/ML expertise",
          "Strong early traction with enterprise customers",
          "Healthy unit economics and growth metrics",
          "Large addressable market in workflow automation",
        ],
        concerns: [
          "Competitive landscape with well-funded players",
          "Customer concentration risk with top 3 customers representing 40% of revenue",
          "Need to prove scalability of sales motion",
        ],
        marketAnalysis:
          "The enterprise workflow automation market is projected to reach $23B by 2027, growing at 15% CAGR. TechFlow's AI-first approach positions them well against traditional RPA solutions.",
        recommendation: "Strong consideration for investment. Recommend proceeding to due diligence phase.",
      },
    },
  }

  return companies[id as keyof typeof companies] || null
}

interface CompanyPageProps {
  params: { id: string }
}

export default function CompanyPage({ params }: CompanyPageProps) {
  const company = getCompany(params.id)

  if (!company) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="px-6 py-8">
        <PageHeader title={company.name} description={`${company.sector} • ${company.stage} • ${company.location}`}>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Notes
            </Button>
            <Button variant="outline">
              <MessageSquare className="h-4 w-4 mr-2" />
              View All Calls
            </Button>
            <Button>
              <Phone className="h-4 w-4 mr-2" />
              Schedule Call
            </Button>
          </div>
        </PageHeader>

        <div className="mt-8">
          <CompanyProfile company={company} />
        </div>
      </main>
    </div>
  )
}
