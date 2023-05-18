import { TelegramAuthService } from '@telegram-widgets/core'

const botId = '2107099955'
const origin = 'telegram-widgets.com'

const authService = new TelegramAuthService({
  botId,
  origin
})

const authButton = document.querySelector('#auth-button')!
authButton.addEventListener('click', () => {
  authService.auth((user) => {
    console.log(user)
  })
})
