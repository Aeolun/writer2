# Writer UI Design System

A SolidJS + Vanilla Extract design system with dual themes for the Writer application.

## Themes

- **Chronicle** - Dark fantasy theme (Baldur's Gate / Divinity inspired)
- **Starlight** - Light sci-fi theme (clean, modern)

## Progress

### Design Tokens

| Token Category | Defined | Story |
|----------------|---------|-------|
| Colors - Background | ✅ | ✅ |
| Colors - Surface | ✅ | ✅ |
| Colors - Text | ✅ | ✅ |
| Colors - Border | ✅ | ✅ |
| Colors - Accent | ✅ | ✅ |
| Colors - Semantic | ✅ | ✅ |
| Typography - Family | ✅ | ✅ |
| Typography - Size | ✅ | ✅ |
| Typography - Weight | ✅ | ✅ |
| Typography - Line Height | ✅ | ✅ |
| Typography - Letter Spacing | ✅ | ✅ |
| Spacing | ✅ | ✅ |
| Border Radius | ✅ | ✅ |
| Border Width | ✅ | ✅ |
| Shadows | ✅ | ✅ |
| Motion - Duration | ✅ | ✅ |
| Motion - Easing | ✅ | ✅ |
| Z-Index | ✅ | ⬜ |

### Components

| Component | Built | Story | Notes |
|-----------|-------|-------|-------|
| Button | ✅ | ✅ | primary, secondary, ghost, danger variants; sm/md/lg sizes |
| Input | ⬜ | ⬜ | Text input with label, error states |
| TextArea | ⬜ | ⬜ | Multi-line input |
| Checkbox | ⬜ | ⬜ | |
| Radio | ⬜ | ⬜ | |
| Switch | ⬜ | ⬜ | Toggle switch |
| Select | ⬜ | ⬜ | Dropdown select |
| Card | ⬜ | ⬜ | Container with elevation |
| Panel | ⬜ | ⬜ | Sidebar/content panels |
| Modal | ⬜ | ⬜ | Dialog overlay |
| Toast | ⬜ | ⬜ | Notification popups |
| Tooltip | ⬜ | ⬜ | Hover hints |
| Popover | ⬜ | ⬜ | Click-triggered overlay |
| Tabs | ⬜ | ⬜ | Tab navigation |
| Badge | ⬜ | ⬜ | Status indicators |
| Avatar | ⬜ | ⬜ | User/character images |
| Icon | ⬜ | ⬜ | Icon wrapper component |
| Spinner | ⬜ | ⬜ | Loading indicator |
| Progress | ⬜ | ⬜ | Progress bar |
| Divider | ⬜ | ⬜ | Horizontal/vertical separator |
| Menu | ⬜ | ⬜ | Dropdown menu |
| Breadcrumb | ⬜ | ⬜ | Navigation breadcrumbs |

### Layout Components

| Component | Built | Story | Notes |
|-----------|-------|-------|-------|
| Stack | ⬜ | ⬜ | Vertical/horizontal flex stack |
| Grid | ⬜ | ⬜ | CSS grid wrapper |
| Container | ⬜ | ⬜ | Max-width centered container |
| Spacer | ⬜ | ⬜ | Flexible space |

### Story Utilities

| Utility | Built | Notes |
|---------|-------|-------|
| ThemeComparison | ✅ | Shows content in both themes side by side |

## File Structure

```
packages/ui/src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.css.ts
│   │   └── Button.story.tsx
│   ├── ColorTokens/
│   │   └── ColorTokens.story.tsx
│   └── [Component]/
│       ├── [Component].tsx
│       ├── [Component].css.ts
│       └── [Component].story.tsx
├── theme/
│   ├── tokens.css.ts      # Token contract (shape)
│   ├── chronicle.css.ts   # Dark theme values
│   ├── starlight.css.ts   # Light theme values
│   ├── global.css.ts      # Global styles (use sparingly)
│   └── ThemeProvider.tsx  # Theme context provider
├── story-utils/
│   └── ThemeComparison.tsx
├── index.ts               # Public exports
└── histoire.setup.ts      # Histoire configuration
```

## Development

```bash
# Run Histoire (component dev environment)
cd packages/ui && pnpm story

# Build the package
cd packages/ui && pnpm build
```

## Design Principles

### Responsive by Default
Components must work on both mobile and desktop with minimal customization:
- Touch-friendly tap targets (min 44px)
- Flexible layouts that adapt to available space
- No desktop-only hover states for critical interactions
- Test in both viewport sizes

### Mobile-First
- Design for constrained space first
- Progressive enhancement for larger screens
- Avoid horizontal scrolling

## Component Guidelines

1. **Use tokens** - Always use `tokens.*` for colors, spacing, etc.
2. **Recipe pattern** - Use vanilla-extract recipes for variant props
3. **Story for every component** - Include all variants and states
4. **ThemeComparison** - Use in stories to show both themes
5. **Accessible** - Include focus states, ARIA attributes
6. **Composable** - Prefer composition over configuration
7. **Responsive** - Works on mobile and desktop without extra props
