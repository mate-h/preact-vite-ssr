import type { PageContext, PageProps } from './types'

type ServerState = {
  pageContext: PageContext
  pageProps: PageProps
}

// modules
import { module as m1, State as S1, Events as E1 } from './todos/store'
import { save, State as S2, Events as E2 } from './save'

type State = ServerState & S1 & S2

type Events = E1 & E2

const modules = [m1]

import { createStoreon, StoreonModule, StoreonStore } from 'storeon'
import { useStoreon } from 'storeon/preact'

export type Module = StoreonModule<State & ServerState, Events>

let store: StoreonStore<State, Events>

export function createStore(pageContext: PageContext) {
  const initModule: Module = (store) => {
    store.on('@init', (init) => {
      return { pageContext, pageProps: pageContext.pageProps || {} }
    })
    store.on('@changed', (state) => {
      if (!import.meta.env.SSR) {
        ;(window as any).state = state
      }
    })
  }
  store = createStoreon<State, Events>([
    initModule,
    ...modules,
    save(['todos']),
  ])
  return store
}

export type StateKeys = keyof State

export function useStore(...keys: StateKeys[]) {
  return useStoreon<State, Events>(...keys)
}
