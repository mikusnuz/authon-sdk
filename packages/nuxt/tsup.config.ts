import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'runtime/plugin': 'src/runtime/plugin.ts',
    'runtime/composables': 'src/runtime/composables.ts',
    'runtime/middleware': 'src/runtime/middleware.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ['@nuxt/kit', 'nuxt', 'nuxt/app', '#app', '#imports', 'vue'],
})
