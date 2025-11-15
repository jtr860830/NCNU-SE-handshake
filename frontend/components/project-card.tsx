"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { quoteAPI } from "@/lib/api"
import { Edit2Icon } from 'lucide-react'
import { EditProjectDialog } from "./edit-project-dialog"
import { UploadDeliverableDialog } from "./upload-deliverable-dialog"
import { DeliverablesDialog } from "./deliverables-dialog"

interface Project {
  id: number
  title: string
  description: string
  status: string
  proposals?: number
  selectedContractor?: string
  clientName?: string
  myProposal?: {
    amount: number
    message: string
  }
  worker_id?: number | null
  create_at: string
}

interface Quote {
  id: number
  amount: number
  days: number
  worker_id: number
}

interface ProjectCardProps {
  project: Project
  userRole: "client" | "contractor"
  onUpdate: (updates: any) => void
  showProposal?: boolean
}

export function ProjectCard({ project, userRole, onUpdate, showProposal }: ProjectCardProps) {
  const [projectData, setProjectData] = useState(project)
  const [projectStatus, setProjectStatus] = useState(project.status)
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false)
  const [showQuotesDialog, setShowQuotesDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showDeliverablesDialog, setShowDeliverablesDialog] = useState(false)

  const loadQuotes = async () => {
    if (userRole !== "client") return

    setIsLoadingQuotes(true)
    try {
      const response = await quoteAPI.listProjectQuotes(project.id)
      setQuotes(Array.isArray(response) ? response : [])
      setShowQuotesDialog(true)
    } catch (err) {
      console.error("[v0] Error loading quotes:", err)
    } finally {
      setIsLoadingQuotes(false)
    }
  }

  const handleQuoteAction = async (quote: Quote, action: "accept") => {
    try {
      if (action === "accept") {
        await quoteAPI.acceptQuote(project.id, quote.worker_id)
        setProjectStatus("in_progress")
        setShowQuotesDialog(false)
        onUpdate({ status: "in_progress", worker_id: quote.worker_id })
      }
    } catch (err) {
      console.error("[v0] Error processing quote:", err)
    }
  }

  const handleProjectUpdate = (updatedProject: any) => {
    setProjectData(updatedProject)
    onUpdate(updatedProject)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open":
        return "待處理"
      case "in_progress":
        return "進行中"
      case "completed":
        return "已完成"
      case "rejected":
        return "已退件"
      default:
        return status
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg break-words">{projectData.title}</CardTitle>
            {projectData.clientName && <CardDescription>委託人: {projectData.clientName}</CardDescription>}
          </div>
          <Badge className={`shrink-0 ${getStatusColor(projectStatus)}`}>{getStatusLabel(projectStatus)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{projectData.description}</p>

        <div className="flex items-center justify-between">
          {userRole === "client" && projectData.proposals && (
            <span className="text-sm text-muted-foreground">{projectData.proposals} 個報價</span>
          )}
        </div>

        {userRole === "client" && (
          <div className="space-y-2 pt-2 border-t border-border">
            {projectStatus === "open" && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                  onClick={loadQuotes}
                  disabled={isLoadingQuotes}
                >
                  {isLoadingQuotes ? "載入報價中..." : "查看報價"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent"
                  onClick={() => setShowEditDialog(true)}
                >
                  <Edit2Icon className="h-4 w-4" />
                </Button>
              </div>
            )}
            {projectStatus === "in_progress" && (
              <div className="space-y-2 pt-2">
                <div className="text-sm text-muted-foreground py-2">已分配給接案人</div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => setShowDeliverablesDialog(true)}
                >
                  查看交付檔案
                </Button>
              </div>
            )}
            {projectStatus === "completed" && (
              <div className="text-sm text-muted-foreground py-2 text-center">已完成</div>
            )}
          </div>
        )}

        {userRole === "contractor" && showProposal && (
          <div className="space-y-2 pt-2 border-t border-border">
            {projectData.myProposal && (
              <>
                <div className="bg-muted p-3 rounded text-sm">
                  <p className="font-semibold mb-1">我的報價: NT${projectData.myProposal.amount.toLocaleString()}</p>
                  <p className="text-muted-foreground">{projectData.myProposal.message}</p>
                </div>
                {projectStatus === "in_progress" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent"
                    onClick={() => setShowUploadDialog(true)}
                  >
                    上傳交付檔案
                  </Button>
                )}
              </>
            )}
          </div>
        )}

        <EditProjectDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          project={projectData}
          onUpdate={handleProjectUpdate}
        />

        <UploadDeliverableDialog
          open={showUploadDialog}
          onOpenChange={setShowUploadDialog}
          projectId={project.id}
          onSuccess={() => {
            setProjectStatus("in_progress")
          }}
        />

        <DeliverablesDialog
          open={showDeliverablesDialog}
          onOpenChange={setShowDeliverablesDialog}
          projectId={project.id}
        />

        {userRole === "client" && (
          <Dialog open={showQuotesDialog} onOpenChange={setShowQuotesDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>專案報價 - 選擇接案人</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {quotes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">暫無報價</p>
                ) : (
                  quotes.map((quote) => (
                    <div key={quote.id} className="bg-muted p-3 rounded border border-border">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-sm">
                            NT${quote.amount.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">{quote.days} 天完成</p>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={() => handleQuoteAction(quote, "accept")}
                        >
                          接受
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  )
}
