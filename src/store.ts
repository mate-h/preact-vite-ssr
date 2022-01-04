import type { Locals, PageContext } from './types'

// modules
import { save, State as S0, Events as E0 } from './save'
import { module as m1, State as S1, Events as E1 } from './todos/store'
import { module as m2, State as S2, Events as E2 } from './lib/synced-input'
import { module as m3, State as S3, Events as E3 } from './node/store'

export type State = Locals & S0 & S1 & S2 & S3

export type DefaultEvents = {
  "state.set": { path: StateKeys; value: any }
}

type Events = DefaultEvents & E0 & E1 & E2 & E3

const modules = [m1, m2, m3]

import { createStoreon, StoreonModule, StoreonStore } from 'storeon'
import { useStoreon } from 'storeon/preact'
import { set } from 'lodash'
import { persistState } from '@storeon/localstorage';
import {id} from './utils';

export type Module = StoreonModule<State, Events>

let store: StoreonStore<State, Events>

export function createStore(pageContext: PageContext) {
  const initModule: Module = (store) => {
    store.on('@init', (init) => {
      return { ...pageContext.pageProps, ...pageContext.locals }
    })
    store.on('@changed', (state) => {
      if (!import.meta.env.SSR) {
        ;(window as any).state = state
      }
    })
    store.on('@dispatch', (state, [event, data]) => {
      const skip: string[] = ['@init', '@changed', 'nodes.self']
      if (process.env.NODE_ENV === 'development' && !skip.includes(event)) {
        console.log(`[storeon] ${event}`)
      }
    })

    store.on('state.set', (state, { path, value }) => {
      return set(state, path, value)
    });
  }
  let m: Module[] = [initModule, ...modules, save(['todos'])]
  if (!import.meta.env.SSR) {
    const persistModule = persistState(['nodes', 'parent']);
    m = [persistModule, ...m]
  }
  store = createStoreon<State, Events>(m)
  return store
}

export type StateKeys = keyof State

export function useStore(...keys: StateKeys[]) {
  return useStoreon<State, Events>(...keys)
}
