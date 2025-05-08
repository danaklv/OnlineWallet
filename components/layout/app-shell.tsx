"use client"

import type { ReactNode } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { useOnlineWallet } from "@/components/providers/online-wallet-provider"
import { Button } from "@/components/ui/button"
import { BarChart3, Home, LogOut, Settings } from "lucide-react"

type NavItemProps = {
  icon: ReactNode
  label: string
  active: boolean
  onClick: () => void
}

function NavItem({ icon, label, active, onClick }: NavItemProps) {
  return (
    <Button variant={active ? "default" : "ghost"} className="w-full justify-start" onClick={onClick}>
      {icon}
      <span className="ml-2">{label}</span>
    </Button>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const { logout } = useAuth()
  const { view, setView } = useOnlineWallet()

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Sidebar */}
      <div className="border-r bg-card p-4 md:w-64">
        <div className="mb-8 text-xl font-bold">Online Wallet</div>
        <nav className="space-y-2">
          <NavItem
            icon={<Home size={18} />}
            label="Dashboard"
            active={view === "dashboard"}
            onClick={() => setView("dashboard")}
          />
          <NavItem
            icon={<BarChart3 size={18} />}
            label="Statistics"
            active={view === "stats"}
            onClick={() => setView("stats")}
          />
          <NavItem
            icon={<Settings size={18} />}
            label="Settings"
            active={view === "settings"}
            onClick={() => setView("settings")}
          />
        </nav>
        <div className="absolute bottom-4 left-4 right-4 md:fixed md:bottom-4 md:left-4 md:w-56">
          <Button variant="outline" className="w-full justify-start" onClick={logout}>
            <LogOut size={18} />
            <span className="ml-2">Logout</span>
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-4 md:p-6">{children}</div>
    </div>
  )
}
