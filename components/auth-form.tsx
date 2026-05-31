'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

interface AuthFormProps {
  mode: 'sign-in' | 'sign-up'
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (mode === 'sign-up') {
        await authClient.signUp.email({
          email,
          password,
          name,
        })
      } else {
        await authClient.signIn.email({
          email,
          password,
        })
      }
      router.push('/')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
      {error && (
        <div className="bg-red-50 text-red-800 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      {mode === 'sign-up' && (
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="Your name"
          />
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder="your@email.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-foreground">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition"
      >
        {loading ? 'Loading...' : mode === 'sign-in' ? 'Sign In' : 'Sign Up'}
      </button>

      <div className="text-center text-sm">
        {mode === 'sign-in' ? (
          <p>
            Don&apos;t have an account?{' '}
            <a href="/sign-up" className="text-accent hover:underline">
              Sign up
            </a>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <a href="/sign-in" className="text-accent hover:underline">
              Sign in
            </a>
          </p>
        )}
      </div>
    </form>
  )
}
