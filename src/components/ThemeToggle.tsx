import { useEffect, useState } from 'react'

const THEMES = ['emerald', 'dark'] as const

type Theme = (typeof THEMES)[number]

function getInitialTheme(): Theme {
  const fromStorage = localStorage.getItem('theme') as Theme | null
  if (fromStorage && THEMES.includes(fromStorage)) return fromStorage
  return 'emerald'
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme())

  useEffect(() => {
    document.body.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <div className="join">
      {THEMES.map((t) => (
        <button
          key={t}
          type="button"
          className={`btn join-item ${theme === t ? 'btn-primary' : ''}`}
          onClick={() => setTheme(t)}
        >
          {t}
        </button>
      ))}
    </div>
  )
}
