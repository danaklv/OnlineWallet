"use client"

import { useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { useOnlineWallet, type Category, type TransactionType } from "@/components/providers/online-wallet-provider"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowDownCircle, ArrowUpCircle, Plus, Trash2, Wallet } from "lucide-react"

export function SettingsView() {
  const { categories, wallets, currentWalletId, setCurrentWalletId, addCategory, deleteCategory, getCurrencySymbol } =
    useOnlineWallet()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newCategory, setNewCategory] = useState<{
    name: string
    color: string
    icon: string
    type: TransactionType
  }>({
    name: "",
    color: "#4CAF50",
    icon: "default",
    type: "expense",
  })

  const incomeCategories = categories.filter((cat) => cat.type === "income")
  const expenseCategories = categories.filter((cat) => cat.type === "expense")

  const handleAddCategory = () => {
    if (!newCategory.name) {
      return
    }

    addCategory({
      name: newCategory.name,
      color: newCategory.color,
      icon: newCategory.icon,
      type: newCategory.type,
    })

    // Reset form and close dialog
    setNewCategory({
      name: "",
      color: "#4CAF50",
      icon: "default",
      type: "expense",
    })
    setIsAddDialogOpen(false)
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Settings</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Category</DialogTitle>
                <DialogDescription>Add a new category for your transactions</DialogDescription>
              </DialogHeader>
              <Tabs
                defaultValue="expense"
                className="w-full"
                onValueChange={(value) => setNewCategory({ ...newCategory, type: value as TransactionType })}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="expense">Expense</TabsTrigger>
                  <TabsTrigger value="income">Income</TabsTrigger>
                </TabsList>
                <TabsContent value="expense" className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Category Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Groceries"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="color"
                        type="color"
                        className="h-10 w-20"
                        value={newCategory.color}
                        onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                      />
                      <div className="h-10 w-10 rounded-full" style={{ backgroundColor: newCategory.color }} />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="income" className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Category Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Salary"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="color"
                        type="color"
                        className="h-10 w-20"
                        value={newCategory.color}
                        onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                      />
                      <div className="h-10 w-10 rounded-full" style={{ backgroundColor: newCategory.color }} />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              <DialogFooter>
                <Button onClick={handleAddCategory}>Add Category</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Wallets */}
        <Card>
          <CardHeader>
            <CardTitle>Your Wallets</CardTitle>
            <CardDescription>Manage your currency wallets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {wallets.map((wallet) => (
                <div
                  key={wallet.id}
                  className={`flex items-center justify-between rounded-lg border p-4 ${wallet.id === currentWalletId ? "border-primary bg-primary/10" : ""}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                      <Wallet className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium">{wallet.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {getCurrencySymbol(wallet.currency)} {wallet.currency}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant={wallet.id === currentWalletId ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentWalletId(wallet.id)}
                  >
                    {wallet.id === currentWalletId ? "Current" : "Select"}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>Manage your transaction categories</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="expense" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="expense">Expense Categories</TabsTrigger>
                <TabsTrigger value="income">Income Categories</TabsTrigger>
              </TabsList>
              <TabsContent value="expense" className="mt-4 space-y-4">
                {expenseCategories.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No expense categories yet. Add your first category!
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {expenseCategories.map((category) => (
                      <CategoryItem
                        key={category.id}
                        category={category}
                        onDelete={() => deleteCategory(category.id)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="income" className="mt-4 space-y-4">
                {incomeCategories.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No income categories yet. Add your first category!
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {incomeCategories.map((category) => (
                      <CategoryItem
                        key={category.id}
                        category={category}
                        onDelete={() => deleteCategory(category.id)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}

function CategoryItem({
  category,
  onDelete,
}: {
  category: Category
  onDelete: () => void
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="flex items-center space-x-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: category.color }}
        >
          {category.type === "income" ? (
            <ArrowUpCircle className="h-6 w-6 text-white" />
          ) : (
            <ArrowDownCircle className="h-6 w-6 text-white" />
          )}
        </div>
        <div className="font-medium">{category.name}</div>
      </div>
      <Button variant="ghost" size="sm" onClick={onDelete}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
