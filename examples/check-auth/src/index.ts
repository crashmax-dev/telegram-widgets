import crypto from 'node:crypto'
import { checkAuth } from '@telegram-widgets/core'
import { entries } from '@zero-dependency/utils'
import type { TelegramAuthData } from '@telegram-widgets/core'

const mockUserData = (id: number) => ({
  id,
  first_name: 'John',
  auth_date: Math.floor(Date.now() / 1000) - 86400,
  hash: ''
})

function generateHash(botToken: string, authData: TelegramAuthData): string {
  const values = []

  for (const [key, value] of entries(authData)) {
    if (key !== 'hash') {
      values.push(`${key}=${value}`)
    }
  }

  const secret = crypto.createHash('sha256').update(botToken).digest()
  const sorted = values.sort().join('\n')
  const hash = crypto.createHmac('sha256', secret).update(sorted).digest('hex')

  return hash
}

const user = mockUserData(1)
const hash = generateHash('BOT_TOKEN', user)
console.log('Hash:', hash)

try {
  const userData = checkAuth({ ...user, hash }, 'BOT_TOKEN')
  console.log(userData)
} catch (err) {
  console.log(err)
}
