"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "./auth-provider"

// Types
export type TransactionType = "income" | "expense"
export type CurrencyCode = "USD" | "KZT" | "RUB"

export type Category = {
  id: string
  name: string
  color: string
  icon: string
  type: TransactionType
}

export type Transaction = {
  id: string
  amount: number
  type: TransactionType
  categoryId: string
  date: string
  comment?: string
}

export type Wallet = {
  id: string
  name: string
  currency: CurrencyCode
  transactions: Transaction[]
}

export type View = "login" | "register" | "dashboard" | "stats" | "settings"

type OnlineWalletContextType = {
  view: View
  setView: (view: View) => void
  wallets: Wallet[]
  currentWalletId: string
  setCurrentWalletId: (id: string) => void
  currentWallet: Wallet | undefined
  categories: Category[]
  addTransaction: (transaction: Omit<Transaction, "id">) => void
  updateTransaction: (id: string, transaction: Partial<Omit<Transaction, "id">>) => void
  deleteTransaction: (id: string) => void
  addCategory: (category: Omit<Category, "id">) => void
  deleteCategory: (id: string) => void
  getBalance: (walletId?: string) => number
  getCategory: (id: string) => Category | undefined
  filterTransactionsByDate: (startDate: string, endDate: string, walletId?: string) => Transaction[]
  addWallet: (wallet: Omit<Wallet, "id" | "transactions">) => void
  getCurrencySymbol: (currency: CurrencyCode) => string
}

// Default categories
const defaultCategories: Category[] = [
  { id: "cat_1", name: "Salary", color: "#4CAF50", icon: "wallet", type: "income" },
  { id: "cat_2", name: "Gifts", color: "#9C27B0", icon: "gift", type: "income" },
  { id: "cat_3", name: "Food", color: "#FF9800", icon: "utensils", type: "expense" },
  { id: "cat_4", name: "Transport", color: "#2196F3", icon: "car", type: "expense" },
  { id: "cat_5", name: "Entertainment", color: "#E91E63", icon: "film", type: "expense" },
  { id: "cat_6", name: "Shopping", color: "#795548", icon: "shopping-bag", type: "expense" },
]

// Default wallets
const defaultWallets: Wallet[] = [
  {
    id: "wallet_usd",
    name: "USD Wallet",
    currency: "USD",
    transactions: [
      {
        id: "tx_1",
        amount: 3000,
        type: "income",
        categoryId: "cat_1",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        comment: "Monthly salary",
      },
      {
        id: "tx_2",
        amount: 50,
        type: "expense",
        categoryId: "cat_3",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        comment: "Groceries",
      },
    ],
  },
  {
    id: "wallet_kzt",
    name: "KZT Wallet",
    currency: "KZT",
    transactions: [],
  },
  {
    id: "wallet_rub",
    name: "RUB Wallet",
    currency: "RUB",
    transactions: [],
  },
]

const OnlineWalletContext = createContext<OnlineWalletContextType | undefined>(undefined)

