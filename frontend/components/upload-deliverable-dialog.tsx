"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { deliverableAPI } from "@/lib/api"
import { Upload } from 'lucide-react'

interface UploadDeliverableDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: number
  onSuccess: () => void
}

export function UploadDeliverableDialog({ open, onOpenChange, projectId, onSuccess }: UploadDeliverableDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [note, setNote] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0])
      setError("")
    }
  }

  const handleSubmit = async () => {
    if (!file) {
      setError("請選擇檔案")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      await deliverableAPI.uploadFile(projectId, file, note || undefined)
      setFile(null)
      setNote("")
      onOpenChange(false)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "上傳失敗")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>上傳交付檔案</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileChange}
              disabled={isLoading}
            />
            <label htmlFor="file-upload" className={`cursor-pointer block ${isLoading ? "opacity-50" : ""}`}>
              <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">拖放檔案或點擊上傳</p>
              {file && (
                <p className="mt-2 text-sm text-primary font-semibold">已選擇: {file.name}</p>
              )}
            </label>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">備註（選填）</label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="輸入檔案說明或備註"
              rows={3}
              disabled={isLoading}
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
              disabled={isLoading || !file}
            >
              {isLoading ? "上傳中..." : "確認上傳"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
