import { useStore } from '@nanostores/react'
import { TelegramLoginWidget } from '@telegram-widgets/react-login'
import { atom } from 'nanostores'
import type { AuthWidgetOptions } from '@telegram-widgets/react-login'

const errorAtom = atom('')

const userAtom = atom<Record<string, string> | null>(null)

const optionsAtom = atom<AuthWidgetOptions>({
  botId: '2107099955',
  language: 'ru',
  requestAccess: 'write',
  autorizationType: 'redirect',
  redirectUrl: location.origin + '/redirect',
  onAuth(url) {
    userAtom.set(Object.fromEntries(url.searchParams))
  },
  onError(error) {
    errorAtom.set(error.message)
  }
})

export function AuthRedirectPage() {
  const user = useStore(userAtom)
  const options = useStore(optionsAtom)
  const error = useStore(errorAtom)

  return (
    <div>
      <TelegramLoginWidget options={options}>
        Log in with Telegram
      </TelegramLoginWidget>
      {error && <span>{error}</span>}
      {user && <pre>{JSON.stringify(user, null, 2)}</pre>}
    </div>
  )
}
