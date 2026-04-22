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
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        user: {
          id: 'user-admin',
          name: 'Admin Operator',
          email: 'admin@trygc.local',
          role: 'super_admin',
          region: 'All Regions',
        },
      }),
    }))
  })

  it('renders the workspace after signing in with the server-backed admin account', async () => {
    const { container } = render(<App />)

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'admin@trygc.local' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'admin123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))

    expect(await screen.findByRole('button', { name: /overview/i })).toBeInTheDocument()
    expect(container.querySelector('.app-shell')).not.toBeNull()
  }, 15000)
})
