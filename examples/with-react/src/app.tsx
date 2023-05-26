import { useStore } from '@nanostores/react'
import { Layout } from './components/layout'
import { pages } from './pages'
import { router } from './router'
import type { PageProps } from './pages'

export function App() {
  const page = useStore(router)

  let pageProps: PageProps
  if (!page) {
    pageProps = pages.notFound
  } else {
    pageProps = pages[page.route]
  }

  return <Layout title={pageProps.title}>{pageProps.component}</Layout>
}
