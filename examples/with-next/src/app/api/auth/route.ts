import { NextRequest, NextResponse } from 'next/server'
import { checkBody } from '@/libs/telegram'

export async function POST(request: NextRequest) {
  try {
    const user = await checkBody(request)
    const response = NextResponse.json(user)
    response.cookies.set({
      name: 'user',
      value: btoa(JSON.stringify(user)),
      maxAge: 86400,
      secure: true
    })
    return response
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 401 })
  }
}
