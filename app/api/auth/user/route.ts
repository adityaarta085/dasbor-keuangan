import { cookies } from 'next/headers'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('session-token')?.value

    if (!sessionToken) {
      return Response.json(
        { message: 'Not authenticated' },
        { status: 401 }
      )
    }

    // For now, return empty user since we're not storing session token mapping
    // In production, you'd look up the user from the session table
    return Response.json(
      { message: 'Authenticated but user lookup not implemented' },
      { status: 401 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return Response.json(
      { message },
      { status: 500 }
    )
  }
}
