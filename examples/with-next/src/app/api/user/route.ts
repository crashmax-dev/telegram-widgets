import { NextRequest, NextResponse } from 'next/server'
import { authValidate } from '@/libs/telegram'

export async function GET(request: NextRequest) {
  try {
    const user = await authValidate.getSession(request, { name: 'user' })
    return NextResponse.json(user)
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 401 })
  }
}
