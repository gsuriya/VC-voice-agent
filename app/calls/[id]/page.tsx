import { Navigation } from "@/components/navigation"
import { LiveCallMonitor } from "@/components/live-call-monitor"
import { notFound } from "next/navigation"

// Mock call data
const getCall = (id: string) => {
  const calls = {
    "call-1": {
      id: "call-1",
      companyName: "TechFlow AI",
      founderName: "Sarah Chen",
      startTime: "2:34 PM",
      duration: "12:45",
      status: "live",
      type: "Series A Discussion",
      aiScore: 85,
      isLive: true,
    },
    "call-2": {
      id: "call-2",
      companyName: "GreenEnergy Solutions",
      founderName: "Marcus Rodriguez",
      startTime: "3:15 PM",
      duration: "8:22",
      status: "live",
      type: "Initial Screening",
      aiScore: 72,
      isLive: true,
    },
    "call-3": {
      id: "call-3",
      companyName: "FinanceOS",
      founderName: "Alex Kim",
      startTime: "Yesterday 4:20 PM",
      duration: "18:33",
      status: "completed",
      type: "Follow-up Call",
      aiScore: 78,
      isLive: false,
    },
  }

  return calls[id as keyof typeof calls] || null
}

interface CallPageProps {
  params: { id: string }
}

export default function CallPage({ params }: CallPageProps) {
  const call = getCall(params.id)

  if (!call) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <LiveCallMonitor call={call} />
    </div>
  )
}
