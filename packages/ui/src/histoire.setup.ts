// Import themes (needed so CSS is generated)
import './theme/chronicle.css'
import './theme/starlight.css'

// Import global styles (scoped to theme classes, won't affect Histoire's UI)
import './theme/global.css.ts'

// Note: Theme classes are applied per-component via ThemeComparison wrapper,
// not globally to the document. This keeps Histoire's UI unaffected.
