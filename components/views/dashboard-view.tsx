"use client"

import { useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { useOnlineWallet, type Transaction, type TransactionType } from "@/components/providers/online-wallet-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ArrowDownCircle, ArrowUpCircle, Plus, Wallet } from "lucide-react"
import { formatDate } from "@/lib/utils"

export function DashboardView() {
  const {
    wallets,
    currentWallet,
    currentWalletId,
    setCurrentWalletId,
    categories,
    addTransaction,
    deleteTransaction,
    getBalance,
    getCategory,
    getCurrencySymbol,
    addWallet,
  } = useOnlineWallet()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isAddWalletDialogOpen, setIsAddWalletDialogOpen] = useState(false)
  const [newTransaction, setNewTransaction] = useState<{
    type: TransactionType
    amount: string
    categoryId: string
    date: string
    comment: string
  }>({
    type: "expense",
    amount: "",
    categoryId: "",
    date: new Date().toISOString().split("T")[0],
    comment: "",
  })
  const [newWallet, setNewWallet] = useState<{
    name: string
    currency: "USD" | "KZT" | "RUB"
  }>({
    name: "",
    currency: "USD",
  })

  const handleAddTransaction = () => {
    if (!newTransaction.amount || !newTransaction.categoryId) {
      return
    }

    addTransaction({
      type: newTransaction.type,
      amount: Number.parseFloat(newTransaction.amount),
      categoryId: newTransaction.categoryId,
      date: new Date(newTransaction.date).toISOString(),
      comment: newTransaction.comment || undefined,
    })

    // Reset form and close dialog
    setNewTransaction({
      type: "expense",
      amount: "",
      categoryId: "",
      date: new Date().toISOString().split("T")[0],
      comment: "",
    })
    setIsAddDialogOpen(false)
  }

  const handleAddWallet = () => {
    if (!newWallet.name || !newWallet.currency) {
      return
    }

    addWallet({
      name: newWallet.name,
      currency: newWallet.currency,
    })

    // Reset form and close dialog
    setNewWallet({
      name: "",
      currency: "USD",
    })
    setIsAddWalletDialogOpen(false)
  }

  // Get currency symbol for current wallet
  const currencySymbol = currentWallet ? getCurrencySymbol(currentWallet.currency) : "$"

  // Calculate balances
  const balance = currentWallet ? getBalance() : 0
  const income = currentWallet
    ? currentWallet.transactions.filter((tx) => tx.type === "income").reduce((sum, tx) => sum + tx.amount, 0)
    : 0
  const expenses = currentWallet
    ? currentWallet.transactions.filter((tx) => tx.type === "expense").reduce((sum, tx) => sum + tx.amount, 0)
    : 0

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex space-x-2">
            <Dialog open={isAddWalletDialogOpen} onOpenChange={setIsAddWalletDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Wallet className="mr-2 h-4 w-4" />
                  Add Wallet
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Wallet</DialogTitle>
                  <DialogDescription>Add a new wallet with a specific currency</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Wallet Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Travel Wallet"
                      value={newWallet.name}
                      onChange={(e) => setNewWallet({ ...newWallet, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={newWallet.currency}
                      onValueChange={(value: "USD" | "KZT" | "RUB") => setNewWallet({ ...newWallet, currency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="KZT">KZT (₸)</SelectItem>
                        <SelectItem value="RUB">RUB (₽)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddWallet}>Add Wallet</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Transaction</DialogTitle>
                  <DialogDescription>Add a new transaction to your wallet</DialogDescription>
                </DialogHeader>
                <Tabs
                  defaultValue="expense"
                  className="w-full"
                  onValueChange={(value) => setNewTransaction({ ...newTransaction, type: value as TransactionType })}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="expense">Expense</TabsTrigger>
                    <TabsTrigger value="income">Income</TabsTrigger>
                  </TabsList>
                  <TabsContent value="expense" className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount ({currencySymbol})</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        value={newTransaction.amount}
                        onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={newTransaction.categoryId}
                        onValueChange={(value) => setNewTransaction({ ...newTransaction, categoryId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories
                            .filter((cat) => cat.type === "expense")
                            .map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>
                  <TabsContent value="income" className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount ({currencySymbol})</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        value={newTransaction.amount}
                        onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={newTransaction.categoryId}
                        onValueChange={(value) => setNewTransaction({ ...newTransaction, categoryId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories
                            .filter((cat) => cat.type === "income")
                            .map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>
                </Tabs>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comment">Comment (Optional)</Label>
                  <Textarea
                    id="comment"
                    placeholder="Add a comment..."
                    value={newTransaction.comment}
                    onChange={(e) => setNewTransaction({ ...newTransaction, comment: e.target.value })}
                  />
                </div>
                <DialogFooter>
                  <Button onClick={handleAddTransaction}>Add Transaction</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Wallet selector */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Select Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {wallets.map((wallet) => (
                <Button
                  key={wallet.id}
                  variant={wallet.id === currentWalletId ? "default" : "outline"}
                  className="justify-start"
                  onClick={() => setCurrentWalletId(wallet.id)}
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  {wallet.name} ({getCurrencySymbol(wallet.currency)})
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Balance cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Current Balance</CardDescription>
              <CardTitle className={balance >= 0 ? "text-green-600" : "text-red-600"}>
                {currencySymbol}
                {Math.abs(balance).toFixed(2)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Income</CardDescription>
              <CardTitle className="text-green-600">
                {currencySymbol}
                {income.toFixed(2)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Expenses</CardDescription>
              <CardTitle className="text-red-600">
                {currencySymbol}
                {expenses.toFixed(2)}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Recent transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your most recent transactions in {currentWallet?.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!currentWallet || currentWallet.transactions.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No transactions yet. Add your first transaction!
                </div>
              ) : (
                currentWallet.transactions
                  .slice(0, 10)
                  .map((transaction) => (
                    <TransactionItem
                      key={transaction.id}
                      transaction={transaction}
                      category={getCategory(transaction.categoryId)}
                      currencySymbol={currencySymbol}
                      onDelete={() => deleteTransaction(transaction.id)}
                    />
                  ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}

function TransactionItem({
  transaction,
  category,
  currencySymbol,
  onDelete,
}: {
  transaction: Transaction
  category?: { name: string; color: string; icon: string }
  currencySymbol: string
  onDelete: () => void
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="flex items-center space-x-4">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: category?.color || "#ccc" }}
        >
          {transaction.type === "income" ? (
            <ArrowUpCircle className="h-6 w-6 text-white" />
          ) : (
            <ArrowDownCircle className="h-6 w-6 text-white" />
          )}
        </div>
        <div>
          <div className="font-medium">{category?.name || "Unknown Category"}</div>
          <div className="text-sm text-muted-foreground">{transaction.comment || formatDate(transaction.date)}</div>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className={transaction.type === "income" ? "text-green-600" : "text-red-600"}>
          {transaction.type === "income" ? "+" : "-"}
          {currencySymbol}
          {transaction.amount.toFixed(2)}
        </div>
        <Button variant="ghost" size="sm" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </div>
  )
}
