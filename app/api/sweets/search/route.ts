import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { cookies } from "next/headers"

const sql = neon(process.env.DATABASE_URL!)

async function verifyAuth() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session_token")?.value
  const userId = cookieStore.get("user_id")?.value

  if (!sessionToken || !userId) {
    throw new Error("Authentication required")
  }

  const sessions = await sql`
    SELECT user_id FROM user_sessions 
    WHERE session_token = ${sessionToken} AND user_id = ${userId}
  `

  if (sessions.length === 0) {
    throw new Error("Invalid session")
  }

  return Number.parseInt(userId)
}

export async function GET(request: NextRequest) {
  try {
    await verifyAuth()

    const { searchParams } = new URL(request.url)
    const name = searchParams.get("name")
    const category = searchParams.get("category")
    const minPrice = searchParams.get("min_price")
    const maxPrice = searchParams.get("max_price")

    let query = `
      SELECT s.*, c.name as category_name
      FROM sweets s
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE 1=1
    `
    const params: any[] = []

    if (name) {
      query += ` AND s.name ILIKE $${params.length + 1}`
      params.push(`%${name}%`)
    }

    if (category) {
      query += ` AND c.name ILIKE $${params.length + 1}`
      params.push(`%${category}%`)
    }

    if (minPrice) {
      query += ` AND s.price >= $${params.length + 1}`
      params.push(Number.parseFloat(minPrice))
    }

    if (maxPrice) {
      query += ` AND s.price <= $${params.length + 1}`
      params.push(Number.parseFloat(maxPrice))
    }

    query += ` ORDER BY s.created_at DESC`

    const sweets = await sql(query, params)

    return NextResponse.json(sweets)
  } catch (error) {
    console.error("Search sweets error:", error)
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 })
  }
}
