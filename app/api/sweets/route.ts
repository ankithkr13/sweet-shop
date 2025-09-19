import { NextResponse } from "next/server"
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

export async function GET() {
  try {
    await verifyAuth()

    const sweets = await sql`
      SELECT s.*, c.name as category_name
      FROM sweets s
      LEFT JOIN categories c ON s.category_id = c.id
      ORDER BY s.created_at DESC
    `

    return NextResponse.json(sweets)
  } catch (error) {
    console.error("Get sweets error:", error)
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 })
  }
}
