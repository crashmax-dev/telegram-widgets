import { AuthCrypto } from '@telegram-widgets/login/auth-crypto'
import { TelegramAuthMiddleware } from '@telegram-widgets/react-login/middleware'

function getCrypto(): Crypto {
  if (typeof globalThis.crypto?.subtle === 'object') return globalThis.crypto
  // @ts-ignore crypto.webcrypto is not available in dom, but is there in newer node versions
  if (typeof globalThis.crypto?.webcrypto?.subtle === 'object')
    // @ts-ignore same as above
    return globalThis.crypto.webcrypto
  throw new Error(
    'no native implementation of WebCrypto is available in current context'
  )
}

const crypto = getCrypto()
export const authCrypto = new AuthCrypto(
  crypto,
  process.env['SECRET_PASSWORD']!
)
export const authValidate = new TelegramAuthMiddleware(
  {
    botToken: process.env['BOT_TOKEN']!
  },
  authCrypto
)
