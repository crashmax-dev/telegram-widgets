import crypto from 'node:crypto'
import { entries, omit } from '@zero-dependency/utils'
import type { TelegramAuthData, TelegramUserData } from './types.js'

/**
 * Check Telegram user data
 * @param authData - Telegram user data
 * @param botToken - Telegram bot token
 */
export function checkAuth(
  authData: TelegramAuthData,
  botToken: string,
  secondsToExpire = 86400
): TelegramUserData {
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
    throw new Error('Auth data is not valid')
  }

  const unixTime = Math.floor(Date.now() / 1000)
  if (unixTime > authData.auth_date + secondsToExpire) {
    throw new Error('Auth data is outdated')
  }

  return omit(authData, ['hash'])
}
