import { JSDOM } from 'jsdom'
import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { SettingsProvider, useSettings } from './SettingsContext'

describe('SettingsContext', () => {
  beforeEach(() => {
    const { window } = new JSDOM('<!doctype html><html><body></body></html>')
    const store = new Map<string, string>()
    Object.defineProperty(globalThis, 'window', { configurable: true, value: window })
    Object.defineProperty(globalThis, 'document', { configurable: true, value: window.document })
    Object.defineProperty(globalThis, 'navigator', { configurable: true, value: window.navigator })
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => { store.set(key, value) },
        removeItem: (key: string) => { store.delete(key) },
        clear: () => { store.clear() },
      },
    })
  })

  it('persists advanced TryGC settings to localStorage', () => {
    const { result } = renderHook(() => useSettings(), { wrapper: SettingsProvider })

    act(() => {
      result.current.updateSettings({
        defaultView: 'grid',
        rowsPerPage: 250,
        staleDealThresholdDays: 12,
        confirmDeletes: true,
      })
    })

    const stored = JSON.parse(localStorage.getItem('gc-ksa-settings-v3')!)
    expect(stored.defaultView).toBe('grid')
    expect(stored.defaultPageView).toBe('grid')
    expect(stored.rowsPerPage).toBe(250)
    expect(stored.staleDealThresholdDays).toBe(12)
    expect(stored.confirmDeletes).toBe(true)
  })
})
