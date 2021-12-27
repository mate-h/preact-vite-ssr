import logo from './logo.svg'
import { PageContextProvider } from './usePageContext'
import type { PageContext } from './types'
import { Link } from './link'
import type { ComponentChildren } from 'preact'
import 'virtual:windi.css'

export { Layout }

function Layout({
  children,
  pageContext,
}: {
  children: ComponentChildren
  pageContext: PageContext
}) {
  return (
    <PageContextProvider pageContext={pageContext}>
      <div class="flex mx-auto max-w-4xl">
        <aside class="flex flex-col p-6 items-center leading-7">
          <Logo />
          <Link className="navitem" href="/">
            Home
          </Link>
          <Link className="navitem" href="/signin">
            Sign In
          </Link>
          <Link className="navitem" href="/about">
            About
          </Link>
        </aside>
        <main class="p-6 min-h-screen border-l border-gray-200 flex-grow">{children}</main>
      </div>
    </PageContextProvider>
  )
}

function Logo() {
  return (
    <div
      style={{
        marginTop: 20,
        marginBottom: 10,
      }}
    >
      <a href="/">
        <img src={logo} height={64} width={64} alt="logo" />
      </a>
    </div>
  )
}
