import { cookies } from 'next/headers'
import { db } from './db'
import { account, user } from './db/schema'
import { eq } from 'drizzle-orm'

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

function generateToken(): string {
  return crypto.getRandomValues(new Uint8Array(32)).reduce((a, b) => a + b.toString(16).padStart(2, '0'), '')
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

function generateUUID(): string {
  // Generate a version 4 UUID
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  array[6] = (array[6] & 0x0f) | 0x40 // Set version to 4
  array[8] = (array[8] & 0x3f) | 0x80 // Set variant to RFC 4122
  
  const hex = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('')
  return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20)].join('-')
}

export async function registerUser(email: string, password: string, name: string): Promise<User> {
  const passwordHash = await hashPassword(password)
  const normalizedEmail = email.toLowerCase()
  
  const existingUser = await db
    .select()
    .from(user)
    .where(eq(user.email, normalizedEmail))
    .limit(1)

  if (existingUser.length > 0) {
    throw new Error('Email already registered')
  }

  const userId = generateUUID()
  const newUser = {
    id: userId,
    email: normalizedEmail,
    name: name || null,
    image: null,
    emailVerified: false,
  }

  await db.insert(user).values(newUser)

  await db.insert(account).values({
    id: generateUUID(),
    userId: userId,
    type: 'email',
    provider: 'credential',
    providerAccountId: normalizedEmail,
    password: passwordHash,
  })

  return {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    image: newUser.image,
    emailVerified: newUser.emailVerified,
  }
}

export async function signInUser(email: string, password: string): Promise<Session> {
  const foundUser = await db
    .select()
    .from(user)
    .where(eq(user.email, email.toLowerCase()))
    .limit(1)

  if (foundUser.length === 0) {
    throw new Error('Invalid email or password')
  }

  const foundAccount = await db
    .select()
    .from(account)
    .where(eq(account.userId, foundUser[0].id))
    .limit(1)

  if (foundAccount.length === 0 || !foundAccount[0].password) {
    throw new Error('Invalid email or password')
  }

  const isPasswordValid = await verifyPassword(password, foundAccount[0].password)
  if (!isPasswordValid) {
    throw new Error('Invalid email or password')
  }

  const sessionToken = generateToken()
  const expiresAt = Date.now() + SESSION_DURATION

  const cookieStore = await cookies()
  cookieStore.set('session-token', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000,
    path: '/',
  })

  return {
    user: {
      id: foundUser[0].id,
      email: foundUser[0].email,
      name: foundUser[0].name,
      image: foundUser[0].image,
      emailVerified: foundUser[0].emailVerified,
    },
    expiresAt,
  }
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session-token')?.value

  if (!token) {
    return null
  }

  // In production, you'd validate the token against a session table
  // For now, we'll return the user from the token
  return null
}

export async function signOutUser(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('session-token')
}
