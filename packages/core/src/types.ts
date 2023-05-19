export interface User {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
}

export interface AuthData extends User {
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
  user?: AuthData
}
