import { defineConfig } from 'histoire'
import { HstSolid } from 'histoire-plugin-solid'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'
import solid from 'vite-plugin-solid'

export default defineConfig({
  plugins: [
    HstSolid(),
  ],
  storyMatch: ['**/*.story.tsx'],
  setupFile: './src/histoire.setup.ts',
  vite: {
    plugins: [
      vanillaExtractPlugin(),
      solid({ ssr: true }),
    ],
  },
  theme: {
    title: 'Writer UI',
  },
  tree: {
    groups: [
      {
        id: 'design-tokens',
        title: 'Design Tokens',
      },
      {
        id: 'components',
        title: 'Components',
      },
      {
        id: 'layout',
        title: 'Layout',
      },
      {
        id: 'editor',
        title: 'Editor',
      },
    ],
  },
})
