import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { lazy } from 'react'
import { ColorSchemeScript, MantineProvider } from '@mantine/core'

const TanStackDevtools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/react-devtools').then((m) => ({ default: m.TanStackDevtools })),
    )
  : () => null

const TanStackRouterDevtoolsPanel = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/react-router-devtools').then((m) => ({ default: m.TanStackRouterDevtoolsPanel })),
    )
  : () => null
import { AppLayout } from '../components/AppLayout'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Poem Generator' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  component: RootLayout,
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
        <HeadContent />
      </head>
      <body>
        {children}
        <TanStackDevtools
          config={{ position: 'bottom-right' }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}

function RootLayout() {
  return (
    <MantineProvider defaultColorScheme="light">
      <AppLayout>
        <Outlet />
      </AppLayout>
    </MantineProvider>
  )
}
