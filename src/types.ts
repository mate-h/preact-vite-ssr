import type { VNode } from 'preact'
import type { User } from 'firebase/auth'
import type { State } from 'store'
import type { CLDR, Locale } from '@phensley/cldr'
import type { Request, Response } from 'express'

export type PageProps = Partial<State>
// The `pageContext` that are available in both on the server-side and browser-side
export type PageContext = {
  Page: (pageProps: PageProps) => VNode
  pageProps: PageProps
  urlPathname: string
  locals: Locals
  documentProps?: {
    title?: string
    description?: string
  }
}

type ColorTheme = {
  primary: string
  surface: string
  background: string
}

export type Locals = {
  user?: User
  locale: Locale
  theme: ColorTheme
  cldr: CLDR
  clientId: string
}

export type Req<T> = Request<any, any, T>
export type Res<T> = Response<T, Locals>
