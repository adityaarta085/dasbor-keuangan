import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getTransactions } from '@/app/actions/transactions'
import { getCategories } from '@/app/actions/categories'
import { Navigation } from '@/components/navigation'
import { TransactionsList } from '@/components/transactions-list'
import { TransactionForm } from '@/components/transaction-form'

export default async function TransactionsPage() {
  const session = await getSession()

  if (!session?.user) {
    redirect('/sign-in')
  }

  const transactions = await getTransactions()
  const categories = await getCategories()

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={session.user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
          <p className="text-secondary-foreground mt-1">Manage your income and expenses</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Transaction Form */}
          <div className="lg:col-span-1">
            <TransactionForm categories={categories} />
          </div>

          {/* Transactions List */}
          <div className="lg:col-span-2">
            <TransactionsList transactions={transactions} categories={categories} />
          </div>
        </div>
      </main>
    </div>
  )
}
