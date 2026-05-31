import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { Navigation } from '@/components/navigation'
import { FamilyManagement } from '@/components/family-management'

export default async function FamilyPage() {
  const session = await getSession()

  if (!session?.user) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={session.user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Family Management</h1>
          <p className="text-secondary-foreground mt-1">Manage your family groups and shared finances</p>
        </div>

        <FamilyManagement user={session.user} />
      </main>
    </div>
  )
}
