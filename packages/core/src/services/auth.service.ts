import { fetcher, FetcherError } from '@zero-dependency/fetcher'
import { WIDGET_AUTH_URL } from '../constants.js'
import { callbackUrl } from '../utils/callbackUrl.js'
import type { AuthEvent, AuthResult, User } from '../types.js'

type RequestAccess = 'write'
type AutorizationType = 'callback' | 'redirect'

interface AuthServiceOptions {
  botId: string
  onAuth: (data: User | URL) => void
  onError: (data: AuthResult) => void
  autorizationType: AutorizationType
  redirectUrl?: string
  language?: string
  requestAccess?: RequestAccess
  origin?: string
}

export class AuthService {
  private popup: Window | null
  private options: AuthServiceOptions

  constructor({ requestAccess = 'write', ...options }: AuthServiceOptions) {
    this.options = { ...options, requestAccess }
  }

  auth(): void {
    if (this.popup) {
      this.popup.focus()
      return
    }

    const width = 550
    const height = 470
    const left = Math.max(0, (screen.width - width) / 2)
    const top = Math.max(0, (screen.height - height) / 2)
    const origin =
      this.options.origin ??
      (location.origin || location.protocol + '//' + location.hostname)

    const popupUrl = new URL('/auth', WIDGET_AUTH_URL)
    popupUrl.searchParams.set('bot_id', this.options.botId)
    popupUrl.searchParams.set('origin', origin)
    popupUrl.searchParams.set('return_to', location.href)
    popupUrl.searchParams.set(
      'lang',
      this.options.language ?? navigator.language
    )
    if (this.options.requestAccess) {
      popupUrl.searchParams.set('request_access', this.options.requestAccess)
    }

    this.popup = window.open(
      popupUrl,
      '_blank',
      `width=${width},height=${height},left=${left},top=${top},status=0,location=0,menubar=0,toolbar=0`
    )

    const onMessage = (event: MessageEvent) => {
      let data = {} as AuthEvent

      try {
        data = JSON.parse(event.data)
      } catch (err) {
        this.options.onError({ error: 'JSON parse error' })
      }

      if (event.source !== this.popup) return
      if (data.event === 'auth_result') {
        onAuthDone(data.result)
      }
    }

    const onAuthDone = (authResult?: AuthResult) => {
      this.popup = null
      window.removeEventListener('message', onMessage)

      if (authResult?.error) {
        this.options.onError(authResult)
      }

      if (!authResult?.user) return

      if (
        this.options.redirectUrl &&
        this.options.autorizationType === 'redirect'
      ) {
        const url = callbackUrl(this.options.redirectUrl, authResult.user)
        this.options.onAuth(url)
      }

      if (this.options.autorizationType === 'callback') {
        this.options.onAuth(authResult.user)
      }
    }

    const checkClose = () => {
      if (!this.popup || this.popup.closed) {
        this.getAuthData(onAuthDone)
      } else {
        setTimeout(checkClose, 100)
      }
    }

    if (this.popup) {
      window.addEventListener('message', onMessage)
      this.popup.focus()
      checkClose()
    }
  }

  private async getAuthData(
    callback: (userData: AuthResult) => void
  ): Promise<void> {
    try {
      const response = await fetcher<AuthResult>(
        WIDGET_AUTH_URL + '/auth/get',
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: new URLSearchParams({ bot_id: this.options.botId })
        }
      )

      callback(response)
    } catch (err) {
      if (err instanceof FetcherError) {
        callback({ error: err.message })
      } else {
        callback({ error: 'Unknown error' })
      }
    }
  }
}
