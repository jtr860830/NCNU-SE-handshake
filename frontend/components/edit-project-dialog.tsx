"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { projectAPI } from "@/lib/api"

interface EditProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: {
    id: number
    title: string
    description: string
  }
  onUpdate: (updatedProject: any) => void
}

export function EditProjectDialog({ open, onOpenChange, project, onUpdate }: EditProjectDialogProps) {
  const [title, setTitle] = useState(project.title)
  const [description, setDescription] = useState(project.description)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("請填寫專案標題")
      return
    }

    if (!description.trim()) {
      setError("請填寫專案描述")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const updated = await projectAPI.update(project.id, {
        title,
        description,
      })
      onUpdate(updated)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新失敗")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>編輯專案</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">專案標題</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="輸入專案標題"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">專案描述</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="輸入專案描述"
              rows={4}
            />
          </div>
          {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              取消
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? "保存中..." : "保存"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
