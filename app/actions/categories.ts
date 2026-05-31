'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { categories } from '@/lib/db/schema'
import { and, eq, desc } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const headersList = await headers()
  const session = await auth.api.getSession({ headers: headersList })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function getCategories() {
  const userId = await getUserId()
  
  return db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(desc(categories.createdAt))
}

export async function createCategory(data: {
  name: string
  description?: string
  icon?: string
  color?: string
}) {
  const userId = await getUserId()

  const result = await db.insert(categories).values({
    userId,
    name: data.name,
    description: data.description || null,
    icon: data.icon || null,
    color: data.color || '#3b82f6',
  }).returning()

  revalidatePath('/')
  return result[0]
}

export async function updateCategory(id: string, data: {
  name?: string
  description?: string
  icon?: string
  color?: string
}) {
  const userId = await getUserId()

  await db
    .update(categories)
    .set(data)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))

  revalidatePath('/')
}

export async function deleteCategory(id: string) {
  const userId = await getUserId()

  await db
    .delete(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))

  revalidatePath('/')
}
