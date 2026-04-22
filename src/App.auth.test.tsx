// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import App from './App'

describe('App auth flow', () => {
  beforeEach(() => {
    const store = new Map<string, string>()
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => { store.set(key, value) },
        removeItem: (key: string) => { store.delete(key) },
        clear: () => { store.clear() },
      },
    })
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation(() => ({
      matches: false,
      media: '',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })))
  })

  it('renders the workspace after signing in with the seeded admin account', async () => {
    const { container } = render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))

    await Promise.resolve()

    expect(container.querySelector('.app-shell')).not.toBeNull()
    expect(screen.getByRole('button', { name: /overview/i })).toBeInTheDocument()
  }, 15000)
})
