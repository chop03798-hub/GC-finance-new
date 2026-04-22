import { describe, expect, it } from 'vitest'

import { DEFAULT_SETTINGS, coerceSettings } from './workspace'

describe('workspace defaults', () => {
  it('uses light theme by default for the refreshed workspace shell', () => {
    expect(DEFAULT_SETTINGS.theme).toBe('light')
  })

  it('falls back to light theme when older settings stored dark as the implicit default', () => {
    expect(coerceSettings({ theme: 'light' })?.theme).toBe('light')
    expect(coerceSettings({})?.theme).toBe('light')
  })
})
