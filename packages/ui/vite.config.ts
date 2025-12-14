import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vanillaExtractPlugin(),
    solid(),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'theme/index': resolve(__dirname, 'src/theme/tokens-only.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: ['solid-js', 'solid-js/web', 'solid-js/store'],
    },
    cssCodeSplit: false,
  },
})
