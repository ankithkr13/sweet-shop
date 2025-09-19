import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { cookies } from "next/headers"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    const sessionToken = cookieStore.get("session_token")?.value

    if (!userId || !sessionToken) {
      return NextResponse.json({ detail: "Authentication required" }, { status: 401 })
    }

    // Get user from database
    const users = await sql`
      SELECT id, email, name, is_admin, created_at, updated_at
      FROM users 
      WHERE id = ${Number.parseInt(userId)}
    `

    if (users.length === 0) {
      return NextResponse.json({ detail: "User not found" }, { status: 404 })
    }

    const user = users[0]

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      is_admin: user.is_admin,
      created_at: user.created_at,
      updated_at: user.updated_at,
    })
  } catch (error) {
    console.error("Auth verification error:", error)
    return NextResponse.json({ detail: "Invalid session" }, { status: 401 })
  }
}
