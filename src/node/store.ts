import { merge, omit, set } from 'lodash'
import { Module } from '../store'
import { deepClone, id } from 'utils'

export type Dispatcher = {
  event: string
  data?: any
}

type EventKeys = keyof JSX.DOMAttributes<EventTarget>;

export type NodeBase<T = any> = {
  id: string
  type: string
  props:
    | (Omit<JSX.HTMLAttributes, EventKeys> &
        Omit<JSX.SVGAttributes, EventKeys> &
        Record<EventKeys, Dispatcher> &
        Record<string, any>)
    | null
  /** Array of node children */
  children?: NodeChild[]
  data?: T
}

/** Reference to a node in the view store */
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
  'nodes.add': {
    parent: NodeRef
    child: NodeRef
    nodes: Record<string, NodeType>
  }
  'nodes.delete': { id: string }
  'nodes.update': { path: string | string[]; value: any }
  'nodes.self': { id: string; self: HTMLElement | null }
}

export type State = {
  nodes: Record<string, NodeType>
  dom: Record<string, HTMLElement | null>
  parent?: NodeRef
}

export const module: Module = (store) => {
  store.on('@init', (init) => {
    // return { nodes: init.nodes || {}, dom: {} };
    const u1 = id()
    const u2 = id()
    const u3 = id()
    const u4 = id()
    const u5 = id()
    const n1 = id()
    const n2 = id()
    const n3 = id()
    const n4 = id()
    return {
      parent: { ref: u1 },
      nodes: {
        [u1]: {
          id: u1,
          type: 'div',
          props: {},
          children: [{ ref: u2 }, { ref: u3 }, { ref: u4 }, { ref: u5 }],
        },
        [u2]: {
          id: u2,
          type: 'p',
          props: {
            class: 'uppercase tracking-wide text-xs text-gray-500',
          },
          children: ['Hello world'],
        },
        [u3]: {
          id: u3,
          type: 'p',
          props: {
            class: 'text-2xl font-medium',
          },
          children: ['Title test'],
        },
        [u4]: {
          id: u4,
          type: 'button',
          props: {
            class:
              'mt-4 bg-blue-500 hover:bg-blue-700 text-sm text-white font-medium py-1 px-4 rounded-md',
            onClick: {
              event: 'nodes.add',
              data: {
                parent: { ref: u5 },
                child: { ref: n1 },
                nodes: {
                  [n1]: {
                    type: 'li',
                    props: {
                      class: 'text-sm flex group py-1',
                    },
                    children: [{ ref: n2 }, { ref: n3 }],
                  },
                  [n2]: {
                    id: n2,
                    type: 'p',
                    props: {
                      class: 'flex-grow',
                    },
                    children: [{ ref: n4 }],
                  },
                  [n3]: {
                    id: n3,
                    type: 'button',
                    props: {
                      class:
                        'font-medium opacity-0 group-hover:opacity-100 px-2 rounded-md',
                      onClick: {
                        event: 'nodes.delete',
                        data: { id: n1 },
                      },
                    },
                    children: ['Delete'],
                  },
                  [n4]: {
                    id: n4,
                    type: 'input',
                    props: {
                      class: 'bg-transparent w-full max-w-md rounded-md',
                      type: 'text',
                      placeholder: 'Enter text',
                      onInput: {
                        event: 'nodes.update',
                        data: { path: [n4, 'props', 'value'] },
                      },
                    },
                  },
                },
              },
            },
          },
          children: ['Add'],
        },
        [u5]: {
          id: u5,
          type: 'ul',
          props: {
            class: 'mt-4',
          },
          children: [],
        },
      },
    }
  })
  store.on('nodes.update', (state, { path, value }) => ({
    nodes: set(state.nodes, path, value),
  }))
  store.on('nodes.add', (state, event) => {
    let { child, parent, nodes: newNodes } = event
    let { nodes } = state

    let newN = deepClone(newNodes);

    // generate new ids for new nodes
    const idMap = Object.fromEntries(
      Object.keys(newN).map((idx) => [idx, id()])
    )
    
    // replace any occurences of the old id with the new id
    const oldKeys = Object.keys(idMap)
    function traverse(o: any): any {
      // array
      if (Array.isArray(o)) {
        return o.map((item) => traverse(item))
      }
      // object
      if (o && typeof o === 'object') {
        return Object.fromEntries(
          Object.entries(o).map(([key, value]) => {
            let k = key
            if (oldKeys.includes(key)) {
              k = idMap[key]
            }
            return [k, traverse(value)]
          })
        )
      }
      if (oldKeys.includes(o)) {
        return idMap[o]
      }
      return o
    }
    newN = traverse(newN)


    // append new node
    nodes = merge(nodes, newN)

    // add to ref at parent
    const n = nodes[parent.ref] as NodeBase

    nodes = set(
      nodes,
      [parent.ref, 'children'],
      [...(n.children || []), { ref: idMap[child.ref] }]
    )

    return { nodes }
  })
  store.on('nodes.delete', (state, event) => {
    const { id } = event
    let { nodes } = state

    // if node has children, recursively delete them
    function removeAt(nodes: Record<string, NodeType>, id: string) {
      if (nodes[id] && (nodes[id] as NodeBase).children) {
        const n = nodes[id] as NodeBase
        if (n.children && n.children.length) {
          n.children.forEach((child) => {
            if (child && (child as NodeRef).ref) {
              const c = child as NodeRef
              nodes = removeAt(nodes, c.ref)
            }
          })
        }
      }
      // delete node from tree
      nodes = omit(nodes, id)
      return nodes
    }

    nodes = removeAt(nodes, id)

    // remove refs at any parent nodes
    Object.keys(nodes).forEach((key) => {
      const n = nodes[key] as NodeBase
      if (n.children && n.children.length) {
        nodes = set(
          nodes,
          [key, 'children'],
          n.children.filter((child) => {
            if (child && (child as NodeRef).ref) {
              const c = child as NodeRef
              return c.ref !== id
            }
            return true
          })
        )
      }
    })

    return { nodes }
  })
  store.on('nodes.self', ({ dom }, event) => {
    const { id, self } = event
    dom = set(dom, id, self)
    return { dom }
  })
  store.on('nodes.set', (_, nodes) => ({ nodes }))
}
