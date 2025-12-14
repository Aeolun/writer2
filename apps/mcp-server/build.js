import { build } from 'esbuild'
import { writeFileSync, chmodSync } from 'fs'
import { join } from 'path'

await build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: 'dist/index.js',
  external: [
    '@modelcontextprotocol/sdk',
    '@modelcontextprotocol/sdk/server/index.js',
    '@modelcontextprotocol/sdk/server/stdio.js',
    '@modelcontextprotocol/sdk/types.js'
  ],
  loader: {
    '.ts': 'ts'
  },
  sourcemap: true,
  minify: false,
  treeShaking: true
})

// Create executable wrapper
const wrapperPath = join('dist', 'mcp-server')
writeFileSync(wrapperPath, '#!/usr/bin/env node\nimport(\'./index.js\')\n')
chmodSync(wrapperPath, 0o755)

console.log('Build complete!')