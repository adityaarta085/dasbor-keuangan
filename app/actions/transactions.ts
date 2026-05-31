'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { transactions, categories } from '@/lib/db/schema'
import { and, eq, gte, lte, desc } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const headersList = await headers()
  const session = await auth.api.getSession({ headers: headersList })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function getTransactions(startDate?: string, endDate?: string) {
  const userId = await getUserId()
  
  let query = db
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
    .where(eq(transactions.userId, userId))

  if (startDate) {
    query = query.where(gte(transactions.transactionDate, startDate))
  }
  if (endDate) {
    query = query.where(lte(transactions.transactionDate, endDate))
  }

  return query.orderBy(desc(transactions.transactionDate))
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
