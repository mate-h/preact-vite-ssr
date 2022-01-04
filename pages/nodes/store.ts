import { merge, omit, set } from 'lodash'
import { Module } from 'store'
import { deepClone, id } from 'utils'
import * as components from './components'

export type Dispatcher = {
  event: string
  data?: any
}

type EventKeys = keyof JSX.DOMAttributes<EventTarget>

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

/** Self-contained, serializable node component module */
export type NodeComponent = {
  /** Root node of current module */
  child: NodeRef
  nodes: Record<string, NodeType>
}

export type NodeComponentRef = {
  /** unique name or id */
  ref: string
}

/** Equivalent to "Fragment" */
export type NodeRoot = {
  id: string
  children: NodeChild[]
}

export type Events = {
  'nodes.set': Record<string, NodeType>
  /** Instantiates a new node at the parent node */
  'nodes.add': {
    /** Reference to parent node */
    parent: NodeRef
    component: NodeComponentRef
  }
  'nodes.delete': { id: string }
  'nodes.update': { path: string | string[]; value: any }
  'nodes.self': { id: string; self: HTMLElement | null }
}

export type State = {
  nodes: Record<string, NodeType>
  components: Record<string, NodeComponent>
  dom: Record<string, HTMLElement | null>
  root: NodeRoot
}

export const module: Module = (store) => {
  store.on('@init', (init) => {
    const root = { id: id(), children: [] }
    const nodes = merge(init.nodes || {}, { [root.id]: root })
    return { root: init.root || root, nodes, dom: {}, components: deepClone(components) }
  })
  store.on('nodes.update', (state, { path, value }) => ({
    nodes: set(state.nodes, path, value),
  }))
  store.on('nodes.add', (state, event) => {
    let {
      parent,
      component: { ref: componentRef },
    } = event
    let { nodes, components } = state
    const { child, nodes: newNodes } = components[componentRef]

    let newN = deepClone(newNodes)

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
