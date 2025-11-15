"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authAPI } from "@/lib/api"

interface AuthPageProps {
  onLogin: (role: "contractor" | "client", name: string, token: string) => void
}

export function AuthPage({ onLogin }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (role: "contractor" | "client") => {
    setError("")

    if (!username.trim()) {
      setError("使用者名稱不能為空")
      return
    }

    if (!password) {
      setError("密碼不能為空")
      return
    }

    if (isSignUp && password !== confirmPassword) {
      setError("兩次輸入的密碼不一致")
      return
    }

    setIsLoading(true)

    try {
      if (isSignUp) {
        const response = await authAPI.register(username, password, role === "client" ? "client" : "worker")
        console.log("[v0] Registration successful:", response)

        // After registration, login
        const loginResponse = await authAPI.loginJson(username, password)
        const token = loginResponse.access_token || loginResponse.token || "demo-token"
        onLogin(role, username, token)
      } else {
        const response = await authAPI.loginJson(username, password)
        const token = response.access_token || response.token || "demo-token"
        onLogin(role, username, token)
      }

      setUsername("")
      setPassword("")
      setConfirmPassword("")
      setError("")
    } catch (err) {
      console.error("[v0] Auth error:", err)
      setError(err instanceof Error ? err.message : "認證失敗，請檢查使用者名稱和密碼")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">Work Connect</h1>
          <p className="text-muted-foreground">連接委託人和接案人的專業平台</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isSignUp ? "建立帳號" : "登入帳號"}</CardTitle>
            <CardDescription>{isSignUp ? "選擇您的角色並建立帳號" : "選擇您的角色並登入"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}

            <div>
              <label className="block text-sm font-medium mb-2">使用者名稱</label>
              <Input
                type="text"
                placeholder="輸入使用者名稱"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">密碼</label>
              <Input
                type="password"
                placeholder="輸入密碼"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium mb-2">確認密碼</label>
                <Input
                  type="password"
                  placeholder="再次輸入密碼"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            )}

            <div className="space-y-3 pt-4">
              <Button
                className="w-full bg-primary hover:bg-primary/90"
                onClick={() => handleSubmit("client")}
                disabled={isLoading}
              >
                {isLoading ? "處理中..." : isSignUp ? "註冊為委託人" : "委託人登入"}
              </Button>
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => handleSubmit("contractor")}
                disabled={isLoading}
              >
                {isLoading ? "處理中..." : isSignUp ? "註冊為接案人" : "接案人登入"}
              </Button>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError("")
                  setUsername("")
                  setPassword("")
                  setConfirmPassword("")
                }}
                className="text-sm text-primary hover:underline"
                disabled={isLoading}
              >
                {isSignUp ? "已有帳號？登入" : "沒有帳號？立即註冊"}
              </button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-muted-foreground">
          現在連接到實際的 API 伺服器
        </div>
      </div>
    </div>
  )
}
