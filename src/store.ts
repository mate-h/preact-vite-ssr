import type { PageContext, PageProps } from './types'

type ServerState = {
  pageContext: PageContext
  pageProps: PageProps
}

type ClientState = {
  id: string
}

// modules
import { module as m1, State as S1, Events as E1 } from './todos/store'
import { save, State as S2, Events as E2 } from './save'

type State = ServerState & ClientState & S1 & S2

type Events = E1 & E2

const modules = [m1]

import { createStoreon, StoreonModule, StoreonStore } from 'storeon'
import { useStoreon } from 'storeon/preact'
import { persistState } from '@storeon/localstorage'
import { id } from './utils'

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
    store.on('@dispatch', (state, [event, data]) => {
      const skip: string[] = ["@init", "@changed"];
      if (process.env.NODE_ENV === "development" && !skip.includes(event)) {
      console.log(`[storeon] ${ event }`)
      }
    })
  }
  const clientModule: Module = (store) => {
    store.on('@init', (init) => {
      const uid = id()
      return { id: uid }
    })
  }
  let m: Module[] = []
  if (!import.meta.env.SSR) {
    m = m.concat(clientModule, persistState(['id']))
  }
  m = m.concat(initModule, ...modules, save(['todos']))
  store = createStoreon<State, Events>(m)
  return store
}

export type StateKeys = keyof State

export function useStore(...keys: StateKeys[]) {
  return useStoreon<State, Events>(...keys)
}
