import { describe, expect, it } from 'vitest'
import { MOCK_DEALS, MOCK_MONTHLY, MOCK_REPS } from './data'
import { buildOkrs } from './okr'

describe('OKR helpers', () => {
  it('builds 10 OKRs from shared data', () => {
    const okrs = buildOkrs(MOCK_DEALS, MOCK_REPS, MOCK_MONTHLY)
    expect(okrs).toHaveLength(10)
    expect(okrs.every((okr) => okr.progress >= 0 && okr.progress <= 100)).toBe(true)
  })
})
