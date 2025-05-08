"use client"

import { useAuth } from "./providers/auth-provider"
import { useOnlineWallet } from "./providers/online-wallet-provider"
import { LoginView } from "./views/login-view"
import { RegisterView } from "./views/register-view"
import { DashboardView } from "./views/dashboard-view"
import { StatsView } from "./views/stats-view"
import { SettingsView } from "./views/settings-view"
import { LoadingSpinner } from "./ui/loading-spinner"

export function AppContent() {
  const { isLoading } = useAuth()
  const { view } = useOnlineWallet()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {view === "login" && <LoginView />}
      {view === "register" && <RegisterView />}
      {view === "dashboard" && <DashboardView />}
      {view === "stats" && <StatsView />}
      {view === "settings" && <SettingsView />}
    </div>
  )
}
