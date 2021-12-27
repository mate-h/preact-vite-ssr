import type { VNode } from 'preact'
import type { User } from 'firebase/auth'

export type PageProps = {
  user?: User
}
// The `pageContext` that are available in both on the server-side and browser-side
export type PageContext = {
  Page: (pageProps: PageProps) => VNode
  pageProps: PageProps
  urlPathname: string
  documentProps?: {
    title?: string
    description?: string
  }
}
