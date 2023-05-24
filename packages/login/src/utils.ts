export type Keys<T> = Extract<keyof T, string>
export type Values<T> = T[keyof T]
export type Entries<T> = [Keys<T>, Values<T>][]
export type Plain<T> = T extends (...a: any[]) => any
  ? T
  : T extends new (...a: any[]) => any
  ? T
  : T extends object
  ? {
      [Key in keyof T]: T[Key]
    }
  : T

/**
 * Get entries of an object
 * @param obj object to get entries from
 * @returns entries of the object
 */
export function entries<T extends object>(obj: T): Entries<T> {
  return Object.entries(obj) as Entries<T>
}

/**
 * Omit keys from an object
 * @param target object to omit keys from
 * @param keys keys to omit
 * @returns new object without omitted keys
 */
export function omit<T, K extends keyof T>(
  target: T,
  keys: Array<K>
): Plain<Omit<T, K>> {
  const result: any = {}
  for (const key in target) {
    if (!keys.includes(key as any)) {
      result[key] = target[key]
    }
  }
  return result
}

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

export async function fetcher<T = unknown>(
  ...args: Parameters<typeof fetch>
): Promise<T> {
  const response = await fetch(...args)
  const data = await response.json()
  return data
}
