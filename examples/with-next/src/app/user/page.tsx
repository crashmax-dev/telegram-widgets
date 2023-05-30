import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { authCrypto } from '@/libs/telegram'
import type { User } from '@telegram-widgets/react-login'

async function getUser(): Promise<User> {
  const requestCookie = cookies().get('user')
  if (!requestCookie) {
    redirect('/')
  }

  const user = await authCrypto.decryptData(requestCookie.value)
  if (!user) {
    redirect('/')
  }

  return JSON.parse(user)
}

export default async function UserPage() {
  const user = await getUser()

  return (
    <div>
      <h1>User</h1>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  )
}
