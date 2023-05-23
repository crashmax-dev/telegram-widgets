import crypto from 'node:crypto'
import { omit } from '@zero-dependency/utils'
import { SECONDS_TO_EXPIRE } from './constants.js'
import type { AuthData, User } from './types.js'

interface AuthValidateOptions {
  botToken: string

  /**
   * @default 86400 (24 hours)
   */
  secondsToExpire?: number
}

export class AuthValidate {
  #secret: Buffer
  #secondsToExpire: number

  constructor({
    botToken,
    secondsToExpire = SECONDS_TO_EXPIRE
  }: AuthValidateOptions) {
    this.#secret = crypto.createHash('sha256').update(botToken).digest()
    this.#secondsToExpire = secondsToExpire
  }

  validate(authData: AuthData): User {
    const user: User = omit(authData, ['hash'])
    const data = Object.entries(user)
      .map(([key, value]) => `${key}=${value}`)
      .sort()
      .join('\n')

    const hash = crypto
      .createHmac('sha256', this.#secret)
      .update(data)
      .digest('hex')

    if (authData.hash !== hash) {
      throw new Error('Auth data is invalid')
    }

    const unixTime = Math.floor(Date.now() / 1000)
    if (unixTime - authData.auth_date > this.#secondsToExpire) {
      throw new Error('Auth data is outdated')
    }

    return user
  }
}
