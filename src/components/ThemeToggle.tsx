import { useState } from 'react'
import { MoonIcon, SunIcon } from 'lucide-react'
import { Switch } from '@/components/ui/switch'

/** localStorage key; the inline script in web/templates/web/index.html reads it before first paint. */
export const THEME_STORAGE_KEY = 'theme'

/**
 * Light/dark switch fixed to the top-right corner. The page template has already set the `.dark`
 * class on <html> from the saved choice or the system preference, so the starting state is
 * read from there instead of being worked out again.
 */
export function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

  const change = (next: boolean) => {
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next ? 'dark' : 'light')
    } catch {
      // Storage blocked: the choice lasts until reload.
    }
  }

  return (
    <div className="fixed top-3 right-3 z-10 flex items-center gap-1.5 text-muted-foreground">
      <SunIcon aria-hidden="true" className="size-4" />
      <Switch aria-label="Dark mode" checked={dark} onCheckedChange={change} />
      <MoonIcon aria-hidden="true" className="size-4" />
    </div>
  )
}
