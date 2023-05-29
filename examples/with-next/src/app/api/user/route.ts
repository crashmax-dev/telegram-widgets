import { NextRequest, NextResponse } from 'next/server'
import { checkCookie } from '@/libs/telegram'

export async function GET(request: NextRequest) {
  try {
    const user = await checkCookie(request)
    return NextResponse.json(user)
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 401 })
  }
}
