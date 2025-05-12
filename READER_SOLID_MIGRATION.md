# Reader App: React to SolidJS Migration Plan

This document outlines the plan for migrating the Reader application from React to SolidJS with server-side rendering (SSR) capabilities.

## Goals

- Create a new version of the Reader app using SolidJS
- Implement server-side rendering for improved performance and SEO
- Set up a foundation for sharing components between Reader and Writer apps
- Maintain feature parity with the existing React implementation

## 1. Project Setup

```bash
# Create a new directory for the SolidStart app
mkdir apps/reader-solid
cd apps/reader-solid

# Initialize SolidStart
pnpm create solid@latest
# Select SolidStart as the starter template
# Choose TypeScript
# Select Vite as the bundler
```

### Configuration Files

**package.json**
```json
{
  "name": "@writer/reader-solid",
  "dependencies": {
    "@solidjs/router": "^0.14.10",
    "@tanstack/solid-query": "^5.74.4",
    "@trpc/client": "^11.1.0",
    "solid-js": "^1.9.5",
    "daisyui": "^4.12.24",
    "tailwindcss": "^3.4.17",
    "@writer/shared": "workspace:*"
  },
  "scripts": {
    "dev": "start-dev",
    "build": "start-build",
    "start": "start-server"
  }
}
```

**tailwind.config.js**
```javascript
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["fantasy", "forest"],
  },
};
```

## 2. Server Configuration

**server.ts**
```typescript
import { createServer } from '@solidjs/start/server';
import fastifyCors from '@fastify/cors';

export default createServer({
  // Configure to use the same port as the reader app in dev mode
  port: 3333,
  plugins: [
    {
      name: 'cors',
      setup(app) {
        app.register(fastifyCors, { origin: '*' });
      }
    }
  ]
});
```

## 3. Core Infrastructure

### TRPC Integration

**src/lib/trpc.ts**
```typescript
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@writer/server';
import { isServer } from 'solid-js/web';

// Create a TRPC client that works both on server and client
export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: isServer 
        ? 'http://localhost:2022/trpc' 
        : window.location.host.includes('localhost')
          ? 'http://localhost:2022/trpc'
          : 'https://writer.serial-experiments.com/trpc',
      async headers() {
        // Get authentication token from cookies on server 
        // or localStorage on client
        return {
          Authorization: isServer 
            ? 'Bearer [from-cookie]' // Implement using cookies
            : `Bearer ${localStorage.getItem('sessionToken')}`,
        };
      },
    }),
  ],
});
```

### Store Management

**src/lib/stores/bookshelf.ts**
```typescript
import { createStore } from 'solid-js/store';

type BookshelfState = {
  isOpen: boolean;
  storyId: string | null;
};

const [bookshelfState, setBookshelfState] = createStore<BookshelfState>({
  isOpen: false,
  storyId: null,
});

export const openAddToBookshelf = (storyId: string) => {
  setBookshelfState({ isOpen: true, storyId });
};

export const closeAddToBookshelf = () => {
  setBookshelfState({ isOpen: false, storyId: null });
};

export { bookshelfState };
```

## 4. Basic App Foundation

### Root Layout

**src/root.tsx**
```tsx
import { Suspense } from 'solid-js';
import { isServer } from 'solid-js/web';
import { Router, useLocation } from '@solidjs/router';
import { MetaProvider } from '@solidjs/meta';
import { Outlet } from '@solidjs/router';
import './root.css';

export default function Root() {
  const location = useLocation();
  const url = isServer ? location.pathname + location.search : undefined;
  
  return (
    <Router url={url}>
      <MetaProvider>
        <div>
          <Suspense fallback={<div>Loading...</div>}>
            <Outlet />
          </Suspense>
        </div>
      </MetaProvider>
    </Router>
  );
}
```

### Main Layout Component

