import type { Plugin } from 'histoire'

export function HstSolid(): Plugin {
  return {
    name: 'histoire-plugin-solid',

    defaultConfig() {
      return {
        supportMatch: [
          {
            id: 'solid',
            patterns: ['**/*.story.tsx', '**/*.story.jsx'],
            pluginIds: ['solid'],
          },
        ],
      }
    },

    config() {
      return {
        vite: {
          // Ensure solid-js resolves to client bundle, not server
          resolve: {
            conditions: ['development', 'browser'],
          },
        },
      }
    },

    supportPlugin: {
      id: 'solid',
      moduleName: 'histoire-plugin-solid',
      setupFn: 'setupSolid',
      importStoryComponent: (file, index) => `import Comp${index} from ${JSON.stringify(file.moduleId)}`,
    },
  }
}

export * from './helpers.js'
