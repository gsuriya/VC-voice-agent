"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, Search, Filter, TrendingUp, Calendar, DollarSign, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface Company {
  id: string
  name: string
  sector: string
  stage: string
  funding: string
  status: "Initial Contact" | "Qualified" | "Due Diligence" | "Hot Lead" | "Passed"
  lastContact: string
  aiScore: number
  foundedYear: number
  teamSize: number
  revenue: string
  description: string
}

const mockCompanies: Company[] = [
  {
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
  },
  {
    id: "2",
    name: "GreenEnergy Solutions",
    sector: "CleanTech",
    stage: "Seed",
    funding: "$2M",
    status: "Qualified",
    lastContact: "1 day ago",
    aiScore: 78,
    foundedYear: 2020,
    teamSize: 15,
    revenue: "$500K ARR",
    description: "Solar panel efficiency optimization using IoT sensors",
  },
  {
    id: "3",
    name: "FinanceOS",
    sector: "FinTech",
    stage: "Pre-Seed",
    funding: "$500K",
    status: "Initial Contact",
    lastContact: "3 days ago",
    aiScore: 65,
    foundedYear: 2023,
    teamSize: 8,
    revenue: "Pre-revenue",
    description: "Operating system for financial institutions",
  },
  {
    id: "4",
    name: "HealthTech Innovations",
    sector: "HealthTech",
    stage: "Series B",
    funding: "$15M",
    status: "Due Diligence",
    lastContact: "5 hours ago",
    aiScore: 88,
    foundedYear: 2019,
    teamSize: 45,
    revenue: "$8M ARR",
    description: "AI-driven diagnostic tools for early disease detection",
  },
  {
    id: "5",
    name: "EduPlatform",
    sector: "EdTech",
    stage: "Seed",
    funding: "$3M",
    status: "Qualified",
    lastContact: "2 days ago",
    aiScore: 71,
    foundedYear: 2022,
    teamSize: 18,
    revenue: "$1.2M ARR",
    description: "Personalized learning platform for K-12 education",
  },
  {
    id: "6",
    name: "CyberShield Pro",
    sector: "CyberSecurity",
    stage: "Series A",
    funding: "$8M",
    status: "Hot Lead",
    lastContact: "4 hours ago",
    aiScore: 85,
    foundedYear: 2020,
    teamSize: 32,
    revenue: "$4M ARR",
    description: "Next-gen threat detection for enterprise networks",
  },
]

const statusColors = {
  "Initial Contact": "bg-muted text-muted-foreground",
  Qualified: "bg-chart-3/20 text-chart-3",
  "Due Diligence": "bg-chart-2/20 text-chart-2",
  "Hot Lead": "bg-chart-1 text-white",
  Passed: "bg-destructive/20 text-destructive",
}

export function PipelineView() {
  const [companies, setCompanies] = useState<Company[]>(mockCompanies)
  const [searchTerm, setSearchTerm] = useState("")
  const [sectorFilter, setSectorFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [stageFilter, setStageFilter] = useState("all")

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.sector.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSector = sectorFilter === "all" || company.sector === sectorFilter
    const matchesStatus = statusFilter === "all" || company.status === statusFilter
    const matchesStage = stageFilter === "all" || company.stage === stageFilter

    return matchesSearch && matchesSector && matchesStatus && matchesStage
  })

  const sectors = [...new Set(companies.map((c) => c.sector))]
  const statuses = [...new Set(companies.map((c) => c.status))]
  const stages = [...new Set(companies.map((c) => c.stage))]

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Pipeline Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={sectorFilter} onValueChange={setSectorFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Sectors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sectors</SelectItem>
                {sectors.map((sector) => (
                  <SelectItem key={sector} value={sector}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {stages.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {stage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCompanies.map((company) => (
          <Link key={company.id} href={`/companies/${company.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{company.name}</CardTitle>
                      <CardDescription>{company.sector}</CardDescription>
                    </div>
                  </div>
                  <Badge className={cn("text-xs", statusColors[company.status])}>{company.status}</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">{company.description}</p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{company.funding}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{company.teamSize} employees</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Founded {company.foundedYear}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span>{company.revenue}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center space-x-2">
                    <div className="text-xs text-muted-foreground">AI Score:</div>
                    <div
                      className={cn(
                        "text-sm font-medium",
                        company.aiScore >= 80
                          ? "text-chart-4"
                          : company.aiScore >= 60
                            ? "text-chart-2"
                            : "text-muted-foreground",
                      )}
                    >
                      {company.aiScore}/100
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">{company.lastContact}</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No companies found</h3>
            <p className="text-muted-foreground text-center">
              Try adjusting your filters or search terms to find companies in your pipeline.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