**src/components/Layout.tsx**
```tsx
import { createSignal, onMount, ParentComponent } from 'solid-js';
import { A } from '@solidjs/router';

export const Layout: ParentComponent = (props) => {
  const [colorMode, setColorMode] = createSignal('light');
  
  onMount(() => {
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setColorMode('dark');
    }
  });
  
  return (
    <div 
      class="flex flex-col min-h-screen"
      data-theme={colorMode() === 'light' ? 'fantasy' : 'forest'}
    >
      <nav class="sticky navbar top-0 bg-base-100 text-base-content shadow-md z-50">
        <div class="container m-auto">
          <div>
            <A href="/" class="btn btn-ghost text-xl">Reader</A>
          </div>
          <div class="flex-none">
            <ul class="menu menu-horizontal px-1">
              <li><A href="/">Home</A></li>
              <li><A href="/stories">Stories</A></li>
              <li><A href="/download">Download Writer</A></li>
            </ul>
          </div>
          {/* UserStatus component will go here */}
        </div>
      </nav>
      <main
        class="flex-grow overflow-hidden"
        style={{
          "background-image": colorMode() === 'dark' 
            ? "url(/bg-dark.png)" 
            : "url(/bg-light.png)",
          "background-attachment": "fixed",
          "background-size": "cover",
        }}
      >
        <div class="container mx-auto flex-1">
          <div class="bg-base-100 p-4 h-full">{props.children}</div>
        </div>
      </main>
    </div>
  );
};
```

## 5. Component Port Sequence

### Phase 1: Core Infrastructure
1. **Store & State Management**
   - Convert Redux store to SolidJS reactive stores
   - Create equivalent of bookshelf-slice using SolidJS stores

2. **Utilities**
   - Port trpc.ts (already covered in setup)
   - Create authentication utilities
   - Port useColorMode hook to SolidJS createSignal

### Phase 2: Base Components
1. **Layout Component**
   - First component to port - serves as the foundation
   - Already outlined in initial setup

2. **UserStatus Component**
   - Authentication handling
   - User profile display

3. **UI Components**
   - Navitem component equivalent for SolidJS

### Phase 3: Core Domain Components
1. **StoryCard Component**
   - Essential display component used on multiple pages
   - Displays story thumbnails and metadata

2. **AddToBookshelf Component**
   - Modal dialog for adding stories to bookshelf

3. **Book Component**
   - Rendering book details

### Phase 4: Pages
Port pages in order of complexity/importance:
1. **Index Page** - Homepage
2. **Stories Page** - Listing of stories
3. **Story Page** - Individual story view
4. **Chapter Page** - Reading interface
5. **Login Page** - Authentication
6. **Bookshelf Page** - User's saved stories
7. **Author/Authors Pages** - Author listing and profiles
8. **Search Page** - Search functionality
9. **Download Page** - Static page
10. **Settings Page** - User settings
11. **Admin Page** - Admin functionality
12. **MyFiction Page** - User's own stories

## 6. Key Transformation Patterns

### React Hooks → SolidJS Primitives
- `useState` → `createSignal`
- `useEffect` → `createEffect`
- `useContext` → `createContext` + `useContext`
- `useRef` → `createMutable` or access DOM with `ref` prop
- `useMemo` → `createMemo`

### JSX Transformations
- Replace React fragment `<>...</>` with `<></>` or `<Fragment>...</Fragment>`
- Change `className` to `class`
- Change event handlers (e.g., `onClick={handleClick}` to `onClick={handleClick}`)

### List Rendering (Very Important)
- Replace `.map()` with `<For>` component:
  ```jsx
  {/* From React */}
  {items.map(item => <Item key={item.id} {...item} />)}
  
  {/* To SolidJS */}
  <For each={items()}>{(item) => 
    <Item {...item} />
  }</For>
  ```
- For conditional rendering, use `<Show>` component:
  ```jsx
  {/* From React */}
  {isVisible && <Component />}
  
  {/* To SolidJS */}
  <Show when={isVisible()}>
    <Component />
  </Show>
  ```
- For switch-like conditions, use `<Switch>` and `<Match>`:
  ```jsx
  <Switch>
    <Match when={condition1()}>
      <Component1 />
    </Match>
    <Match when={condition2()}>
      <Component2 />
    </Match>
  </Switch>
  ```

### Component Props
- React's `React.FC<Props>` → `Component<Props>`
- Props destructuring remains similar
- Remember that props in SolidJS are reactive without destructuring

### Routing
- Convert `wouter` routes to `@solidjs/router`
- Convert `useLocation` to SolidJS equivalent

