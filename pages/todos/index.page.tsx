import { debounce, omit, set } from 'lodash'
import { useState } from 'preact/hooks'
import { useStore } from 'store'
import { SyncedInput } from 'lib/synced-input'
import { id } from 'utils'

export { Page }

function Page() {
  const { dispatch, todos } = useStore('todos')
  const [text, setText] = useState('')
  function add() {
    if (!text) return
    const uid = id()
    dispatch(
      'todos.set',
      set(todos, uid, {
        id: uid,
        name: text,
        done: false,
      })
    )
    setText('')
  }
  return (
    <>
      <h1>Todos</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          add()
        }}
        class="flex"
      >
        <input
          placeholder="Todo name"
          type="text"
          class="input input-primary"
          value={text}
          onInput={(e) => setText((e.target as HTMLInputElement).value)}
        />
        <button type="submit" onClick={add} class="btn btn-primary ml-4">
          Add Todo
        </button>
      </form>
      <ul class="mt-6">
        {Object.values(todos || {}).map((todo) => {
          return (
            <li key={todo.id} class="flex items-center">
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() =>
                  dispatch(
                    'todos.set',
                    set(todos, [todo.id, 'done'], !todo.done)
                  )
                }
              />
              <SyncedInput keyPath="todos" id={todo.id} propPath={['name']} />
              <button
                onClick={() => {
                  if (confirm('are you sure?')) {
                    dispatch('todos.set', omit(todos, todo.id))
                  }
                }}
                class="btn"
              >
                Remove
              </button>
            </li>
          )
        })}
      </ul>
    </>
  )
}
