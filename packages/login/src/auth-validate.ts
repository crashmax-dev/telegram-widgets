import { webcrypto } from 'node:crypto'
import { SECONDS_TO_EXPIRE } from './constants.js'
import { omit } from './utils.js'
import type { AuthData, AuthValidateOptions, User } from './types.js'

export class AuthValidate {
  #botToken: string
  #secondsToExpire: number
  #crypto: Crypto | webcrypto.Crypto
  #secretHash: ArrayBuffer | null = null

  constructor({
    botToken,
    secondsToExpire = SECONDS_TO_EXPIRE
  }: AuthValidateOptions) {
    this.#botToken = botToken
    this.#secondsToExpire = secondsToExpire

    if (globalThis.crypto) {
      this.#crypto = globalThis.crypto
    } else {
      import('node:crypto').then((module) => (this.#crypto = module.webcrypto))
    }
  }

  async #generateHash(input: string): Promise<string> {
    if (!this.#secretHash) {
      this.#secretHash = await this.#crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(this.#botToken)
      )
    }

    const key = await crypto.subtle.importKey(
      'raw',
      this.#secretHash,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )

    const msgUint8 = new TextEncoder().encode(input)
    const hashBuffer = await crypto.subtle.sign('HMAC', key, msgUint8)
    const hash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    return hash
  }

  async validate(authData: AuthData): Promise<User> {
    const user: User = omit(authData, ['hash'])
    const data = Object.entries(user)
      .map(([key, value]) => `${key}=${value}`)
      .sort()
      .join('\n')

    const hash = await this.#generateHash(data)
    if (authData.hash !== hash) {
      throw new Error('Auth data is invalid')
    }

    const unixTime = Math.floor(Date.now() / 1000)
    if (unixTime - authData.auth_date > this.#secondsToExpire) {
      throw new Error('Auth data is outdated')
    }

    return authData
  }
}
