import { createContext, useContext, createSignal, createEffect, type ParentComponent, type Accessor } from 'solid-js'
import { chronicleTheme } from './chronicle.css'
import { starlightTheme } from './starlight.css'

export type ThemeName = 'chronicle' | 'starlight' | 'system'

const themes = {
  chronicle: chronicleTheme,
  starlight: starlightTheme,
} as const

interface ThemeContextValue {
  theme: Accessor<ThemeName>
  resolvedTheme: Accessor<'chronicle' | 'starlight'>
  setTheme: (theme: ThemeName) => void
}

const ThemeContext = createContext<ThemeContextValue>()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  defaultTheme?: ThemeName
  storageKey?: string
}

export const ThemeProvider: ParentComponent<ThemeProviderProps> = (props) => {
  const storageKey = props.storageKey ?? 'writer-ui-theme'

  // Get initial theme from storage or default
  const getInitialTheme = (): ThemeName => {
    if (typeof window === 'undefined') return props.defaultTheme ?? 'system'
    const stored = localStorage.getItem(storageKey)
    if (stored && (stored === 'chronicle' || stored === 'starlight' || stored === 'system')) {
      return stored
    }
    return props.defaultTheme ?? 'system'
  }

  const [theme, setThemeSignal] = createSignal<ThemeName>(getInitialTheme())

  // Resolve 'system' to actual theme based on prefers-color-scheme
  const getSystemTheme = (): 'chronicle' | 'starlight' => {
    if (typeof window === 'undefined') return 'starlight'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'chronicle' : 'starlight'
  }

  const [resolvedTheme, setResolvedTheme] = createSignal<'chronicle' | 'starlight'>(
    theme() === 'system' ? getSystemTheme() : theme() as 'chronicle' | 'starlight'
  )

  // Listen for system theme changes
  createEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      if (theme() === 'system') {
        setResolvedTheme(getSystemTheme())
      }
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  })

  // Update resolved theme when theme changes
  createEffect(() => {
    const t = theme()
    if (t === 'system') {
      setResolvedTheme(getSystemTheme())
    } else {
      setResolvedTheme(t)
    }
  })

  const setTheme = (newTheme: ThemeName) => {
    setThemeSignal(newTheme)
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, newTheme)
    }
  }

  // Apply theme class to root element
  createEffect(() => {
    const resolved = resolvedTheme()
    const themeClass = themes[resolved]

    // Remove any existing theme classes and add the new one
    document.documentElement.classList.remove(chronicleTheme, starlightTheme)
    document.documentElement.classList.add(themeClass)
  })

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {props.children}
    </ThemeContext.Provider>
  )
}
