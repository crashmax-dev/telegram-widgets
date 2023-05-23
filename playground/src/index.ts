import formatHighlight from '@crashmax/json-format-highlight'
import { AuthWidget } from '@telegram-widgets/core/login-widget'
import { el } from '@zero-dependency/dom'
import './style.css'

const botId = '2107099955'
const root = document.querySelector('#root')!
const container = el('div', {
  className: 'container'
})

const callbackButton = el(
  'button',
  {
    onclick(event) {
      event.preventDefault()
      authCallback.auth()
    }
  },
  'Log in with Telegram (callback)'
)

const redirectButton = el(
  'button',
  {
    onclick(event) {
      event.preventDefault()
      authRedirect.auth()
    }
  },
  'Log in with Telegram (redirect)'
)

const loginData = el('code')

const authCallback = new AuthWidget({
  botId,
  language: 'en',
  requestAccess: 'write',
  autorizationType: 'callback',
  onAuth(user) {
    loginData.innerHTML = formatHighlight(user, {
      tagPre: true,
      wordWrap: false,
      colors: {
        falseColor: '#f44747'
      }
    })
  },
  onError(error) {
    console.error(error)
  }
})

const authRedirect = new AuthWidget({
  botId,
  language: 'ru',
  autorizationType: 'redirect',
  redirectUrl: location.origin,
  onAuth(url) {
    history.pushState(null, '', url)
  },
  onError(error) {
    console.error(error)
  }
})

container.append(callbackButton, redirectButton, loginData)
root.appendChild(container)
