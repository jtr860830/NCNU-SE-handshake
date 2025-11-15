"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface ProposalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (proposal: { amount: number; days: number }) => void
}

export function ProposalDialog({ open, onOpenChange, onSubmit }: ProposalDialogProps) {
  const [amount, setAmount] = useState("")
  const [days, setDays] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = () => {
    if (!amount || !days) {
      setError("請填入所有欄位")
      return
    }

    setError("")
    onSubmit({
      amount: Number.parseFloat(amount),
      days: Number.parseInt(days),
    })
    setAmount("")
    setDays("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>提出報價</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}

          <div>
            <Label htmlFor="amount">報價金額 (元)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="輸入您的報價"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="days">預計完成天數</Label>
            <Input
              id="days"
              type="number"
              placeholder="預計完成天數"
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={handleSubmit}
              disabled={!amount || !days}
            >
              提交報價
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
