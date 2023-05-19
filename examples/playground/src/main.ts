import formatHighlight from '@crashmax/json-format-highlight'
import { AuthService } from '@telegram-widgets/core'
import { el } from '@zero-dependency/dom'
import './style.css'

const root = document.querySelector('#root')!

const loginButton = el(
  'button',
  {
    onclick(event) {
      event.preventDefault()
      authService.auth()
    }
  },
  'Login with Telegram'
)

const loginData = el('code')

const authService = new AuthService({
  botId: '2107099955',
  origin: 'telegram-widgets.com',
  language: 'en',
  requestAccess: false,
  autorizationType: 'redirect',
  redirectUrl: 'https://telegram-widgets.com/api/login',
  onError(error) {
    console.error(error)
  },
  onAuth(user) {
    loginData.innerHTML = formatHighlight(user, {
      tagPre: true,
      wordWrap: false,
      colors: {
        falseColor: '#f44747'
      }
    })
  }
})

root.append(loginButton, loginData)
