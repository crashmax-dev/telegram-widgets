import { NextResponse } from 'next/server'
import { checkCookie } from '@/libs/telegram'
import type { NextRequest } from 'next/server'

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith('/user')) {
    return NextResponse.next()
  }

  try {
    const user = await checkCookie(request)
    return NextResponse.next()
  } catch (err) {
    request.cookies.delete('user')
    return NextResponse.redirect(new URL('/login', request.url))
  }
}
