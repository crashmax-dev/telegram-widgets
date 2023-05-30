import { entries } from '@zero-dependency/utils'
import type { User } from '@telegram-widgets/login'

const botToken = 'BOT_TOKEN'

async function getCrypto(): Promise<Crypto> {
  if (globalThis.crypto) {
    return globalThis.crypto
  }

  return (await import('node:crypto')).webcrypto as Crypto
}

async function sha256(input: string): Promise<ArrayBuffer> {
  const msgUint8 = new TextEncoder().encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8)
  return hashBuffer
}

async function hmacSha256(
  secret: ArrayBuffer,
  input: string
): Promise<ArrayBuffer> {
  const key = await crypto.subtle.importKey(
    'raw',
    secret,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const msgUint8 = new TextEncoder().encode(input)
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, msgUint8)
  return signatureBuffer
}

const mockUser = (id: number, offset: number): User => ({
  id,
  first_name: 'John',
  auth_date: Math.floor(Date.now() / 1000) - offset,
  hash: ''
})

async function checkUser(authData: User): Promise<User> {
  const values = []

  for (const [key, value] of entries(authData)) {
    if (key !== 'hash') {
      values.push(`${key}=${value}`)
    }
  }

  const secret = await sha256(botToken)
  const sorted = values.sort().join('\n')
  const hashBuffer = await hmacSha256(secret, sorted)
  const hash = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  console.log(authData.hash, hash)

  if (authData.hash !== hash) {
    throw new Error('Auth data is invalid')
  }

  return authData
}

async function generateHash(authData: User): Promise<User> {
  const values = []

  for (const [key, value] of entries(authData)) {
    if (key !== 'hash') {
      values.push(`${key}=${value}`)
    }
  }

  const secret = await sha256(botToken)
  const sorted = values.sort().join('\n')
  const hashBuffer = await hmacSha256(secret, sorted)
  const hash = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  authData.hash = hash
  return authData
}

try {
  const user = await generateHash(mockUser(1, 300))
  const authData = await checkUser(user)
  console.log(authData)
} catch (err) {
  console.log(err)
}
