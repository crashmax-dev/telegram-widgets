export function parseUrlString(urlString: string) {
  const url = new URL(urlString)
  return new Map(url.searchParams.entries())
}
