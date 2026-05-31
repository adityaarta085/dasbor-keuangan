import { registerUser } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json()

    if (!email || !password) {
      return Response.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    const user = await registerUser(email, password, name)
    
    return Response.json(user)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return Response.json(
      { message },
      { status: 400 }
    )
  }
}
