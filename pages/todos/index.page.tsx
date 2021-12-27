import { set } from 'lodash'
import { useState } from 'preact/hooks'
import { useStore } from 'store'
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
      <div class="flex">
        <input
          placeholder="Todo name"
          type="text"
          class="input input-primary"
          value={text}
          onInput={(e) => setText((e.target as HTMLInputElement).value)}
        />
        <button onClick={add} class="btn btn-primary ml-4">
          Add Todo
        </button>
      </div>
      <ul class="mt-6">
        {Object.values(todos ||{}).map((todo) => (
          <li class="flex items-center">
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() =>
                dispatch('todos.set', set(todos, todo.id, { done: !todo.done }))
              }
            />
            <span class="ml-4">{todo.name}</span>
          </li>
        ))}
      </ul>
    </>
  )
}
