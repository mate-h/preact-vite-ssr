// server side page module extends a module that is compatible with rendering nodes
// by re-using common code

import { ComponentChildren, createElement } from "preact"
import { useStore } from "store"
import { NodeBase, NodeRef } from "../../src/node/store";

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
    return createElement(
      n.type,
      n.props,
      (n.children || []).map(child => {
        if (child && (child as NodeRef).ref) {
          const n = child as NodeRef
          return Node({ id: n.ref })
        }
        return child
      })
    );
  }
  return <>{node}</>
}

function Page() {
  const { dispatch, nodes, rootNode } = useStore('nodes', 'rootNode')
  return (
    <div>
      <h1>Nodes</h1>
      <Node id={rootNode} />
    </div>
  )
}
