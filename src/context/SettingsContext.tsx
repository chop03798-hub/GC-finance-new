import { createContext, useContext, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { DEFAULT_SETTINGS, SETTINGS_KEY, coerceSettings, LEGACY_SETTINGS_KEY } from '../lib/workspace'

interface SettingsContextValue {
  settings: typeof DEFAULT_SETTINGS
  updateSettings: (patch: Partial<typeof DEFAULT_SETTINGS>) => void
  resetSettings: () => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

function loadInitialSettings() {
  const next = coerceSettings(localStorage.getItem(SETTINGS_KEY))
  if (next) return next

  const legacy = coerceSettings(localStorage.getItem(LEGACY_SETTINGS_KEY))
  if (legacy) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(legacy))
    return legacy
  }

  return DEFAULT_SETTINGS
}

export function SettingsProvider({ children }: PropsWithChildren) {
  const [settings, setSettings] = useState(loadInitialSettings)

  const value = useMemo<SettingsContextValue>(() => ({
    settings,
    updateSettings: (patch) => {
      setSettings((current) => {
        const next = coerceSettings({ ...current, ...patch }) ?? current
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
        return next
      })
    },
    resetSettings: () => {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS))
      setSettings(DEFAULT_SETTINGS)
    },
  }), [settings])

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) throw new Error('useSettings must be used within SettingsProvider')
  return context
}
