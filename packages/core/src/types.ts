export interface TelegramUserData {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
}

export interface TelegramAuthData extends TelegramUserData {
  hash: string
}

export interface TelegramAuthEvent {
  event: 'auth_result'
  result: TelegramAuthData
}

export interface Popup {
  window: Window | null
  authFinished: boolean
}
