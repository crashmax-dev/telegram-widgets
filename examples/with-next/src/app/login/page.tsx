'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { TelegramLoginWidget } from '@telegram-widgets/react-login'
import type { User } from '@telegram-widgets/react-login'

export default function Home() {
  const router = useRouter()

  function goToUserPage() {
    router.push('/user')
  }

  async function onAuth(user: User): Promise<void> {
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(user)
    })

    const data = await response.json()
    console.log(data)
    if (response.ok) {
      goToUserPage()
    }
  }

  useEffect(() => {
    const request = async () => {
      const response = await fetch('/api/user')
      if (response.ok) {
        goToUserPage()
      }
    }

    request()
  }, [])

  return (
    <TelegramLoginWidget
      options={{
        botId: process.env['NEXT_PUBLIC_BOT_ID']!,
        language: 'ru',
        requestAccess: 'write',
        autorizationType: 'callback',
        onAuth,
        onError(error) {
          console.error(error.message)
        }
      }}
    >
      Log in with Telegram
    </TelegramLoginWidget>
  )
}
