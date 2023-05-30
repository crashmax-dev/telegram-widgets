import { NextRequest, NextResponse } from 'next/server'
import { authCrypto } from '@/libs/telegram'
import type { User } from '@telegram-widgets/login'

export async function POST(request: NextRequest) {
  try {
    const user: User = await request.json()
    const encryptedData = await authCrypto.encryptData(JSON.stringify(user))
    if (!encryptedData) {
      throw new Error('Invalid user data')
    }

    const response = NextResponse.json(user)
    response.cookies.set({
      name: 'user',
      value: encryptedData,
      maxAge: 60 * 60 * 24 * 7,
      secure: true
    })
    return response
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 401 })
  }
}
