"use client"

import { useEffect } from "react"
import { OnlineWalletProvider } from "@/components/providers/online-wallet-provider"
import { AuthProvider } from "@/components/providers/auth-provider"
import { AppContent } from "@/components/app-content"
import { ThemeProvider } from "@/components/theme-provider"

export default function Home() {
  // Prevent hydration issues by ensuring we're on the client
  useEffect(() => {
    document.body.style.display = "block"
  }, [])

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      <AuthProvider>
        <OnlineWalletProvider>
          <AppContent />
        </OnlineWalletProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
