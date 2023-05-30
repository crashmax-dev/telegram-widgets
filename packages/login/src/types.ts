export interface User {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

export interface AuthEvent {
  event: 'auth_result'
  result: AuthResult
}

export interface AuthResult {
  html?: string
  origin?: string
  error?: string
  user?: User
}

export interface AuthValidateOptions {
  botToken: string

  /**
   * @default 86400 (24 hours)
   */
  secondsToExpire?: number
}

export type RequestAccess = 'write'
export type AutorizationType = 'callback' | 'redirect'

export interface AuthWidgetBaseOptions {
  botId: string
  origin?: string
  language?: string
  requestAccess?: RequestAccess
  autorizationType: AutorizationType
  onError: (error: Error) => void
}

export interface CallbackAuthOptions extends AuthWidgetBaseOptions {
  autorizationType: 'callback'
  onAuth: (user: User) => void
}

export interface RedirectAuthOptions extends AuthWidgetBaseOptions {
  autorizationType: 'redirect'
  redirectUrl: string
  onAuth: (url: URL) => void
}

export type AuthWidgetOptions = CallbackAuthOptions | RedirectAuthOptions
