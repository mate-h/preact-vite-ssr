import preact from '@preact/preset-vite'
import ssr from 'vite-plugin-ssr/plugin'
import { UserConfig } from 'vite'
import windicss, { UserOptions } from 'vite-plugin-windicss'

const options: UserOptions = {
  config: {
    theme: {
      extend: {
        colors: {
          background: "var(--background)",
          surface: "var(--surface)",
        }
      }
    }
  }
};

const config: UserConfig = {
  plugins: [preact(), ssr(), windicss(options)],
  // @ts-ignore
  ssr: {
    noExternal: ['preact-iso'],
  },
}

export default config
