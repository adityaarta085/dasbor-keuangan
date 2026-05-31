'use server'

import { db } from '@/lib/db'
import { transactions, categories } from '@/lib/db/schema'
import { and, eq, gte, lte, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'

async function getUserId() {
  const session = await getSession()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  return session.user.id
}

export async function getTransactions(startDate?: string, endDate?: string) {
  const userId = await getUserId()
  
  const conditions: any[] = [eq(transactions.userId, userId)]
  
  if (startDate) {
    conditions.push(gte(transactions.transactionDate, startDate))
  }
  if (endDate) {
    conditions.push(lte(transactions.transactionDate, endDate))
  }

  return db
    .select({
      id: transactions.id,
      category: categories.name,
      categoryColor: categories.color,
      categoryIcon: categories.icon,
      type: transactions.type,
      amount: transactions.amount,
      description: transactions.description,
      transactionDate: transactions.transactionDate,
      createdAt: transactions.createdAt,
    })
    .from(transactions)
    .innerJoin(categories, eq(transactions.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(desc(transactions.transactionDate))
}

export async function createTransaction(data: {
  categoryId: string
  type: 'income' | 'expense'
  amount: string
  description?: string
  transactionDate: string
}) {
  const userId = await getUserId()

  await db.insert(transactions).values({
    userId,
    categoryId: data.categoryId,
    type: data.type,
    amount: data.amount,
    description: data.description || null,
    transactionDate: data.transactionDate,
  })

  revalidatePath('/')
}

export async function updateTransaction(id: string, data: {
  categoryId?: string
  type?: 'income' | 'expense'
  amount?: string
  description?: string
  transactionDate?: string
}) {
  const userId = await getUserId()

  await db
    .update(transactions)
    .set(data)
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))

  revalidatePath('/')
}

export async function deleteTransaction(id: string) {
  const userId = await getUserId()

  await db
    .delete(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))

  revalidatePath('/')
}
