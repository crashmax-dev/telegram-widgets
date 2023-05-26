import React from 'react'
import { AuthWidget } from '@telegram-widgets/login/auth-widget'
import { icons } from './icons.js'
import type { AuthWidgetOptions, User } from '@telegram-widgets/login'

type TelegramLoginWidgetProps = React.PropsWithChildren<{
  options: AuthWidgetOptions
}>

export type { User, AuthWidgetOptions, TelegramLoginWidgetProps }

export function TelegramLoginWidget(props: TelegramLoginWidgetProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const Icon = isLoading ? icons.loading : icons.telegram
  const authWidget = React.useMemo(() => new AuthWidget(props.options), [])

  return (
    <button
      onClick={() => {
        authWidget.auth(() => setIsLoading(false))
        setIsLoading(true)
      }}
      style={{
        outline: 'none',
        border: 'none',
        paddingLeft: '1rem',
        paddingRight: '1rem',
        paddingTop: '0.5rem',
        paddingBottom: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.5rem 1rem 0.5rem 1rem',
        fontSize: '16px',
        borderRadius: '999px',
        fontFamily: 'system-ui',
        userSelect: 'none',
        cursor: 'pointer',
        color: '#FFFFFF',
        backgroundColor: '#54A9EB'
      }}
    >
      <Icon />
      {props.children}
    </button>
  )
}
