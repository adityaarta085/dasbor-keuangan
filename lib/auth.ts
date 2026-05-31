import { cookies } from 'next/headers'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const HASH_ALGORITHM = 'SHA-256'
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest(HASH_ALGORITHM, data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest(HASH_ALGORITHM, data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const computedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return computedHash === hash
}

export interface User {
  id: string
  email: string
  name: string | null
  image: string | null
  emailVerified: boolean
}

export interface Session {
  user: User
  expiresAt: number
}

export async function registerUser(email: string, password: string, name: string): Promise<User> {
  const client = await pool.connect()
  try {
    const existingResult = await client.query(
      'SELECT id FROM neon_auth."user" WHERE email = $1',
      [email.toLowerCase()]
    )

    if (existingResult.rows.length > 0) {
      throw new Error('Email already registered')
    }

    const passwordHash = await hashPassword(password)
    const userId = crypto.randomUUID()

    await client.query(
      `INSERT INTO neon_auth."user" (id, email, name, "emailVerified", "createdAt", "updatedAt") 
       VALUES ($1, $2, $3, $4, NOW(), NOW())`,
      [userId, email.toLowerCase(), name || null, false]
    )

    await client.query(
      `INSERT INTO neon_auth.account (id, "userId", "providerId", "accountId", password, "createdAt", "updatedAt") 
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      [crypto.randomUUID(), userId, 'credential', email.toLowerCase(), passwordHash]
    )

    return {
      id: userId,
      email: email.toLowerCase(),
      name: name || null,
      image: null,
      emailVerified: false,
    }
  } finally {
    client.release()
  }
}

export async function signInUser(email: string, password: string): Promise<Session> {
  const client = await pool.connect()
  try {
    const userResult = await client.query(
      'SELECT id, email, name, image, "emailVerified" FROM neon_auth."user" WHERE email = $1',
      [email.toLowerCase()]
    )

    if (userResult.rows.length === 0) {
      throw new Error('Invalid email or password')
    }

    const user = userResult.rows[0]

    const accountResult = await client.query(
      'SELECT password FROM neon_auth.account WHERE "userId" = $1 AND "providerId" = $2',
      [user.id, 'credential']
    )

    if (accountResult.rows.length === 0 || !accountResult.rows[0].password) {
      throw new Error('Invalid email or password')
    }

    const isPasswordValid = await verifyPassword(password, accountResult.rows[0].password)
    if (!isPasswordValid) {
      throw new Error('Invalid email or password')
    }

    const expiresAt = Date.now() + SESSION_DURATION
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      emailVerified: user.emailVerified,
    }

    const cookieStore = await cookies()
    
    // Store user data in cookie
    cookieStore.set('user-session', JSON.stringify(userData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION / 1000,
      path: '/',
    })

    return {
      user: userData,
      expiresAt,
    }
  } finally {
    client.release()
  }
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const userSessionCookie = cookieStore.get('user-session')?.value

  if (!userSessionCookie) {
    return null
  }

  try {
    const user = JSON.parse(userSessionCookie)
    return {
      user,
      expiresAt: Date.now() + SESSION_DURATION,
    }
  } catch (e) {
    return null
  }
}

export async function signOutUser(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('user-session')
}
