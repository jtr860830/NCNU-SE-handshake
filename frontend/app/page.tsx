"use client"

import { useState, useEffect } from "react"
import { AuthPage } from "@/components/auth-page"
import { DashboardPage } from "@/components/dashboard-page"
import { setAuthToken, clearAuthToken, getAuthToken } from "@/lib/api"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<"contractor" | "client" | null>(null)
  const [userName, setUserName] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing auth token on mount
  useEffect(() => {
    const token = getAuthToken()
    if (token) {
      const storedRole = localStorage.getItem("userRole")
      const storedName = localStorage.getItem("userName")
      if (storedRole && storedName) {
        setUserRole(storedRole as "contractor" | "client")
        setUserName(storedName)
        setIsAuthenticated(true)
      }
    }
    setIsLoading(false)
  }, [])

  const handleLogin = (role: "contractor" | "client", name: string, token: string) => {
    setAuthToken(token)
    localStorage.setItem("userRole", role)
    localStorage.setItem("userName", name)
    setUserRole(role)
    setUserName(name)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    clearAuthToken()
    localStorage.removeItem("userRole")
    localStorage.removeItem("userName")
    setIsAuthenticated(false)
    setUserRole(null)
    setUserName("")
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">載入中...</div>
  }

  if (!isAuthenticated) {
    return <AuthPage onLogin={handleLogin} />
  }

  return <DashboardPage userName={userName} userRole={userRole!} onLogout={handleLogout} />
}
