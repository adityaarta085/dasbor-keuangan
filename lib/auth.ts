import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from './db'
import { headers } from 'next/headers'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  basePath: '/api/auth',
  secret: process.env.BETTER_AUTH_SECRET || 'change-me-in-production',
  trustedOrigins: [
    'http://localhost:3000',
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null,
  ].filter(Boolean) as string[],
  denyDefaultCallbackURL: false,
})

export async function getSession() {
  const headersList = await headers()
  return await auth.api.getSession({ headers: headersList })
}
