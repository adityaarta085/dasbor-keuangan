import { signOutUser } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    await signOutUser()
    return Response.json({ message: 'Signed out successfully' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred'
    return Response.json(
      { message },
      { status: 400 }
    )
  }
}
