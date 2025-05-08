"use client"

import { useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { useOnlineWallet, type Transaction } from "@/components/providers/online-wallet-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"

export function StatsView() {
  const { wallets, currentWalletId, setCurrentWalletId, currentWallet, categories, getCategory, getCurrencySymbol } =
    useOnlineWallet()
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  })

  // Get currency symbol for current wallet
  const currencySymbol = currentWallet ? getCurrencySymbol(currentWallet.currency) : "$"

  // Filter transactions by date range
  const filteredTransactions = currentWallet
    ? currentWallet.transactions.filter((tx) => {
        const txDate = new Date(tx.date)
        return txDate >= new Date(dateRange.startDate) && txDate <= new Date(dateRange.endDate)
      })
    : []

  // Prepare data for charts
  const incomeByCategory = prepareChartData(filteredTransactions, "income")
  const expensesByCategory = prepareChartData(filteredTransactions, "expense")

  // Calculate totals
  const totalIncome = incomeByCategory.reduce((sum, item) => sum + item.value, 0)
  const totalExpenses = expensesByCategory.reduce((sum, item) => sum + item.value, 0)

  function prepareChartData(transactions: Transaction[], type: "income" | "expense") {
    const data: Record<string, number> = {}

    transactions
      .filter((tx) => tx.type === type)
      .forEach((tx) => {
        const category = getCategory(tx.categoryId)
        if (category) {
          if (data[category.name]) {
            data[category.name] += tx.amount
          } else {
            data[category.name] = tx.amount
          }
        }
      })

    return Object.entries(data).map(([name, value]) => {
      const category = categories.find((cat) => cat.name === name)
      return {
        name,
        value,
        color: category?.color || "#ccc",
      }
    })
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Statistics</h1>

        {/* Wallet selector */}
        <Card>
          <CardHeader>
            <CardTitle>Select Wallet</CardTitle>
            <CardDescription>Choose a wallet to view statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={currentWalletId} onValueChange={setCurrentWalletId}>
              <SelectTrigger>
                <SelectValue placeholder="Select wallet" />
              </SelectTrigger>
              <SelectContent>
                {wallets.map((wallet) => (
                  <SelectItem key={wallet.id} value={wallet.id}>
                    {wallet.name} ({getCurrencySymbol(wallet.currency)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Date range selector */}
        <Card>
          <CardHeader>
            <CardTitle>Date Range</CardTitle>
            <CardDescription>Select a date range for your statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <Tabs defaultValue="pie" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pie">Pie Charts</TabsTrigger>
            <TabsTrigger value="bar">Bar Charts</TabsTrigger>
          </TabsList>

          <TabsContent value="pie" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Income Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Income by Category</CardTitle>
                  <CardDescription>
                    Total: {currencySymbol}
                    {totalIncome.toFixed(2)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {incomeByCategory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={incomeByCategory}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {incomeByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${currencySymbol}${(value as number).toFixed(2)}`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      No income data for selected period
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Expenses Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Expenses by Category</CardTitle>
                  <CardDescription>
                    Total: {currencySymbol}
                    {totalExpenses.toFixed(2)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {expensesByCategory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expensesByCategory}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {expensesByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${currencySymbol}${(value as number).toFixed(2)}`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      No expense data for selected period
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bar" className="space-y-4">
            {/* Income Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Income by Category</CardTitle>
                <CardDescription>
                  Total: {currencySymbol}
                  {totalIncome.toFixed(2)}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {incomeByCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={incomeByCategory}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `${currencySymbol}${(value as number).toFixed(2)}`} />
                      <Legend />
                      <Bar dataKey="value" name="Amount">
                        {incomeByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No income data for selected period
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Expenses Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Expenses by Category</CardTitle>
                <CardDescription>
                  Total: {currencySymbol}
                  {totalExpenses.toFixed(2)}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {expensesByCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={expensesByCategory}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `${currencySymbol}${(value as number).toFixed(2)}`} />
                      <Legend />
                      <Bar dataKey="value" name="Amount">
                        {expensesByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No expense data for selected period
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
