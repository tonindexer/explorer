import { defineNitroConfig } from 'nitropack'

export default defineNitroConfig({
  esbuild: {
    options: {
      target: 'esnext'
    }
  }
})