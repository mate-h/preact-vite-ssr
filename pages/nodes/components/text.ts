import { NodeComponent } from '../store'

export const Overline: NodeComponent = {
  child: { ref: '1' },
  nodes: {
    '1': {
      type: 'p',
      props: {
        class: 'uppercase tracking-wide text-xs text-gray-500',
      },
      children: ['Hello world'],
    },
  },
}

export const Headline1: NodeComponent = {
  child: { ref: '1' },
  nodes: {
    '1': {
      type: 'h1',
      props: {
        class: 'text-2xl font-medium',
      },
      children: ['Title test'],
    },
  },
}


