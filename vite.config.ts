import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
// @ts-ignore
import crossOriginIsolation from 'vite-plugin-cross-origin-isolation'

export default defineConfig({
  plugins: [solid(), crossOriginIsolation()],
  worker: {
    // plugins: [crossOriginIsolation()]
  }
})
