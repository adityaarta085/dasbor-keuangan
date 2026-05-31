import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { AuthForm } from '@/components/auth-form'

export default async function SignInPage() {
  const session = await getSession()
  
  if (session?.user) {
    redirect('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
          <p className="text-secondary-foreground">Sign in to your account</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
          <AuthForm mode="sign-in" />
        </div>
      </div>
    </div>
  )
}
