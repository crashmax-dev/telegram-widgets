import { NextRequest } from 'next/server'
import { TelegramAuthMiddleware } from '@telegram-widgets/react-login/middleware'

const authValidate = new TelegramAuthMiddleware({
  botToken: process.env['BOT_TOKEN']!
})

export async function checkCookie(request: NextRequest) {
  return await authValidate.withCookie(request, 'user')
}

export async function checkBody(request: NextRequest) {
  return await authValidate.use(request)
}
