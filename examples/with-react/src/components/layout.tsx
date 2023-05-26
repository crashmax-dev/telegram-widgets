import { Header } from './header'

type LayoutProps = React.PropsWithChildren<{
  title: string
}>

export function Layout(props: LayoutProps) {
  return (
    <div>
      <h1>{props.title}</h1>
      <Header />
      {props.children}
    </div>
  )
}
