import { hydrate as preactHydrate } from 'preact-iso'
import { getPage } from 'vite-plugin-ssr/client'
import { Layout } from './layout'
import type { PageContext } from './types'
import type { PageContextBuiltInClient } from 'vite-plugin-ssr/client'
import 'virtual:windi.css'
import './layout.css'

hydrate()

async function hydrate() {
  // We do Server Routing, but we can also do Client Routing by using `useClientRouter()`
  // instead of `getPage()`, see https://vite-plugin-ssr.com/useClientRouter
  const pageContext = await getPage<PageContextBuiltInClient & PageContext>()
  const { Page, pageProps } = pageContext
  preactHydrate(
    <Layout pageContext={pageContext}>
      <Page {...pageProps} />
    </Layout>,
    document.getElementById('page-view')!
  )
}
