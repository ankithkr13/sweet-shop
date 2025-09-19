"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Package } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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

interface SweetCardProps {
  sweet: Sweet
  onPurchase: () => void
}

export function SweetCard({ sweet, onPurchase }: SweetCardProps) {
  const [purchasing, setPurchasing] = useState(false)
  const { toast } = useToast()
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""

  const handlePurchase = async () => {
    setPurchasing(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/sweets/${sweet.id}/purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ quantity: 1 }),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Purchase successful!",
          description: `You bought ${sweet.name} for $${sweet.price}`,
        })
        onPurchase() // Refresh the sweets list
      } else {
        const error = await response.json()
        throw new Error(error.detail || "Purchase failed")
      }
    } catch (error) {
      toast({
        title: "Purchase failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setPurchasing(false)
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-square bg-gradient-to-br from-card to-muted flex items-center justify-center">
        {sweet.image_url ? (
          <img src={sweet.image_url || "/placeholder.svg"} alt={sweet.name} className="w-full h-full object-cover" />
        ) : (
          <Package className="w-16 h-16 text-muted-foreground" />
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg leading-tight">{sweet.name}</h3>
          <Badge variant="secondary" className="ml-2 shrink-0">
            ${sweet.price}
          </Badge>
        </div>

        {sweet.category_name && (
          <Badge variant="outline" className="mb-2">
            {sweet.category_name}
          </Badge>
        )}

        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {sweet.description || "Delicious sweet treat"}
        </p>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Stock: {sweet.quantity}</span>
          {sweet.quantity === 0 && <Badge variant="destructive">Out of Stock</Badge>}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button onClick={handlePurchase} disabled={sweet.quantity === 0 || purchasing} className="w-full">
          {purchasing ? (
            "Processing..."
          ) : sweet.quantity === 0 ? (
            "Out of Stock"
          ) : (
            <>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Buy Now
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
