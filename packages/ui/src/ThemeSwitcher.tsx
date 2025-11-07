'use client'

import { useTheme } from './ThemeProvider'

const accents = [
  { value: 'sage', label: 'Sage', color: 'rgb(94, 186, 108)' },
  { value: 'lavender', label: 'Lavender', color: 'rgb(168, 119, 227)' },
  { value: 'sand', label: 'Sand', color: 'rgb(228, 175, 84)' },
] as const

export function ThemeSwitcher() {
  const { accent, setAccent } = useTheme()

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground font-medium">Accent:</span>
      <div className="flex gap-2">
        {accents.map((item) => (
          <button
            key={item.value}
            onClick={() => setAccent(item.value)}
            className={`
              w-8 h-8 rounded-full border-2 transition-all duration-base
              ${accent === item.value ? 'border-foreground scale-110' : 'border-border hover:scale-105'}
            `}
            style={{ backgroundColor: item.color }}
            title={item.label}
            aria-label={`Set ${item.label} accent`}
          />
        ))}
      </div>
    </div>
  )
}
