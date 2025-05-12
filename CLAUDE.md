# Writer2 Monorepo Guide

## Commands
- `pnpm dev` - Start all services
- `pnpm dev:reader` - Start reader app
- `pnpm dev:server` - Start server
- `pnpm dev:writer` - Start writer app
- `pnpm build` - Build all packages
- `pnpm --filter @writer/writer test` - Run writer tests
- `pnpm --filter @writer/writer test "testName"` - Run single test

## Code Style
- **Formatting**: Biome.js (2-space indentation)
- **Components**: Writer uses SolidJS, Reader uses React
- **CSS**: Tailwind with DaisyUI components
- **Types**: TypeScript with strict mode enabled
- **Naming**: camelCase for functions/variables, PascalCase for types
- **Modules**: Modern ESM modules (imports from npm packages first, then local)
- **Project Structure**: Monorepo with `apps/{reader,server,shared,writer}`

## Error Handling
Use try/catch for async operations and propagate errors appropriately.