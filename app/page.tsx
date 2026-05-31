import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getTransactions } from '@/app/actions/transactions'
import { Dashboard } from '@/components/dashboard'
import { Navigation } from '@/components/navigation'

export default async function DashboardPage() {
  const session = await getSession()

  if (!session?.user) {
    redirect('/sign-in')
  }

  const transactions = await getTransactions()

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={session.user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-secondary-foreground mt-1">Manage your personal and family finances</p>
        </div>
        <Dashboard transactions={transactions} />
      </main>
    </div>
  )
}
