import { signInUser } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return Response.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    await signInUser(email, password)
    
    return Response.json({ message: 'Signed in successfully' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return Response.json(
      { message },
      { status: 400 }
    )
  }
}
