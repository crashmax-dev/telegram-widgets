import { SECONDS_TO_EXPIRE } from './constants.js'
import { omit } from './utils.js'
import type { AuthValidateOptions, User } from './types.js'

export class AuthValidate {
  #botToken: string
  #secondsToExpire: number
  #encoder: TextEncoder
  #crypto: Crypto

  constructor({
    botToken,
    secondsToExpire = SECONDS_TO_EXPIRE
  }: AuthValidateOptions) {
    this.#botToken = botToken
    this.#secondsToExpire = secondsToExpire
    this.#encoder = new TextEncoder()

    if (globalThis.crypto) {
      this.#crypto = globalThis.crypto
    } else {
      // TODO:
      // import('node:crypto').then(
      //   (module) => (this.#crypto = module.webcrypto as Crypto)
      // )
    }
  }

  async #generateHash(input: string): Promise<string> {
    const secretHash = await this.#crypto.subtle.digest(
      'SHA-256',
      this.#encoder.encode(this.#botToken)
    )

    const key = await crypto.subtle.importKey(
      'raw',
      secretHash,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )

    const hashBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      this.#encoder.encode(input)
    )

    const hash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    return hash
  }

  async validate(authData: User): Promise<User> {
    const user = omit(authData, ['hash'])
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
