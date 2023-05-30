import { AuthValidate } from '@telegram-widgets/login/auth-validate'
import type { AuthValidateOptions, User } from '@telegram-widgets/login'
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'
import type { NextRequest, NextResponse } from 'next/server'

interface Cookie {
  cookieName: string
  secret: string
  cookieOptions: CookieOptions
}

type CookieOptions = Omit<Partial<ResponseCookie>, 'name' | 'value'>

export class TelegramAuthMiddleware {
  private authValidate: AuthValidate

  constructor(options: AuthValidateOptions) {
    this.authValidate = new AuthValidate(options)
  }

  async getSession(
    request: NextRequest,
    response: NextResponse,
    cookie: Cookie
  ) {}
}
