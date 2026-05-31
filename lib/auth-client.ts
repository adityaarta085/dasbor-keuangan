'use client'

export async function signUp(email: string, password: string, name: string) {
  const response = await fetch('/api/auth/sign-up', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to sign up')
  }
  
  return response.json()
}

export async function signIn(email: string, password: string) {
  const response = await fetch('/api/auth/sign-in', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to sign in')
  }
  
  return response.json()
}

export async function signOut() {
  const response = await fetch('/api/auth/sign-out', {
    method: 'POST',
  })
  
  if (!response.ok) {
    throw new Error('Failed to sign out')
  }
}

export async function getUser() {
  const response = await fetch('/api/auth/user', {
    method: 'GET',
  })
  
  if (!response.ok) {
    return null
  }
  
  return response.json()
}
