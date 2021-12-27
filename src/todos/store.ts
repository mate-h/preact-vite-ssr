import { set } from 'lodash'
import { Module } from '../store'

type TodoItem = {
  id: string
  name: string
  done: boolean
}

export type Events = {
  'todos.set': Record<string, TodoItem>
}

export type State = {
  todos: Record<string, TodoItem>
}

export const module: Module = (store) => {
  store.on('@init', (init) => {
    // let todos = init.pageProps.todos || {};
    return { todos: {} }
  })
  store.on('todos.set', (state, event) => set(state, 'todos', event))
}
