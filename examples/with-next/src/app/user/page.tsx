import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { User } from '@telegram-widgets/react-login'

async function getUser(): Promise<User> {
  const cookieValue = cookies().get('user')
  if (!cookieValue) {
    redirect('/')
  }

  const user = JSON.parse(atob(cookieValue.value))
  return user
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
