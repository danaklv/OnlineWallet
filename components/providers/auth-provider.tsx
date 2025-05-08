"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

type User = {
  id: string
  email: string
  name?: string
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing auth on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("wallet_user")
    const storedToken = localStorage.getItem("wallet_token")

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
    }

    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // In a real app, this would be an API call
      // For demo purposes, we'll check if the user exists in localStorage
      const users = JSON.parse(localStorage.getItem("wallet_users") || "[]")
      const user = users.find((u: any) => u.email === email)

      if (!user || user.password !== password) {
        throw new Error("Invalid email or password")
      }

      const userData = {
        id: user.id,
        email: user.email,
        name: user.name,
      }

      // Store auth data
      localStorage.setItem("wallet_user", JSON.stringify(userData))
      localStorage.setItem("wallet_token", `mock_token_${Date.now()}`)

      setUser(userData)
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, name?: string) => {
    setIsLoading(true)
    try {
      // In a real app, this would be an API call
      // For demo purposes, we'll store the user in localStorage
      const users = JSON.parse(localStorage.getItem("wallet_users") || "[]")

      // Check if user already exists
      if (users.some((u: any) => u.email === email)) {
        throw new Error("User with this email already exists")
      }

      const newUser = {
        id: `user_${Math.random().toString(36).substring(2, 9)}`,
        email,
        password,
        name,
      }

      // Add user to users array
      users.push(newUser)
      localStorage.setItem("wallet_users", JSON.stringify(users))

      // Create user data without password for auth
      const userData = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      }

      // Store auth data
      localStorage.setItem("wallet_user", JSON.stringify(userData))
      localStorage.setItem("wallet_token", `mock_token_${Date.now()}`)

      setUser(userData)
    } catch (error) {
      console.error("Registration failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("wallet_user")
    localStorage.removeItem("wallet_token")
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
