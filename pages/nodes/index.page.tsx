// server side page module extends a module that is compatible with rendering nodes
// by re-using common code

import { ComponentChildren, createElement } from 'preact'
import { useStore } from 'store'
import { Dispatcher, NodeBase, NodeRef, NodeRoot } from './store'

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
  // root node
  if (node && (node as NodeRoot).children) {
    const n = node as NodeRoot
    return (
      <>
        {n.children.map((child) => {
          if (child && (child as NodeRef).ref) {
            const n = child as NodeRef
            return Node({ id: n.ref })
          }
          return child
        })}
      </>
    )
  }
  return <>{node}</>
}

function Page() {
  const { dispatch, root, components } = useStore('root', 'components')
  return (
    <main>
      <div class="px-4 py-6 bg-[#121212] text-white">
        <h2 class="text-xl font-medium">Components</h2>
        <ul class="mt-4">
          {Object.keys(components).map((id) => {
            function addComponent() {
              // add at root
              dispatch('nodes.add', {
                parent: { ref: root.id },
                component: { ref: id },
              })
            }
            return (
              <li>
                <button onClick={addComponent} class="text-white text-sm font-mono focus:outline-none text-opacity-60 hover:text-opacity-100 px-2 rounded-md">{id}</button>
              </li>
            )
          })}
        </ul>
      </div>
      <div class="p-6 min-h-screen border-l border-gray-200 flex-grow">
        <Node id={root.id} />
      </div>
    </main>
  )
}
