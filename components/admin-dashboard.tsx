"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, Package, Users, TrendingUp, DollarSign } from "lucide-react"

interface Sweet {
  id: number
  name: string
  description: string
  category_id: number
  price: number
  quantity: number
  image_url: string
  created_at: string
  updated_at: string
  category_name?: string
}

interface Category {
  id: number
  name: string
  description: string
  created_at: string
}

export function AdminDashboard() {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const [sweets, setSweets] = useState<Sweet[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddSweet, setShowAddSweet] = useState(false)
  const [editingSweet, setEditingSweet] = useState<Sweet | null>(null)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

  useEffect(() => {
    fetchSweets()
    fetchCategories()
  }, [])

  const fetchSweets = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sweets`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setSweets(data)
      }
    } catch (error) {
      console.error("Failed to fetch sweets:", error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories`)
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    }
  }

  const handleAddSweet = async (formData: FormData) => {
    setLoading(true)
    try {
      const sweetData = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        category_id: Number.parseInt(formData.get("category_id") as string),
        price: Number.parseFloat(formData.get("price") as string),
        quantity: Number.parseInt(formData.get("quantity") as string),
        image_url: formData.get("image_url") as string,
      }

      const response = await fetch(`${API_BASE_URL}/api/sweets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(sweetData),
      })

      if (response.ok) {
        toast({
          title: "Sweet added successfully!",
          description: "The new sweet has been added to your inventory.",
        })
        setShowAddSweet(false)
        fetchSweets()
      } else {
        throw new Error("Failed to add sweet")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add sweet. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSweet = async (sweetId: number) => {
    if (!confirm("Are you sure you want to delete this sweet?")) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/sweets/${sweetId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.ok) {
        toast({
          title: "Sweet deleted",
          description: "The sweet has been removed from your inventory.",
        })
        fetchSweets()
      } else {
        throw new Error("Failed to delete sweet")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete sweet. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRestock = async (sweetId: number, quantity: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sweets/${sweetId}/restock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ quantity }),
      })

      if (response.ok) {
        toast({
          title: "Restocked successfully!",
          description: `Added ${quantity} units to inventory.`,
        })
        fetchSweets()
      } else {
        throw new Error("Failed to restock")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to restock. Please try again.",
        variant: "destructive",
      })
    }
  }

  const totalValue = sweets.reduce((sum, sweet) => sum + sweet.price * sweet.quantity, 0)
  const totalItems = sweets.reduce((sum, sweet) => sum + sweet.quantity, 0)
  const lowStockItems = sweets.filter((sweet) => sweet.quantity < 10).length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">🍭</span>
            </div>
            <h1 className="text-2xl font-bold text-primary">Sweet Shop Admin</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary">Admin: {user?.name}</Badge>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalItems}</div>
              <p className="text-xs text-muted-foreground">Across {sweets.length} products</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Total stock value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lowStockItems}</div>
              <p className="text-xs text-muted-foreground">Items below 10 units</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
              <p className="text-xs text-muted-foreground">Product categories</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Inventory Management</h2>
          <Dialog open={showAddSweet} onOpenChange={setShowAddSweet}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Sweet
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Sweet</DialogTitle>
                <DialogDescription>Add a new sweet to your inventory.</DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleAddSweet(new FormData(e.currentTarget))
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category_id">Category</Label>
                  <Select name="category_id" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input id="price" name="price" type="number" step="0.01" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input id="quantity" name="quantity" type="number" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input id="image_url" name="image_url" type="url" />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Adding..." : "Add Sweet"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Sweets Table */}
        <Card>
          <CardHeader>
            <CardTitle>Sweet Inventory</CardTitle>
            <CardDescription>Manage your sweet inventory, update stock levels, and track sales.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sweets.map((sweet) => (
                <div key={sweet.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                        {sweet.image_url ? (
                          <img
                            src={sweet.image_url || "/placeholder.svg"}
                            alt={sweet.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{sweet.name}</h3>
                        <p className="text-sm text-muted-foreground">{sweet.category_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">${sweet.price}</Badge>
                          <Badge variant={sweet.quantity < 10 ? "destructive" : "secondary"}>
                            Stock: {sweet.quantity}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const quantity = prompt("Enter quantity to restock:")
                        if (quantity && Number.parseInt(quantity) > 0) {
                          handleRestock(sweet.id, Number.parseInt(quantity))
                        }
                      }}
                    >
                      Restock
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setEditingSweet(sweet)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteSweet(sweet.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
