import { debounce, get, PropertyPath, set } from 'lodash'
import { useEffect, useRef } from 'preact/hooks'
import { Module, State as S, StateKeys, useStore } from 'store'
import { flatten } from 'utils'
import { useSavedState } from '../save'

type Props = {
  keyPath: StateKeys
  id: string
  propPath: PropertyPath
}

export const module: Module = (store) => {
  store.on('@push', (state, event) => {
    // dispatch event on window
    window.dispatchEvent(new CustomEvent('@push', { detail: event }))
  })
  store.on('@set', (state, event) => {
    // dispatch event on window
    window.dispatchEvent(new CustomEvent('@set', { detail: { state, event } }))
  })
}

export type State = {}
export type Events = {}

export function SyncedInput({ id, keyPath, propPath }: Props) {
  const ref = useRef<HTMLInputElement>(null)
  const items = useStore(keyPath)[keyPath] as Record<string, any>
  const {dispatch, savedStates} = useStore("savedStates");
  const item = items[id]
  const k = Array.isArray(propPath) ? propPath.join('.') : (propPath as string)
  const val = flatten(item || {})[k]
  useEffect(() => {
    function listener(e: Event) {}
    function setListener(e: Event) {
      const { event, state } = (e as CustomEvent).detail as {
        event: { path: StateKeys; value: Record<string, any> }
        state: S
      }
      if (event.path === keyPath) {
        // only set value if it was not saving
        const val = flatten(event.value[id])[k];
        const stat = savedStates[keyPath][id];
        if (stat !== "saving") {
          ref.current!.value = val;
        }
      }
    }
    // listen to window event
    window.addEventListener('@push', listener)
    window.addEventListener('@set', setListener)
    return () => {
      window.removeEventListener('@push', listener)
      window.removeEventListener('@set', setListener)
    }
  }, [keyPath, id])
  const setValue = debounce((val: string) => dispatch("state.set", { path: keyPath, value: set(items, [id, k].join('.'), val) }), 500)
  function onChange(e: Event) {
    const val = (e.target as HTMLInputElement).value
    // start
    setValue(val)
  }
  return (
    <input
      value={import.meta.env.SSR ? val : undefined}
      ref={ref}
      type="text"
      class="input input-primary"
      onChange={onChange}
    />
  )
}