### Data Fetching
- Convert React Query to @tanstack/solid-query
- Ensure SSR compatibility with `createResource`

## 7. Example Component Transformation

### React StoryCard Component (Simplified)

```tsx
// Original React component
const StoryCard: React.FC<StoryCardProps> = ({
  id,
  coverArtAsset,
  name,
  summary,
  color,
  textColor,
  pages,
  status,
  canAddToLibrary,
}) => {
  const dispatch = useAppDispatch();

  const handleAddToLibraryClick = () => {
    dispatch(openAddToBookshelf(id));
  };

  return (
    <div className={styles.cardContainer}>
      <div className={styles.card} style={{ "--thickness": Math.round(pages / 20) + "px" }}>
        <div className={styles.cardFront} style={{ backgroundColor: color, color: textColor }}>
          {coverArtAsset ? (
            <img src={coverArtAsset} alt={name} className="w-full object-cover" />
          ) : (
            <p className="text-center">{name}</p>
          )}
        </div>
        <div className={styles.cardBack}>
          <h2>{name}</h2>
          <p>{pages} pages {status === "COMPLETED" ? " ✅" : " 🔥"}</p>
          <div dangerouslySetInnerHTML={{ __html: summary }} />
          
          {canAddToLibrary && (
            <button type="button" onClick={handleAddToLibraryClick}>
              + Library
            </button>
          )}
          <a href={`/story/${id}`}>Read</a>
        </div>
      </div>
    </div>
  );
};
```

### SolidJS StoryCard Component (Transformed)

```tsx
// Transformed SolidJS component
import { Component, Show } from 'solid-js';
import styles from './storycard.module.css';
import { A } from '@solidjs/router';
import { openAddToBookshelf } from '../lib/stores/bookshelf';

interface StoryCardProps {
  id: string;
  coverArtAsset: string;
  name: string;
  summary: string;
  color: string;
  textColor: string;
  pages: number;
  status?: string;
  canAddToLibrary?: boolean;
}

const StoryCard: Component<StoryCardProps> = (props) => {
  const handleAddToLibraryClick = () => {
    openAddToBookshelf(props.id);
  };

  return (
    <div class={styles.cardContainer}>
      <div class={styles.card} style={{ "--thickness": Math.round(props.pages / 20) + "px" }}>
        <div class={styles.cardFront} style={{ 
          "background-color": props.color, 
          color: props.textColor 
        }}>
          <Show when={props.coverArtAsset} fallback={
            <p class="text-center">{props.name}</p>
          }>
            <img src={props.coverArtAsset} alt={props.name} class="w-full object-cover" />
          </Show>
        </div>
        <div class={styles.cardBack}>
          <h2>{props.name}</h2>
          <p>{props.pages} pages {props.status === "COMPLETED" ? " ✅" : " 🔥"}</p>
          <div innerHTML={props.summary} />
          
          <Show when={props.canAddToLibrary}>
            <button type="button" onClick={handleAddToLibraryClick}>
              + Library
            </button>
          </Show>
          <A href={`/story/${props.id}`}>Read</A>
        </div>
      </div>
    </div>
  );
};

export default StoryCard;
```

## 8. Project Structure

```
apps/reader-solid/
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── src/
│   ├── routes/
│   │   ├── index.tsx
│   │   ├── stories.tsx
│   │   └── ...other routes
│   ├── components/
│   │   ├── Layout.tsx
│   │   ├── StoryCard.tsx
│   │   └── ...other components
│   ├── lib/
│   │   ├── trpc.ts
│   │   └── stores/
│   │       ├── bookshelf.ts
│   │       └── ...other stores
│   ├── assets/
│   │   └── ...static assets
│   ├── root.tsx
│   └── root.css
└── public/
    ├── bg-dark.png
    ├── bg-light.png
    └── ...other static files
```

## 9. Testing Strategy

For each component:
1. Verify visual appearance matches original
2. Ensure reactivity works as expected
3. Validate SSR functionality
4. Test interactions and event handling

## 10. Future Considerations

- Shared component library between Reader and Writer
- Enhanced SSR capabilities with data preloading
- Improved performance through SolidJS's fine-grained reactivity
- Writing functionality integrated into the Reader app