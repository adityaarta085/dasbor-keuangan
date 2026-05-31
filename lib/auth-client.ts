'use client'

export interface User {
  id: string
  email: string
  name: string | null
  image: string | null
  emailVerified: boolean
}

export async function signUp(email: string, password: string, name: string): Promise<User> {
  const response = await fetch('/api/auth/sign-up', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to sign up')
  }
  
  const user = await response.json()
  // Store user in localStorage for client-side access
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user))
  }
  return user
}

export async function signIn(email: string, password: string): Promise<User> {
  const response = await fetch('/api/auth/sign-in', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to sign in')
  }
  
  const user = await response.json()
  // Store user in localStorage for client-side access
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user))
  }
  return user
}

export async function signOut(): Promise<void> {
  const response = await fetch('/api/auth/sign-out', {
    method: 'POST',
  })
  
  if (!response.ok) {
    throw new Error('Failed to sign out')
  }
  
  // Clear user from localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user')
  }
}

export function getLocalUser(): User | null {
  if (typeof window === 'undefined') return null
  
  const userJson = localStorage.getItem('user')
  if (!userJson) return null
  
  try {
    return JSON.parse(userJson)
  } catch (e) {
    return null
  }
}
