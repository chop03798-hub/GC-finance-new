import { JSDOM } from 'jsdom'
import { describe, expect, it } from 'vitest'

import {
  LIGHT_THEME_CSS_VARIABLES,
  ROOT_THEME_CSS_VARIABLES,
  STAGE_COLOR_MAP,
  TRY_GC_THEME,
  installTryGcThemeVariables,
} from '../branding/tokens'
import { MOCK_DEALS, MOCK_MONTHLY, MOCK_REPS } from './data'
import { buildOkrs } from './okr'
import { commissionForRep, overviewMetrics } from './selectors'

describe('Task 2 branding token contract', () => {
  it('keeps the approved TryGC theme and pipeline stage palette in one shared token module', () => {
    expect(TRY_GC_THEME).toMatchObject({
      brand: {
        orange: '#E8630C',
        purple: '#52358C',
        purpleMid: '#7255B5',
        purpleLight: '#A798BF',
        orangeSoft: '#FDF2E9',
        purpleSoft: '#EEEAF4',
      },
      light: {
        bg: '#FBFAFC',
        card: '#FFFFFF',
        nav: '#FFFFFF',
      },
      dark: {
        bg: '#0D0818',
        card: '#160D2C',
        nav: '#0A0520',
      },
    })

    expect(Object.keys(STAGE_COLOR_MAP)).toEqual([
      'Leads & Calls',
      'Meeting',
      'Quotations',
      'Opportunities',
      'Plans',
      'Pending for closure',
      'Closed – With Contract',
      'Closed – No Contract',
      'Lost',
    ])

    expect(STAGE_COLOR_MAP['Leads & Calls']).toBe(TRY_GC_THEME.brand.purpleLight)
    expect(STAGE_COLOR_MAP.Meeting).toBe(TRY_GC_THEME.brand.purpleMid)
    expect(STAGE_COLOR_MAP.Plans).toBe(TRY_GC_THEME.brand.orange)
    expect(STAGE_COLOR_MAP['Pending for closure']).toBe('#EA580C')
  })

  it('derives css variable maps from the shared TryGC theme object', () => {
    expect(ROOT_THEME_CSS_VARIABLES['--o']).toBe(TRY_GC_THEME.brand.orange)
    expect(ROOT_THEME_CSS_VARIABLES['--p']).toBe(TRY_GC_THEME.brand.purple)
    expect(ROOT_THEME_CSS_VARIABLES['--bg']).toBe(TRY_GC_THEME.light.bg)
    expect(ROOT_THEME_CSS_VARIABLES['--card']).toBe(TRY_GC_THEME.light.card)
    expect(ROOT_THEME_CSS_VARIABLES['--nav']).toBe(TRY_GC_THEME.light.nav)

    expect(LIGHT_THEME_CSS_VARIABLES['--bg']).toBe(TRY_GC_THEME.light.bg)
    expect(LIGHT_THEME_CSS_VARIABLES['--card']).toBe(TRY_GC_THEME.light.card)
    expect(LIGHT_THEME_CSS_VARIABLES['--bd']).toBe(TRY_GC_THEME.light.border)
    expect(LIGHT_THEME_CSS_VARIABLES['--t']).toBe(TRY_GC_THEME.light.text1)
  })

  it('installs the light theme at root runtime and injects the dark theme override rule', () => {
    const { window } = new JSDOM('<!doctype html><html><head></head><body></body></html>')
    const { document } = window

    document.documentElement.removeAttribute('style')
    document.head.querySelector('#trygc-theme-vars')?.remove()

    installTryGcThemeVariables(document)

    const styleTag = document.head.querySelector('#trygc-theme-vars')
    expect(styleTag?.textContent).toContain(':root{color-scheme:light;')
    expect(styleTag?.textContent).toContain(`--bg:${TRY_GC_THEME.light.bg};`)
    expect(styleTag?.textContent).toContain(`--card:${TRY_GC_THEME.light.card};`)
    expect(styleTag?.textContent).toContain(`[data-theme='dark']{color-scheme:dark;`)
    expect(styleTag?.textContent).toContain(`--bg:${TRY_GC_THEME.dark.bg};`)
  })

  it('computes the highest tier commission using explicit thresholds', () => {
    const topRep = MOCK_REPS.find((rep) => rep.name === 'Mahmoud Jad')!
    expect(commissionForRep(topRep).tier).toBe(5)
    expect(commissionForRep(topRep).commission).toBe(593084)
  })

  it('builds overview metrics from shared selectors', () => {
    const metrics = overviewMetrics(MOCK_DEALS, MOCK_REPS, MOCK_MONTHLY)
    expect(metrics.primary.pipelineValue).toBeGreaterThan(0)
    expect(metrics.secondary.alertCount).toBeGreaterThanOrEqual(0)
    expect(metrics.primary.commissionPool).toBeGreaterThan(0)
  })

  it('builds 10 OKRs from shared data', () => {
    const okrs = buildOkrs(MOCK_DEALS, MOCK_REPS, MOCK_MONTHLY)
    expect(okrs).toHaveLength(10)
  })
})
