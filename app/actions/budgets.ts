'use server'

import { db } from '@/lib/db'
import { budgets, budgetAllocations, categories } from '@/lib/db/schema'
import { and, eq, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'

async function getUserId() {
  const session = await getSession()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  return session.user.id
}

export async function getBudgets() {
  const userId = await getUserId()
  
  return db
    .select()
    .from(budgets)
    .where(eq(budgets.userId, userId))
    .orderBy(desc(budgets.month))
}

export async function getBudgetDetails(budgetId: string) {
  const userId = await getUserId()

  const budget = await db
    .select()
    .from(budgets)
    .where(and(eq(budgets.id, budgetId), eq(budgets.userId, userId)))
    .then(r => r[0])

  if (!budget) throw new Error('Budget not found')

  const allocations = await db
    .select({
      id: budgetAllocations.id,
      categoryId: budgetAllocations.categoryId,
      categoryName: categories.name,
      categoryColor: categories.color,
      allocationAmount: budgetAllocations.allocationAmount,
      allocationPercentage: budgetAllocations.allocationPercentage,
    })
    .from(budgetAllocations)
    .innerJoin(categories, eq(budgetAllocations.categoryId, categories.id))
    .where(eq(budgetAllocations.budgetId, budgetId))

  return { budget, allocations }
}

export async function createBudget(data: {
  month: string
  totalBudget: string
  allocations: Array<{
    categoryId: string
    allocationPercentage?: string
    allocationAmount?: string
  }>
}) {
  const userId = await getUserId()

  const [budget] = await db
    .insert(budgets)
    .values({
      userId,
      month: data.month,
      totalBudget: data.totalBudget,
    })
    .returning()

  for (const allocation of data.allocations) {
    await db.insert(budgetAllocations).values({
      budgetId: budget.id,
      categoryId: allocation.categoryId,
      allocationPercentage: allocation.allocationPercentage ? allocation.allocationPercentage.toString() : null,
      allocationAmount: allocation.allocationAmount ? allocation.allocationAmount.toString() : null,
    })
  }

  revalidatePath('/')
  return budget
}

export async function updateBudget(id: string, data: {
  totalBudget?: string
  allocations?: Array<{
    categoryId: string
    allocationPercentage?: string
    allocationAmount?: string
  }>
}) {
  const userId = await getUserId()

  const budget = await db
    .select()
    .from(budgets)
    .where(and(eq(budgets.id, id), eq(budgets.userId, userId)))
    .then(r => r[0])

  if (!budget) throw new Error('Budget not found')

  if (data.totalBudget) {
    await db
      .update(budgets)
      .set({ totalBudget: data.totalBudget })
      .where(eq(budgets.id, id))
  }

  if (data.allocations) {
    await db.delete(budgetAllocations).where(eq(budgetAllocations.budgetId, id))
    
    for (const allocation of data.allocations) {
      await db.insert(budgetAllocations).values({
        budgetId: id,
        categoryId: allocation.categoryId,
        allocationPercentage: allocation.allocationPercentage ? allocation.allocationPercentage.toString() : null,
        allocationAmount: allocation.allocationAmount ? allocation.allocationAmount.toString() : null,
      })
    }
  }

  revalidatePath('/')
}

export async function deleteBudget(id: string) {
  const userId = await getUserId()

  await db
    .delete(budgets)
    .where(and(eq(budgets.id, id), eq(budgets.userId, userId)))

  revalidatePath('/')
}
