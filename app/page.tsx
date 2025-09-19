"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Package, TrendingUp } from "lucide-react"
import { useState, useEffect } from "react"
import { AuthModal } from "@/components/auth-modal"
import { SweetCard } from "@/components/sweet-card"
import { AdminDashboard } from "@/components/admin-dashboard"

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

export default function HomePage() {
  const { user, logout, loading } = useAuth()
  const [sweets, setSweets] = useState<Sweet[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const [loadingSweets, setLoadingSweets] = useState(false)

  useEffect(() => {
    if (user) {
      fetchSweets()
    }
  }, [user])

  const fetchSweets = async () => {
    if (!user) return

    setLoadingSweets(true)
    try {
      console.log("[v0] Fetching sweets from /api/sweets")
      const response = await fetch("/api/sweets", {
        credentials: "include",
      })

      console.log("[v0] Fetch response status:", response.status)
      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Sweets data received:", data.length, "items")
        setSweets(data)
      } else {
        console.error("[v0] Failed to fetch sweets, status:", response.status)
      }
    } catch (error) {
      console.error("Failed to fetch sweets:", error)
    } finally {
      setLoadingSweets(false)
    }
  }

  const handleSearch = async () => {
    if (!user || !searchTerm.trim()) {
      fetchSweets()
      return
    }

    setLoadingSweets(true)
    try {
      console.log("[v0] Searching sweets with term:", searchTerm)
      const response = await fetch(`/api/sweets/search?name=${encodeURIComponent(searchTerm)}`, {
        credentials: "include",
      })

      console.log("[v0] Search response status:", response.status)
      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Search results:", data.length, "items")
        setSweets(data)
      } else {
        console.error("[v0] Failed to search sweets, status:", response.status)
      }
    } catch (error) {
      console.error("Failed to search sweets:", error)
    } finally {
      setLoadingSweets(false)
    }
  }

  const openAuthModal = (mode: "login" | "register") => {
    setAuthMode(mode)
    setShowAuthModal(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-card">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">🍭</span>
              </div>
              <h1 className="text-2xl font-bold text-primary">Sweet Shop</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => openAuthModal("login")}>
                Login
              </Button>
              <Button onClick={() => openAuthModal("register")}>Sign Up</Button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <h2 className="text-5xl font-bold mb-6 text-balance">Welcome to Sweet Shop</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
              Discover the finest collection of sweets, candies, and desserts. From classic chocolates to artisanal
              treats, we have something for every sweet tooth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => openAuthModal("register")}>
                Get Started
              </Button>
              <Button size="lg" variant="outline" onClick={() => openAuthModal("login")}>
                Browse Sweets
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-4 bg-card/50">
          <div className="container mx-auto">
            <h3 className="text-3xl font-bold text-center mb-12">Why Choose Sweet Shop?</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <Package className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>Premium Quality</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Hand-selected sweets from the finest confectioners around the world.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Search className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>Easy Discovery</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Find your perfect treat with our advanced search and filtering system.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <TrendingUp className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>Fresh Inventory</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Always fresh stock with real-time inventory updates and new arrivals.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          mode={authMode}
          onModeChange={setAuthMode}
        />
      </div>
    )
  }

  // Show admin dashboard for admin users
  if (user.is_admin) {
    return <AdminDashboard />
  }

  // Regular user dashboard
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">🍭</span>
            </div>
            <h1 className="text-2xl font-bold text-primary">Sweet Shop</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary">Welcome, {user.name}</Badge>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <section className="py-8 px-4 bg-card/30">
        <div className="container mx-auto">
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <Input
                placeholder="Search for sweets, chocolates, candies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch}>
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Sweets Grid */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8">Our Sweet Collection</h2>

          {loadingSweets ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-muted rounded-t-lg"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded mb-4"></div>
                    <div className="h-8 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sweets.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sweets.map((sweet) => (
                <SweetCard key={sweet.id} sweet={sweet} onPurchase={fetchSweets} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No sweets found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Try adjusting your search terms." : "Check back later for new arrivals!"}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
