import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import jwt from "jsonwebtoken"

const sql = neon(process.env.DATABASE_URL!)

async function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Authorization required")
  }

  const token = authHeader.substring(7)
  const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as { sub: string }
  return Number.parseInt(decoded.sub)
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await verifyAuth(request)
    const sweetId = Number.parseInt(params.id)
    const { quantity = 1 } = await request.json()

    if (quantity <= 0) {
      return NextResponse.json({ detail: "Quantity must be positive" }, { status: 400 })
    }

    // Get sweet details
    const sweets = await sql`
      SELECT * FROM sweets WHERE id = ${sweetId}
    `

    if (sweets.length === 0) {
      return NextResponse.json({ detail: "Sweet not found" }, { status: 404 })
    }

    const sweet = sweets[0]

    // Check if enough quantity available
    if (sweet.quantity < quantity) {
      return NextResponse.json({ detail: "Not enough quantity available" }, { status: 400 })
    }

    // Calculate total price
    const unitPrice = Number.parseFloat(sweet.price.toString())
    const totalPrice = unitPrice * quantity

    // Start transaction - update sweet quantity and record purchase
    const updatedSweet = await sql`
      UPDATE sweets 
      SET quantity = quantity - ${quantity}
      WHERE id = ${sweetId}
      RETURNING *
    `

    const purchase = await sql`
      INSERT INTO purchases (user_id, sweet_id, quantity, unit_price, total_price)
      VALUES (${userId}, ${sweetId}, ${quantity}, ${unitPrice}, ${totalPrice})
      RETURNING *
    `

    return NextResponse.json({
      message: "Purchase successful",
      purchase: purchase[0],
      total_price: totalPrice,
    })
  } catch (error) {
    console.error("Purchase error:", error)
    if (error instanceof Error && error.message === "Authorization required") {
      return NextResponse.json({ detail: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ detail: "Purchase failed" }, { status: 500 })
  }
}
