import { entries } from '@zero-dependency/utils'
import type { User } from '../types.js'

export function callbackUrl(redirectUrl: string, userData: User): URL {
  const url = new URL(redirectUrl)

  for (var [key, value] of entries(userData)) {
    url.searchParams.append(key, encodeURIComponent(value!))
  }

  return url
}
