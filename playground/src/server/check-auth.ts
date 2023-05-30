import crypto from 'node:crypto'
import { AuthValidate } from '@telegram-widgets/login'
import { entries } from '@zero-dependency/utils'
import type { User } from '@telegram-widgets/login'

const mockUser = (id: number, offset: number): User => ({
  id,
  first_name: 'John',
  auth_date: Math.floor(Date.now() / 1000) - offset,
  hash: ''
})

function generateHash(botToken: string, authData: User): string {
  const values = []

  for (const [key, value] of entries(authData)) {
    if (key !== 'hash') {
      values.push(`${key}=${value}`)
    }
  }

  const secret = crypto.createHash('sha256').update(botToken).digest()
  console.log('secret:', secret.toString('hex'))
  const sorted = values.sort().join('\n')
  const hash = crypto.createHmac('sha256', secret).update(sorted).digest('hex')

  return hash
}

async function validAuth(): Promise<void> {
  try {
    const botToken = 'BOT_TOKEN'
    const user = mockUser(1, 290)
    const hash = generateHash(botToken, user)
    const authData = { ...user, hash }

    console.log('authData:', authData)
    const auth = new AuthValidate({
      botToken,
      secondsToExpire: 300
    })
    const userData = await auth.validate(authData)
    console.log('userData:', userData)
  } catch (err) {
    console.log((err as Error).message)
  }
}

async function outdatedAuth(): Promise<void> {
  try {
    const botToken = 'BOT_TOKEN'
    const user = mockUser(2, 310)
    const hash = generateHash(botToken, user)
    const authData = { ...user, hash }

    console.log('authData:', authData)
    const auth = new AuthValidate({
      botToken,
      secondsToExpire: 300
    })
    const userData = await auth.validate(authData)
    console.log('userData:', userData)
  } catch (err) {
    console.log((err as Error).message)
  }
}

async function invalidAuth(): Promise<void> {
  try {
    const user = mockUser(3, 300)
    const hash = generateHash('UNKNOWN_BOT_TOKEN', user)
    const authData = { ...user, hash }

    console.log('authData:', authData)
    const auth = new AuthValidate({
      botToken: 'BOT_TOKEN',
      secondsToExpire: 300
    })
    const userData = await auth.validate(authData)
    console.log('userData:', userData)
  } catch (err) {
    console.log((err as Error).message)
  }
}

console.log('=== Valid ===\n')
validAuth()
console.log('\n=== Outdated ===\n')
outdatedAuth()
console.log('\n=== Invalid ===\n')
invalidAuth()
