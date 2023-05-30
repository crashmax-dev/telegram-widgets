import { AuthValidate } from '@telegram-widgets/login/auth-validate'
import type { AuthValidateOptions, User } from '@telegram-widgets/login'
import type { AuthCrypto } from '@telegram-widgets/login/auth-crypto'
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'
import type { NextRequest } from 'next/server'

type CookieOptions = Pick<ResponseCookie, 'name'>

export class TelegramAuthMiddleware {
  private authCrypto?: AuthCrypto
  private authValidate: AuthValidate

  constructor(options: AuthValidateOptions, authCrypto?: AuthCrypto) {
    this.authCrypto = authCrypto
    this.authValidate = new AuthValidate(options)
  }

  async getSession(
    request: NextRequest,
    cookieOptions: CookieOptions
  ): Promise<User> {
    if (!this.authCrypto) {
      throw new Error('AuthCrypto is not defined')
    }

    const requestCookie = request.cookies.get(cookieOptions.name)
    if (!requestCookie?.value) {
      throw new Error(`Cookie "${cookieOptions.name}" is not found`)
    }

    const decryptedCookieValue = await this.authCrypto.decryptData(
      requestCookie.value
    )
    if (!decryptedCookieValue) {
      throw new Error(`Cookie "${cookieOptions.name}" is not decrypted`)
    }

    return JSON.parse(decryptedCookieValue)
  }
}
