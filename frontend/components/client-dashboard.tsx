"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProjectCard } from "./project-card"
import { CreateProjectDialog } from "./create-project-dialog"
import { projectAPI } from "@/lib/api"

interface Project {
  id: number
  title: string
  description: string
  status: "open" | "in_progress" | "completed" | "rejected"
  proposals?: number
  create_at: string
  worker_id?: number | null
}

interface ClientDashboardProps {
  userName: string
}

export function ClientDashboard({ userName }: ClientDashboardProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await projectAPI.listClientProjects()
        console.log("[v0] Loaded projects:", response)
        setProjects(Array.isArray(response) ? response : [])
      } catch (err) {
        console.error("[v0] Error loading projects:", err)
        setError("載入專案失敗")
      } finally {
        setIsLoading(false)
      }
    }

    loadProjects()
  }, [])

  const handleCreateProject = async (newProject: { title: string; description: string; id: number; status: string }) => {
    setProjects([newProject as Project, ...projects])
    setShowCreateDialog(false)
  }

  const pendingProjects = projects.filter((p) => p.status === "open")
  const assignedProjects = projects.filter((p) => p.status === "in_progress")
  const completedProjects = projects.filter((p) => p.status === "completed")

  if (isLoading) {
    return <div className="text-center py-12">載入中...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-primary mb-1">委託人儀表板</h2>
          <p className="text-muted-foreground">管理您的專案和接案人</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90" onClick={() => setShowCreateDialog(true)}>
          + 建立新專案
        </Button>
      </div>

      <CreateProjectDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateProject={handleCreateProject}
      />

      {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">待處理 ({pendingProjects.length})</TabsTrigger>
          <TabsTrigger value="assigned">進行中 ({assignedProjects.length})</TabsTrigger>
          <TabsTrigger value="completed">已完成 ({completedProjects.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {pendingProjects.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground">沒有待處理的專案</CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingProjects.map((project) => (
                <ProjectCard key={project.id} project={project as any} userRole="client" onUpdate={() => {}} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="assigned" className="space-y-4 mt-6">
          {assignedProjects.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground">沒有進行中的專案</CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {assignedProjects.map((project) => (
                <ProjectCard key={project.id} project={project as any} userRole="client" onUpdate={() => {}} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4 mt-6">
          {completedProjects.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground">沒有已完成的專案</CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {completedProjects.map((project) => (
                <ProjectCard key={project.id} project={project as any} userRole="client" onUpdate={() => {}} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
