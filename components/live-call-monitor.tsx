"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  MessageSquare,
  Flag,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Send,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Call {
  id: string
  companyName: string
  founderName: string
  startTime: string
  duration: string
  status: string
  type: string
  aiScore: number
  isLive: boolean
}

interface LiveCallMonitorProps {
  call: Call
}

// Mock real-time transcript data
const mockTranscript = [
  {
    id: 1,
    speaker: "AI Agent",
    text: "Thank you for joining today's call, Sarah. I'm excited to learn more about TechFlow AI. Can you start by telling me about the problem you're solving?",
    timestamp: "2:34:12 PM",
    sentiment: "neutral",
  },
  {
    id: 2,
    speaker: "Sarah Chen",
    text: "We're tackling the massive inefficiency in enterprise workflows. Most companies are still using manual processes for tasks that could be completely automated with AI.",
    timestamp: "2:34:45 PM",
    sentiment: "positive",
  },
  {
    id: 3,
    speaker: "AI Agent",
    text: "That's a significant market opportunity. Can you share some specific examples of workflows you're automating?",
    timestamp: "2:35:02 PM",
    sentiment: "neutral",
  },
  {
    id: 4,
    speaker: "Sarah Chen",
    text: "We're seeing great traction in document processing, customer onboarding, and compliance reporting. Our largest client saved 40 hours per week just on invoice processing.",
    timestamp: "2:35:28 PM",
    sentiment: "positive",
  },
]

const mockInsights = [
  {
    type: "strength",
    text: "Strong product-market fit demonstrated with quantifiable customer savings",
    confidence: 92,
  },
  {
    type: "opportunity",
    text: "Large addressable market in enterprise automation",
    confidence: 88,
  },
  {
    type: "concern",
    text: "Competitive landscape with established players",
    confidence: 75,
  },
]

const suggestedQuestions = [
  "What's your customer acquisition cost and lifetime value?",
  "How do you differentiate from competitors like UiPath?",
  "What are your revenue projections for the next 18 months?",
  "Can you walk me through your go-to-market strategy?",
]

export function LiveCallMonitor({ call }: LiveCallMonitorProps) {
  const [transcript, setTranscript] = useState(mockTranscript)
  const [insights, setInsights] = useState(mockInsights)
  const [isMuted, setIsMuted] = useState(false)
  const [isListening, setIsListening] = useState(true)
  const [notes, setNotes] = useState("")
  const [flaggedQuestion, setFlaggedQuestion] = useState("")
  const [currentDuration, setCurrentDuration] = useState(call.duration)

  // Simulate real-time updates for live calls
  useEffect(() => {
    if (!call.isLive) return

    const interval = setInterval(() => {
      // Simulate new transcript entries
      if (Math.random() > 0.7) {
        const newEntry = {
          id: transcript.length + 1,
          speaker: Math.random() > 0.5 ? "AI Agent" : call.founderName,
          text: "This is a simulated real-time transcript entry...",
          timestamp: new Date().toLocaleTimeString(),
          sentiment: ["positive", "neutral", "negative"][Math.floor(Math.random() * 3)] as
            | "positive"
            | "neutral"
            | "negative",
        }
        setTranscript((prev) => [...prev, newEntry])
      }

      // Update duration
      const [minutes, seconds] = currentDuration.split(":").map(Number)
      const totalSeconds = minutes * 60 + seconds + 1
      const newMinutes = Math.floor(totalSeconds / 60)
      const newSeconds = totalSeconds % 60
      setCurrentDuration(`${newMinutes}:${newSeconds.toString().padStart(2, "0")}`)
    }, 3000)

    return () => clearInterval(interval)
  }, [call.isLive, transcript.length, currentDuration, call.founderName])

  const handleFlagQuestion = () => {
    if (flaggedQuestion.trim()) {
      // In a real app, this would send the question to the AI agent
      console.log("Flagged question:", flaggedQuestion)
      setFlaggedQuestion("")
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Call Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{call.companyName}</h1>
          <p className="text-muted-foreground">
            {call.founderName} • {call.type}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {call.isLive && (
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-chart-1 rounded-full animate-pulse" />
              <Badge className="bg-chart-1 text-white">LIVE</Badge>
            </div>
          )}
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Duration</div>
            <div className="font-mono text-lg">{currentDuration}</div>
          </div>
        </div>
      </div>

      {/* Call Controls */}
      {call.isLive && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Call Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button variant={isMuted ? "destructive" : "outline"} size="sm" onClick={() => setIsMuted(!isMuted)}>
                  {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  {isMuted ? "Unmute" : "Mute"}
                </Button>
                <Button
                  variant={isListening ? "outline" : "secondary"}
                  size="sm"
                  onClick={() => setIsListening(!isListening)}
                >
                  {isListening ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  {isListening ? "Listening" : "Paused"}
                </Button>
              </div>
              <Button variant="destructive" size="sm">
                <PhoneOff className="h-4 w-4 mr-2" />
                End Call
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live Transcript */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Live Transcript</span>
                {call.isLive && <div className="h-2 w-2 bg-chart-1 rounded-full animate-pulse" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {transcript.map((entry) => (
                  <div key={entry.id} className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div
                        className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium",
                          entry.speaker === "AI Agent"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground",
                        )}
                      >
                        {entry.speaker === "AI Agent" ? "AI" : entry.speaker.split(" ")[0][0]}
                      </div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">{entry.speaker}</span>
                        <span className="text-xs text-muted-foreground">{entry.timestamp}</span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            entry.sentiment === "positive"
                              ? "border-chart-4 text-chart-4"
                              : entry.sentiment === "negative"
                                ? "border-chart-2 text-chart-2"
                                : "border-muted-foreground text-muted-foreground",
                          )}
                        >
                          {entry.sentiment}
                        </Badge>
                      </div>
                      <p className="text-sm leading-relaxed">{entry.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Real-time AI Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insights.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                    <div className="flex-shrink-0 mt-0.5">
                      {insight.type === "strength" && <CheckCircle className="h-4 w-4 text-chart-4" />}
                      {insight.type === "opportunity" && <TrendingUp className="h-4 w-4 text-chart-3" />}
                      {insight.type === "concern" && <AlertCircle className="h-4 w-4 text-chart-2" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{insight.text}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-muted-foreground">Confidence:</span>
                        <span className="text-xs font-medium">{insight.confidence}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Call Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Call Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-chart-4">{call.aiScore}</div>
                  <div className="text-sm text-muted-foreground">AI Score</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">78%</div>
                  <div className="text-sm text-muted-foreground">Positive Sentiment</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">12</div>
                  <div className="text-sm text-muted-foreground">Key Points</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">3</div>
                  <div className="text-sm text-muted-foreground">Red Flags</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Suggested Questions */}
          {call.isLive && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Suggested Questions</CardTitle>
                <CardDescription>Flag questions for the AI agent to ask</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {suggestedQuestions.map((question, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFlaggedQuestion(question)}
                      className="flex-shrink-0"
                    >
                      <Flag className="h-3 w-3" />
                    </Button>
                    <p className="text-sm leading-relaxed">{question}</p>
                  </div>
                ))}
                <div className="space-y-2 pt-2 border-t">
                  <Input
                    placeholder="Custom question..."
                    value={flaggedQuestion}
                    onChange={(e) => setFlaggedQuestion(e.target.value)}
                  />
                  <Button onClick={handleFlagQuestion} size="sm" className="w-full">
                    <Send className="h-3 w-3 mr-2" />
                    Flag Question
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add your notes about this call..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-32"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