export function OnlineWalletProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [view, setView] = useState<View>(user ? "dashboard" : "login")
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [currentWalletId, setCurrentWalletId] = useState<string>("")
  const [categories, setCategories] = useState<Category[]>([])

  // Get current wallet
  const currentWallet = wallets.find((wallet) => wallet.id === currentWalletId)

  // Initialize or load data from localStorage
  useEffect(() => {
    if (user) {
      // Load user data from localStorage or use sample data
      const storedWallets = localStorage.getItem(`wallet_wallets_${user.id}`)
      const storedCurrentWalletId = localStorage.getItem(`wallet_current_wallet_${user.id}`)
      const storedCategories = localStorage.getItem(`wallet_categories_${user.id}`)

      if (storedWallets) {
        const parsedWallets = JSON.parse(storedWallets)
        setWallets(parsedWallets)

        // Set current wallet ID to the first wallet if it exists
        if (parsedWallets.length > 0) {
          if (storedCurrentWalletId) {
            setCurrentWalletId(storedCurrentWalletId)
          } else {
            setCurrentWalletId(parsedWallets[0].id)
          }
        }
      } else {
        setWallets(defaultWallets)
        setCurrentWalletId(defaultWallets[0].id)
      }

      if (storedCategories) {
        setCategories(JSON.parse(storedCategories))
      } else {
        setCategories(defaultCategories)
      }
    } else {
      // Reset state when user logs out
      setWallets([])
      setCurrentWalletId("")
      setCategories([])
      setView("login")
    }
  }, [user])

  // Save data to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(`wallet_wallets_${user.id}`, JSON.stringify(wallets))
      localStorage.setItem(`wallet_current_wallet_${user.id}`, currentWalletId)
      localStorage.setItem(`wallet_categories_${user.id}`, JSON.stringify(categories))
    }
  }, [user, wallets, currentWalletId, categories])

  // Transaction functions
  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    if (!currentWallet) return

    const newTransaction = {
      ...transaction,
      id: `tx_${Math.random().toString(36).substring(2, 9)}`,
    }

    setWallets(
      wallets.map((wallet) => {
        if (wallet.id === currentWalletId) {
          return {
            ...wallet,
            transactions: [newTransaction, ...wallet.transactions],
          }
        }
        return wallet
      }),
    )
  }

  const updateTransaction = (id: string, updates: Partial<Omit<Transaction, "id">>) => {
    if (!currentWallet) return

    setWallets(
      wallets.map((wallet) => {
        if (wallet.id === currentWalletId) {
          return {
            ...wallet,
            transactions: wallet.transactions.map((tx) => (tx.id === id ? { ...tx, ...updates } : tx)),
          }
        }
        return wallet
      }),
    )
  }

  const deleteTransaction = (id: string) => {
    if (!currentWallet) return

    setWallets(
      wallets.map((wallet) => {
        if (wallet.id === currentWalletId) {
          return {
            ...wallet,
            transactions: wallet.transactions.filter((tx) => tx.id !== id),
          }
        }
        return wallet
      }),
    )
  }

  // Category functions
  const addCategory = (category: Omit<Category, "id">) => {
    const newCategory = {
      ...category,
      id: `cat_${Math.random().toString(36).substring(2, 9)}`,
    }
    setCategories([...categories, newCategory])
  }

  const deleteCategory = (id: string) => {
    // Check if category is used in any transaction across all wallets
    const isUsed = wallets.some((wallet) => wallet.transactions.some((tx) => tx.categoryId === id))

    if (isUsed) {
      alert("Cannot delete category that is used in transactions")
      return
    }
    setCategories(categories.filter((cat) => cat.id !== id))
  }

  // Wallet functions
  const addWallet = (wallet: Omit<Wallet, "id" | "transactions">) => {
    const newWallet = {
      ...wallet,
      id: `wallet_${Math.random().toString(36).substring(2, 9)}`,
      transactions: [],
    }
    setWallets([...wallets, newWallet])

    // Set as current wallet if it's the first one
    if (wallets.length === 0) {
      setCurrentWalletId(newWallet.id)
    }
  }

  // Utility functions
  const getBalance = (walletId?: string) => {
    const targetWalletId = walletId || currentWalletId
    const wallet = wallets.find((w) => w.id === targetWalletId)

    if (!wallet) return 0

    return wallet.transactions.reduce((total, tx) => {
      return tx.type === "income" ? total + tx.amount : total - tx.amount
    }, 0)
  }

  const getCategory = (id: string) => {
    return categories.find((cat) => cat.id === id)
  }

  const filterTransactionsByDate = (startDate: string, endDate: string, walletId?: string) => {
    const targetWalletId = walletId || currentWalletId
    const wallet = wallets.find((w) => w.id === targetWalletId)

    if (!wallet) return []

    return wallet.transactions.filter((tx) => {
      const txDate = new Date(tx.date)
      return txDate >= new Date(startDate) && txDate <= new Date(endDate)
    })
  }

  const getCurrencySymbol = (currency: CurrencyCode) => {
    switch (currency) {
      case "USD":
        return "$"
      case "KZT":
        return "₸"
      case "RUB":
        return "₽"
      default:
        return "$"
    }
  }

  return (
    <OnlineWalletContext.Provider
      value={{
        view,
        setView,
        wallets,
        currentWalletId,
        setCurrentWalletId,
        currentWallet,
        categories,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addCategory,
        deleteCategory,
        getBalance,
        getCategory,
        filterTransactionsByDate,
        addWallet,
        getCurrencySymbol,
      }}
    >
      {children}
    </OnlineWalletContext.Provider>
  )
}

export function useOnlineWallet() {
  const context = useContext(OnlineWalletContext)
  if (context === undefined) {
    throw new Error("useOnlineWallet must be used within an OnlineWalletProvider")
  }
  return context
}
