import { HEIGHT, WIDGET_AUTH_URL, WIDTH } from './constants.js'
import { fetcher, urlWithParams } from './utils.js'
import type { AuthEvent, AuthResult, AuthWidgetOptions } from './types.js'

export class AuthWidget {
  #popup: Window | null
  #options: AuthWidgetOptions

  constructor({ requestAccess = 'write', ...options }: AuthWidgetOptions) {
    this.#options = { ...options, requestAccess }
  }

  auth(onComplete?: () => void): void {
    if (this.#popup) {
      this.#popup.focus()
      return
    }

    const left = Math.max(0, (screen.width - WIDTH) / 2)
    const top = Math.max(0, (screen.height - HEIGHT) / 2)
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
      `width=${WIDTH},height=${HEIGHT},left=${left},top=${top}`
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
      if (onComplete) {
        onComplete()
      }

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
        this.#getAuthData(onAuthDone)
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

  async #getAuthData(callback: (userData: AuthResult) => void): Promise<void> {
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
