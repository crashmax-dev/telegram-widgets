import crypto from 'node:crypto'
import { entries, omit } from '@zero-dependency/utils'
import { SECONDS_TO_EXPIRE } from '../constants.js'
import type { AuthData, User } from '../types.js'

export function checkAuthData(
  botToken: string,
  authData: AuthData,
  secondsToExpire = SECONDS_TO_EXPIRE
): User {
  const values = []

  for (const [key, value] of entries(authData)) {
    if (key !== 'hash') {
      values.push(`${key}=${value}`)
    }
  }

  const secret = crypto.createHash('sha256').update(botToken).digest()
  const sorted = values.sort().join('\n')
  const hash = crypto.createHmac('sha256', secret).update(sorted).digest('hex')

  if (authData.hash !== hash) {
    throw new Error('authData is invalid')
  }

  const unixTime = Math.floor(Date.now() / 1000)
  if (unixTime > authData.auth_date + secondsToExpire) {
    throw new Error('authData is outdated')
  }

  return omit(authData, ['hash'])
}
