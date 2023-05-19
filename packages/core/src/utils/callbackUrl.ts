import { entries } from '@zero-dependency/utils'
import type { User } from '../types.js'

export function callbackUrl(origin: string, path: string, userData: User): URL {
  const url = new URL(path, origin)

  for (var [key, value] of entries(userData)) {
    url.searchParams.append(key, encodeURIComponent(value!))
  }

  return url
}
