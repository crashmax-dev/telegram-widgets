import { NextResponse } from 'next/server'
import { authValidate } from '@/libs/telegram'
import type { NextRequest } from 'next/server'

export default async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/user')) {
    return NextResponse.next()
  }

  try {
    const session = request.cookies.get('user')
    console.log(session)
    const user = await authValidate.getSession(request, { name: 'user' })
    console.log('session', user)
    return NextResponse.next()
  } catch (err) {
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('user')
    return response
  }
}
