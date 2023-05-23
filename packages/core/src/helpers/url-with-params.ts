import { entries } from '@zero-dependency/utils'

export function urlWithParams<T extends Record<string, any>>(
  origin: string,
  params: T
): URL {
  const url = new URL(origin)

  for (var [key, value] of entries(params)) {
    url.searchParams.set(key, encodeURIComponent(value))
  }

  return url
}
