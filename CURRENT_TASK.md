# Current Task: UI Component Inventory for Design System

## Context

We're building a design system in `/packages/ui` using:
- SolidJS
- Vanilla Extract CSS
- Histoire for component documentation
- Dual themes: Chronicle (dark/fantasy) and Starlight (light/sci-fi)

## What's Been Built

### Design Tokens (Complete)
- Color tokens with accessibility contrast checking
- Typography tokens
- Spacing tokens
- Border tokens
- Shadow tokens (with gold borders for dark theme visibility)
- Motion tokens
- Raw color files (`chronicle.colors.ts`, `starlight.colors.ts`) for contrast calculations

### Button Component (Complete with Effects)
- Variants: primary, secondary, ghost, danger
- Sizes: sm, md, lg
- Effects:
  - `spin` - Spinning gradient border (gold leaf effect for Chronicle)
  - `sweep` - Light sweep across button face (sci-fi feel for Starlight)
  - `runes` - Spawns 3 animated rune images on hover (fantasy effect)
  - `runeBg` - Single large background rune (experimental, less successful)
- Rune colors adapt per variant (gold, blue-purple, red)
- Rune images in `/packages/ui/public/runes/` (42 images, 7x6 grid)

### Theme Updates
- Chronicle: Lightened background from #0d0b09 to #1c1816
- Starlight: Updated accent colors - deeper blue primary (#0d5bbd), Rebel Alliance red secondary (#a5281b)
- Both themes now import from `.colors.ts` files (single source of truth)

### Histoire Plugin (Complete)
- Story collection works
- Preview rendering works
- Source code extraction with Prettier formatting
- Theme switching via `histoire.setup.ts`
- `ThemeComparison` utility for side-by-side theme display

---

## Component Inventory (Completed)

Analysis of `/apps/story/src/components/` to inform design system priorities.

### Reference Patterns from Story App

These patterns inform what to build in `@writer/ui`:

#### Buttons (Reference: `IconButton.tsx`, `HeaderButton.tsx`)
- **IconButton**: 21 lines, circular icon button with hover effects
- **HeaderButton**: 47 lines, variant support (default, active, danger, primary)
- **Pattern**: Variant-based styling, disabled states, responsive sizing

#### Modal (Reference: `OverlayPanel.tsx`)
- 85 lines, Portal-based rendering
- Currently used as full-screen modal (width: 100%, animation: 0)
- Escape key handling, backdrop click-to-close
- **Missing in story app**: Focus trapping, `aria-modal`, `aria-labelledby`

#### Dropdown/Popover (Reference: `TokenSelector.tsx`, `MessageActionsDropdown.tsx`)
- Click outside to close
- Escape to close
- Portal positioning
- **Missing**: Keyboard navigation, `aria-haspopup`

#### Form Inputs (Reference: `LoginForm.tsx`, `NewStoryForm.tsx`)
- Labels with for/id association
- Error states and messages
- Disabled states
- Password visibility toggle
- Input groups (input + button)

#### Status/Badge (Reference: `SaveIndicator.tsx`, `GlobalStatusIndicator.tsx`)
- Icon + text combinations
- Color-coded states (success, warning, error, info)
- Loading/spinner states

#### Notifications (Reference: `ErrorNotifications.tsx`)
- 37 lines, generic error/warning pattern
- Icon + message + dismiss

### Accessibility Gaps to Address in Design System

1. **Focus Management**
   - Modals need focus trapping
   - Return focus to trigger on close
   - Proper tab order

2. **ARIA Labels**
   - Icon-only buttons need `aria-label`
   - Modals need `role="dialog"`, `aria-modal`, `aria-labelledby`
   - Dropdowns need `aria-haspopup`, `aria-expanded`

3. **Keyboard Navigation**
   - Consistent Escape key handling
   - Arrow key navigation in dropdowns/menus
   - Enter/Space handling on custom interactive elements

4. **Touch Targets**
   - Minimum 44px for WCAG compliance (story app uses 32px desktop, 24px mobile)

5. **Motion**
   - `prefers-reduced-motion` support

---

## Priority Components to Build

### Tier 1: Foundation (Next Up)
| Component | Description | Reference |
|-----------|-------------|-----------|
| **IconButton** | Circular icon button | `story/IconButton.tsx` |
| **Input** | Text input with label, error states | `story/LoginForm.tsx` |
| **Textarea** | Multi-line input | Form patterns |
| **Modal** | Base modal with Portal, focus trap, a11y | `story/OverlayPanel.tsx` |

### Tier 2: Interactive Patterns
| Component | Description | Reference |
|-----------|-------------|-----------|
| **Select** | Dropdown select | `story/TokenSelector.tsx` |
| **Dropdown** | Generic dropdown menu | `story/MessageActionsDropdown.tsx` |
| **FormField** | Label + input + error wrapper | Form patterns |

### Tier 3: Feedback & Display
| Component | Description | Reference |
|-----------|-------------|-----------|
| **Toast/Notification** | Dismissible alerts | `story/ErrorNotifications.tsx` |
| **Badge/Status** | Status indicators | `story/SaveIndicator.tsx` |
| **Spinner** | Loading indicator | Various inline spinners |
| **Tabs** | Tab navigation | `story/Message.tsx` summary tabs |

### Tier 4: Layout (From App.css patterns)
| Component | Description |
|-----------|-------------|
| **Stack** | Vertical/horizontal flex layout |
| **Container** | Max-width centered container |
| **Grid** | CSS grid layout helper |
| **Divider** | Horizontal/vertical separator |

---

## Files of Interest

- `/packages/ui/src/components/Button/` - Complete with effects
- `/packages/ui/src/theme/` - Token system
- `/packages/ui/DESIGN_SYSTEM.md` - Progress tracking
- `/apps/story/src/styles/variables.css` - Story app's CSS variables (for reference)
- `/apps/story/src/App.css` - Layout patterns reference (3,324 lines)

## Next Action

Start building Tier 1 components in `/packages/ui`:
1. IconButton
2. Input
3. Textarea
4. Modal
