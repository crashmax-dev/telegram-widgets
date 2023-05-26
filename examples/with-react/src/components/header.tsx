import { getPagePath } from '@nanostores/router'
import { router } from '../router'

export function Header() {
  return (
    <header>
      <ul>
        <li>
          <a href={getPagePath(router, 'home')}>home</a>
        </li>
        <li>
          <a href={getPagePath(router, 'callback')}>callback</a>
        </li>
        <li>
          <a href={getPagePath(router, 'redirect')}>redirect</a>
        </li>
      </ul>
    </header>
  )
}
