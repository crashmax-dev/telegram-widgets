import { AuthCallbackPage } from './callback'
import { HomePage } from './home'
import { NotFoundPage } from './not-found'
import { AuthRedirectPage } from './redirect'

export interface PageProps {
  title: string
  component: JSX.Element
}

export type Pages = 'notFound' | 'home' | 'callback' | 'redirect'

export const pages: Record<Pages, PageProps> = {
  notFound: {
    title: 'Page not found',
    component: <NotFoundPage />
  },
  home: {
    title: 'Log in with Telegram',
    component: <HomePage />
  },
  callback: {
    title: 'Autorization Type (callback)',
    component: <AuthCallbackPage />
  },
  redirect: {
    title: 'Autorization Type (redirect)',
    component: <AuthRedirectPage />
  }
}
