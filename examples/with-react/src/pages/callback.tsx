import { persistentAtom } from '@nanostores/persistent'
import { useStore } from '@nanostores/react'
import { TelegramLoginWidget } from '@telegram-widgets/react-login'
import { atom } from 'nanostores'
import type { AuthWidgetOptions, User } from '@telegram-widgets/react-login'

const userAtom = persistentAtom<User>('user', {} as User, {
  encode(value) {
    return JSON.stringify(value)
  },
  decode(value) {
    try {
      return JSON.parse(value)
    } catch {
      return {}
    }
  }
})

const errorAtom = atom('')

const optionsAtom = atom<AuthWidgetOptions>({
  botId: '2107099955',
  language: 'en',
  requestAccess: 'write',
  autorizationType: 'callback',
  onAuth(user) {
    if (errorAtom.value) {
      errorAtom.set('')
    }
    userAtom.set(user)
  },
  onError(error) {
    errorAtom.set(error.message)
  }
})

export function AuthCallbackPage() {
  const error = useStore(errorAtom)
  const options = useStore(optionsAtom)
  const user = useStore(userAtom)

  return (
    <div>
      <TelegramLoginWidget options={options}>
        Log in with Telegram
      </TelegramLoginWidget>
      {error && <span>{error}</span>}
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  )
}
