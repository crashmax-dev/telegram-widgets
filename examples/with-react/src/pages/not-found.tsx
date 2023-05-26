import { getPagePath } from '@nanostores/router'
import { router } from '../router.js'

export function NotFoundPage() {
  return <a href={getPagePath(router, 'home')}>go to home</a>
}
