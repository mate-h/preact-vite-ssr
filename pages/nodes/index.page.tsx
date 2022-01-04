// server side page module extends a module that is compatible with rendering nodes
// by re-using common code

import { ComponentChildren, createElement } from 'preact'
import { useStore } from 'store'
import { Dispatcher, NodeBase, NodeRef } from '../../src/node/store'

export { Page }

type NodeProps = {
  id: string
}

function Node(props: NodeProps): any {
  // generic node that subscibes to the data store
  const { id } = props
  const { dispatch, nodes } = useStore('nodes')
  const node = nodes[id]
  // if node is primitive, render it
  if (node && (node as NodeBase).type) {
    const n = node as NodeBase
    let p = n.props
    let h: Record<string, any> = {}

    // transform props and extract event handlers
    if (p !== null) {
      Object.keys(p).forEach((k) => {
        if ((p![k] as Dispatcher).event) {
          // must be of type Dispatcher
          const d = p![k] as Dispatcher
          h[k] = (e: Event) => {
            // obtain value / checked from event
            let v = (e.target as any).value
            if (v === undefined) {
              v = (e.target as any).checked
            }
            dispatch(d.event as any, {
              ...d.data,
              value: v,
            })
          }
        }
      })
    }

    return createElement(
      n.type,
      {
        ref: (node: any) => {
          dispatch('nodes.self', { id, self: node })
        },
        key: id,
        ...((n.props as any) || {}),
        ...h,
      },
      (n.children || []).map((child) => {
        if (child && (child as NodeRef).ref) {
          const n = child as NodeRef
          return Node({ id: n.ref })
        }
        return child
      })
    )
  }
  return <>{node}</>
}

function Page() {
  const { parent } = useStore('parent')
  return <>{parent && <Node id={parent.ref} />}</>
}
