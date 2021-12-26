import preact from '@preact/preset-vite'
import ssr from 'vite-plugin-ssr/plugin'
import { UserConfig } from 'vite'

const config: UserConfig = {
  plugins: [preact(), ssr()]
  // @ts-ignore
  // ssr:{
  //   external: ["vite-plugin-ssr/plugin"]
  // }
}

export default config
