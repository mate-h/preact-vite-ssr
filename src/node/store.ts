import { set } from 'lodash'
import { ComponentChildren } from 'preact'
import { Module } from '../store'
import { id } from 'utils'

export type NodeBase = {
  id: string
  type: string
  props: (JSX.HTMLAttributes & JSX.SVGAttributes & Record<string, any>) | null
  /** Array of node childs */
  children?: NodeChild[]
}

export type NodeRef = {
  ref: string
}

export type NodeChild =
  | NodeRef
  | object
  | string
  | number
  | bigint
  | boolean
  | null
  | undefined

export type NodeType = NodeBase | NodeChild

export type Events = {
  'nodes.set': Record<string, NodeType>
}

export type State = {
  nodes: Record<string, NodeType>
  rootNode: string
}

export const module: Module = (store) => {
  store.on('@init', (init) => {
    const uid = id()
    const uid2 = id()
    const uid3 = id()
    const uid4 = id()
    return {
      rootNode: uid,
      nodes: {
        [uid]: {
          id: uid,
          type: 'div',
          props: {},
          children: [{ ref: uid2 }, { ref: uid3 }, { ref: uid4 }],
        },
        [uid2]: {
          id: uid2,
          type: 'p',
          props: {
            class: 'uppercase tracking-wide text-xs text-gray-500',
          },
          children: ['Hello world'],
        },
        [uid3]: {
          id: uid3,
          type: 'p',
          props: {
            class: 'text-xl font-bold',
          },
          children: ['Title test'],
        },
        [uid4]: {
          id: uid4,
          type: 'button',
          props: {
            class: 'bg-blue-500 hover:bg-blue-700 text-sm text-white font-medium py-1 px-4 rounded',
          },
          children: ['Add'],
        },
      },
    }
    // return { nodes: init.nodes || {} }
  })
  store.on('nodes.set', (_, nodes) => ({ nodes }))
}
