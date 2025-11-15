"use client"
import { ClientDashboard } from "./client-dashboard"
import { ContractorDashboard } from "./contractor-dashboard"
import { Header } from "./header"

interface DashboardPageProps {
  userName: string
  userRole: "contractor" | "client"
  onLogout: () => void
}

export function DashboardPage({ userName, userRole, onLogout }: DashboardPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header userName={userName} userRole={userRole} onLogout={onLogout} />

      <main className="container mx-auto px-4 py-8">
        {userRole === "client" ? <ClientDashboard userName={userName} /> : <ContractorDashboard userName={userName} />}
      </main>
    </div>
  )
}
