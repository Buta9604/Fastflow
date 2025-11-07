'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type AccentColor = 'sage' | 'lavender' | 'sand'

interface ThemeContextType {
  accent: AccentColor
  setAccent: (accent: AccentColor) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
  defaultAccent?: AccentColor
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultAccent = 'sage',
  storageKey = 'flatflow-accent',
}: ThemeProviderProps) {
  const [accent, setAccentState] = useState<AccentColor>(defaultAccent)
  const [mounted, setMounted] = useState(false)

  // Load accent from localStorage on mount
  useEffect(() => {
    setMounted(true)
    try {
      const stored = localStorage.getItem(storageKey) as AccentColor | null
      if (stored && ['sage', 'lavender', 'sand'].includes(stored)) {
        setAccentState(stored)
        document.documentElement.setAttribute('data-accent', stored)
      } else {
        document.documentElement.setAttribute('data-accent', defaultAccent)
      }
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error)
    }
  }, [defaultAccent, storageKey])

  // Update accent color
  const setAccent = (newAccent: AccentColor) => {
    try {
      setAccentState(newAccent)
      document.documentElement.setAttribute('data-accent', newAccent)
      localStorage.setItem(storageKey, newAccent)
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error)
    }
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={{ accent, setAccent }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
