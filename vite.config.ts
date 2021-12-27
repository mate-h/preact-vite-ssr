import preact from '@preact/preset-vite'
import ssr from 'vite-plugin-ssr/plugin'
import { UserConfig } from 'vite'
import windicss from 'vite-plugin-windicss'
import config from './windi.config'

const viteConfig: UserConfig = {
  plugins: [preact(), ssr(), windicss({ config })],
  // @ts-ignore
  ssr: {
    noExternal: ['preact-iso'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // if (id.includes('firebase')) {
            //   if (id.includes('auth')) {
            //     return 'firebase.auth'
            //   }
            //   return 'firebase.client'
            // }
            return 'vendor'
          }
        },
      },
    },
  },
}

export default viteConfig
