import { getPagePath } from '@nanostores/router'
import { Pages } from '../pages/index.jsx'
import { router } from '../router'

export function Header() {
  return (
    <header>
      <ul>
        {router.routes.map(([pathname], key) => (
          <li key={key}>
            <a
              href={getPagePath(
                router,
                pathname as unknown as Exclude<Pages, 'notFound'>
              )}
            >
              {pathname}
            </a>
          </li>
        ))}
      </ul>
    </header>
  )
}
