import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getBudgets } from '@/app/actions/budgets'
import { getCategories } from '@/app/actions/categories'
import { Navigation } from '@/components/navigation'
import { BudgetsList } from '@/components/budgets-list'
import { BudgetForm } from '@/components/budget-form'

export default async function BudgetsPage() {
  const session = await getSession()

  if (!session?.user) {
    redirect('/sign-in')
  }

  const budgets = await getBudgets()
  const categories = await getCategories()

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={session.user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Budgets</h1>
          <p className="text-secondary-foreground mt-1">Manage and track your budget allocations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Budget Form */}
          <div className="lg:col-span-1">
            <BudgetForm categories={categories} />
          </div>

          {/* Budgets List */}
          <div className="lg:col-span-2">
            <BudgetsList budgets={budgets} categories={categories} />
          </div>
        </div>
      </main>
    </div>
  )
}
