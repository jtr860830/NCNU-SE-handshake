"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { ProjectCard } from "./project-card"
import { ProposalDialog } from "./proposal-dialog"
import { UploadDeliverableDialog } from "./upload-deliverable-dialog"
import { projectAPI, quoteAPI } from "@/lib/api"

interface Project {
  id: number
  title: string
  description: string
  status: "open" | "in_progress" | "completed"
  client_id: number
  worker_id?: number | null
  create_at: string
}

interface ContractorDashboardProps {
  userName: string
}

export function ContractorDashboard({ userName }: ContractorDashboardProps) {
  const [availableProjects, setAvailableProjects] = useState<Project[]>([])
  const [myProjects, setMyProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showProposalDialog, setShowProposalDialog] = useState<number | null>(null)
  const [uploadProjectId, setUploadProjectId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const [openResponse, myResponse] = await Promise.all([
          projectAPI.listOpen(),
          projectAPI.listWorkerProjects(),
        ])

        console.log("[v0] Open projects:", openResponse)
        console.log("[v0] My projects:", myResponse)

        const unassignedProjects = Array.isArray(openResponse)
          ? openResponse.filter((p: Project) => !p.worker_id)
          : []
        
        setAvailableProjects(unassignedProjects)
        setMyProjects(Array.isArray(myResponse) ? myResponse : [])
      } catch (err) {
        console.error("[v0] Error loading projects:", err)
        setError("載入專案失敗")
      } finally {
        setIsLoading(false)
      }
    }

    loadProjects()
  }, [])

  const handleSubmitProposal = async (projectId: number, proposal: { amount: number; days: number }) => {
    try {
      const response = await quoteAPI.create(projectId, proposal.amount, proposal.days)
      console.log("[v0] Quote created:", response)

      const project = availableProjects.find((p) => p.id === projectId)
      if (project) {
        setMyProjects([...myProjects, { ...project, status: "in_progress" }])
        setAvailableProjects(availableProjects.filter((p) => p.id !== projectId))
      }

      setShowProposalDialog(null)
    } catch (err) {
      console.error("[v0] Error submitting proposal:", err)
      setError(err instanceof Error ? err.message : "提交報價失敗")
    }
  }

  const filteredProjects = availableProjects.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return <div className="text-center py-12">載入中...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-primary mb-1">接案人儀表板</h2>
        <p className="text-muted-foreground">發現並提交報價</p>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="available">可用專案 ({filteredProjects.length})</TabsTrigger>
          <TabsTrigger value="my-projects">我的專案 ({myProjects.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4 mt-6">
          <div className="mb-4">
            <Input
              placeholder="搜尋專案標題或描述..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {filteredProjects.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground">
                {searchTerm ? "沒有符合條件的專案" : "目前沒有可用的專案"}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <div key={project.id}>
                  <ProjectCard project={project as any} userRole="contractor" onUpdate={() => {}} />
                  <Button
                    className="w-full mt-3 bg-accent hover:bg-accent/90 text-accent-foreground"
                    onClick={() => setShowProposalDialog(project.id)}
                  >
                    提出報價
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-projects" className="space-y-4 mt-6">
          {myProjects.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground">
                您還沒有承包的專案。提交報價以開始接案！
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myProjects.map((project) => (
                <div key={project.id} className="space-y-3">
                  <ProjectCard
                    project={project as any}
                    userRole="contractor"
                    onUpdate={() => {}}
                  />
                  {project.status === "in_progress" && (
                    <Button
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                      onClick={() => setUploadProjectId(project.id)}
                    >
                      上傳交付檔案
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ProposalDialog
        open={showProposalDialog !== null}
        onOpenChange={(open) => !open && setShowProposalDialog(null)}
        onSubmit={(proposal) => {
          if (showProposalDialog) {
            handleSubmitProposal(showProposalDialog, proposal)
          }
        }}
      />

      <UploadDeliverableDialog
        open={uploadProjectId !== null}
        onOpenChange={(open) => !open && setUploadProjectId(null)}
        projectId={uploadProjectId || 0}
        onSuccess={() => {
          setUploadProjectId(null)
        }}
      />
    </div>
  )
}
