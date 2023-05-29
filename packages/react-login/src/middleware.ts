import { AuthValidate } from '@telegram-widgets/login/auth-validate'
import type {
  AuthData,
  AuthValidateOptions,
  User
} from '@telegram-widgets/login'
import type { NextRequest } from 'next/server'

export class TelegramAuthMiddleware {
  private authValidate: AuthValidate

  constructor(options: AuthValidateOptions) {
    this.authValidate = new AuthValidate(options)
  }

  async use(request: NextRequest): Promise<User> {
    const authData: AuthData = await request.json()
    return await this.authValidate.validate(authData)
  }

  async withCookie(request: NextRequest, cookieName: string): Promise<User> {
    const cookieValue = request.cookies.get(cookieName)
    if (!cookieValue) throw new Error(`Cookie ${cookieName} not found`)
    return await this.authValidate.validate(JSON.parse(atob(cookieValue.value)))
  }
}
