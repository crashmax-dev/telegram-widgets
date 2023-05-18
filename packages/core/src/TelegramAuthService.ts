import { fetcher } from '@zero-dependency/fetcher'
import { WIDGET_AUTH_URL } from './constants.js'
import type { Popup, TelegramAuthEvent, TelegramUserData } from './types.js'

interface TelegramAuthServiceOptions {
  botId: string
  requestAccess?: boolean
  origin?: string
}

export class TelegramAuthService {
  popup: Popup
  #options: TelegramAuthServiceOptions

  constructor(options: TelegramAuthServiceOptions) {
    this.#options = options
    this.popup = {
      window: null,
      authFinished: false
    }
  }

  auth(callback: (user: TelegramUserData) => void) {
    // TODO:
    // setLoading(true)

    const width = 550
    const height = 470
    const left = Math.max(0, (screen.width - width) / 2)
    const top = Math.max(0, (screen.height - height) / 2)
    const origin =
      this.#options.origin ??
      (location.origin || location.protocol + '//' + location.hostname)

    const popupUrl = new URL('/auth', WIDGET_AUTH_URL)
    popupUrl.searchParams.set('bot_id', this.#options.botId)
    popupUrl.searchParams.set('origin', origin)
    popupUrl.searchParams.set('return_to', location.href)
    if (this.#options.requestAccess) {
      popupUrl.searchParams.set('request_access', 'true')
    }

    const popup = window.open(
      popupUrl,
      '_blank',
      `width=${width},height=${height},left=${left},top=${top},status=0,location=0,menubar=0,toolbar=0`
    )

    this.popup = {
      window: popup,
      authFinished: false
    }

    const onMessage = (event: MessageEvent) => {
      let data = {} as TelegramAuthEvent

      try {
        data = JSON.parse(event.data)
      } catch (err) {
        console.error(err)
      }

      if (event.source !== this.popup.window) return
      if (data.event === 'auth_result') {
        onAuthDone(data.result)
      }
    }

    const onAuthDone = (userData: TelegramUserData) => {
      if (this.popup.authFinished) return
      this.popup.authFinished = true

      // TODO:
      // onAuthCallbackURL(origin, userData)
      // function onAuthCallbackURL(base: string, userData: TelegramUserData): URL {
      //   const url = new URL(base)
      //   for (var [key, value] of entries(userData)) {
      //     url.searchParams.append(key, encodeURIComponent(value!))
      //   }
      //   location.href = url.href
      // }

      callback(userData)
      window.removeEventListener('message', onMessage)
    }

    const checkClose = () => {
      if (!this.popup.window || this.popup.window.closed) {
        // TODO:
        // setLoading(false)
        this.getAuthData(onAuthDone)
      } else {
        setTimeout(checkClose, 100, this.#options.botId)
      }
    }

    if (popup) {
      window.addEventListener('message', onMessage)
      popup.focus()
      checkClose()
    }
  }

  private async getAuthData(callback: (userData: TelegramUserData) => void) {
    try {
      const response = await fetcher<TelegramUserData>(
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
      console.error(err)
    }
  }
}
