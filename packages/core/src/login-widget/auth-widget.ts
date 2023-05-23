import { fetcher } from '@zero-dependency/fetcher'
import { urlWithParams } from '../helpers/url-with-params.js'
import { WIDGET_AUTH_URL } from './constants.js'
import type { AuthEvent, AuthResult, User } from './types.js'

type RequestAccess = 'write'
type AutorizationType = 'callback' | 'redirect'

interface AuthWidgetOptions {
  botId: string
  origin?: string
  language?: string
  requestAccess?: RequestAccess
  autorizationType: AutorizationType
  onError: (error: Error) => void
}

interface CallbackAuthOptions extends AuthWidgetOptions {
  autorizationType: 'callback'
  onAuth: (user: User) => void
}

interface RedirectAuthOptions extends AuthWidgetOptions {
  autorizationType: 'redirect'
  redirectUrl: string
  onAuth: (url: URL) => void
}

type AuthWidgetOption = CallbackAuthOptions | RedirectAuthOptions

// TOOD: constants or options
const width = 550
const height = 470

export class AuthWidget {
  #popup: Window | null
  #options: CallbackAuthOptions | RedirectAuthOptions

  constructor({ requestAccess = 'write', ...options }: AuthWidgetOption) {
    this.#options = { ...options, requestAccess }
  }

  auth(): void {
    if (this.#popup) {
      this.#popup.focus()
      return
    }

    const left = Math.max(0, (screen.width - width) / 2)
    const top = Math.max(0, (screen.height - height) / 2)
    const origin =
      this.#options.origin ??
      (location.origin || location.protocol + '//' + location.hostname)

    const popupUrl = new URL('/auth', WIDGET_AUTH_URL)
    popupUrl.searchParams.set('bot_id', this.#options.botId)
    popupUrl.searchParams.set('origin', origin)
    popupUrl.searchParams.set('return_to', location.href)
    popupUrl.searchParams.set(
      'lang',
      this.#options.language ?? navigator.language
    )
    if (this.#options.requestAccess) {
      popupUrl.searchParams.set('request_access', this.#options.requestAccess)
    }

    this.#popup = window.open(
      popupUrl,
      '_blank',
      `width=${width},height=${height},left=${left},top=${top},status=0,location=0,menubar=0,toolbar=0,modal=1`
    )

    const onMessage = (event: MessageEvent) => {
      let data = {} as AuthEvent

      try {
        data = JSON.parse(event.data)
      } catch (err) {
        this.#options.onError(err as Error)
      }

      if (event.source !== this.#popup) return
      if (data.event === 'auth_result') {
        onAuthDone(data.result)
      }
    }

    const onAuthDone = (authResult?: AuthResult) => {
      this.#popup = null
      window.removeEventListener('message', onMessage)

      if (authResult?.error) {
        this.#options.onError(new Error(authResult.error))
      }

      if (!authResult?.user) return

      if (this.#options.autorizationType === 'redirect') {
        const url = urlWithParams(this.#options.redirectUrl, authResult.user)
        this.#options.onAuth(url)
      }

      if (this.#options.autorizationType === 'callback') {
        this.#options.onAuth(authResult.user)
      }
    }

    const checkClose = () => {
      if (!this.#popup || this.#popup.closed) {
        this.getAuthData(onAuthDone)
      } else {
        setTimeout(checkClose, 100)
      }
    }

    if (this.#popup) {
      window.addEventListener('message', onMessage)
      this.#popup.focus()
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
          body: new URLSearchParams({ bot_id: this.#options.botId })
        }
      )

      callback(response)
    } catch (err) {
      this.#options.onError(err as Error)
    }
  }
}
