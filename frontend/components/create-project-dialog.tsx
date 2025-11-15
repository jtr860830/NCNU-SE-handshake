"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { projectAPI } from "@/lib/api"

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateProject: (project: {
    title: string
    description: string
    id: number
    status: string
  }) => void
}

export function CreateProjectDialog({ open, onOpenChange, onCreateProject }: CreateProjectDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (!title || !description) {
      setError("請填入所有欄位")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await projectAPI.create(title, description)
      console.log("[v0] Project created:", response)

      onCreateProject({
        title,
        description,
        id: response.id,
        status: response.status || "open",
      })

      setTitle("")
      setDescription("")
      onOpenChange(false)
    } catch (err) {
      console.error("[v0] Project creation error:", err)
      setError(err instanceof Error ? err.message : "建立專案失敗")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>建立新專案</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}

          <div>
            <Label htmlFor="title">專案標題</Label>
            <Input
              id="title"
              placeholder="請輸入專案標題"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="description">專案描述</Label>
            <Textarea
              id="description"
              placeholder="詳細描述您的需求..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              取消
            </Button>
            <Button
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={handleSubmit}
              disabled={!title || !description || isLoading}
            >
              {isLoading ? "建立中..." : "建立專案"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
