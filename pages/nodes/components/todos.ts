import { NodeComponent } from '../store'

// To instantiate a node module, you need to generate new ids for all child nodes,
// and you need a reference to the parent node.
export const TodoList: NodeComponent = {
  child: { ref: '1' },
  nodes: {
    '1': {
      type: 'div',
      props: {},
      children: [{ ref: '2' }, { ref: '3' }],
    },
    '2': {
      type: 'button',
      props: {
        class:
          'mt-4 bg-blue-500 hover:bg-blue-700 text-sm text-white font-medium py-1 px-4 rounded-md',
        onClick: {
          event: 'nodes.add',
          data: {
            parent: { ref: '1' },
            component: { ref: 'TodoItem' },
          },
        },
      },
      children: ['Add Todo'],
    },
    '3': {
      type: 'ul',
      props: {
        class: 'mt-4',
      },
      children: [],
    },
  },
}

export const TodoItem: NodeComponent = {
  child: { ref: '1' },
  nodes: {
    '1': {
      type: 'li',
      props: {
        class: 'text-sm flex group py-1',
      },
      children: [{ ref: '2' }, { ref: '3' }],
    },
    '2': {
      type: 'p',
      props: {
        class: 'flex-grow',
      },
      children: [{ ref: '4' }],
    },
    '3': {
      type: 'button',
      props: {
        class: 'font-medium opacity-0 group-hover:opacity-100 px-2 rounded-md',
        onClick: {
          event: 'nodes.delete',
          data: { id: '1' },
        },
      },
      children: ['Delete'],
    },
    '4': {
      type: 'input',
      props: {
        class: 'bg-transparent w-full max-w-md rounded-md',
        type: 'text',
        placeholder: 'Enter text',
        onInput: {
          event: 'nodes.update',
          data: { path: ['4', 'props', 'value'] },
        },
      },
    },
  },
}
