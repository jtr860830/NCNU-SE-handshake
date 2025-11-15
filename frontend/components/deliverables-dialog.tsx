"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { deliverableAPI, projectAPI, API_BASE_URL } from "@/lib/api"
import { FileText, Download } from 'lucide-react'

interface Deliverable {
  id: number
  file_url: string
  note?: string
  created_at: string
}

interface DeliverablesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: number
}

export function DeliverablesDialog({ open, onOpenChange, projectId }: DeliverablesDialogProps) {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isCompleting, setIsCompleting] = useState(false)

  useEffect(() => {
    if (open) {
      loadDeliverables()
    }
  }, [open, projectId])

  const loadDeliverables = async () => {
    setIsLoading(true)
    setError("")
    try {
      const response = await deliverableAPI.listProjectDeliverables(projectId)
      setDeliverables(Array.isArray(response) ? response : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "載入失敗")
      setDeliverables([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteProject = async () => {
    setIsCompleting(true)
    setError("")
    try {
      await projectAPI.complete(projectId)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "完成失敗")
    } finally {
      setIsCompleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>檢視交付檔案</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-6 text-muted-foreground">載入中...</div>
          ) : deliverables.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">暫無交付檔案</div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {deliverables.map((deliverable) => (
                <Card key={deliverable.id} className="p-3">
                  <div className="flex items-start gap-2 mb-2">
                    <FileText className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <a
                        href={API_BASE_URL + "/deliverables/" + deliverable.id + "/download"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-primary hover:underline break-all"
                      >
                        {deliverable.file_url.split("/").pop()}
                      </a>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(deliverable.created_at).toLocaleDateString("zh-TW")}
                      </p>
                    </div>
                    <a
                      href={API_BASE_URL + "/deliverables/" + deliverable.id + "/download"}
                      download
                      className="flex-shrink-0 text-muted-foreground hover:text-primary"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                  {deliverable.note && (
                    <p className="text-xs text-muted-foreground bg-muted p-2 rounded mt-2">
                      {deliverable.note}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          )}

          {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

          {deliverables.length > 0 && (
            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isCompleting}
              >
                關閉
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleCompleteProject}
                disabled={isCompleting}
              >
                {isCompleting ? "完成中..." : "完成專案"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
