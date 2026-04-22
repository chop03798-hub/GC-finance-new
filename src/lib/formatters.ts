import type { AppSettings } from './workspace'

export function formatCurrency(value: number, settings: Pick<AppSettings, 'currency' | 'showCurrencyCode' | 'numberFormat' | 'compactNumbers'>) {
  const formatter = new Intl.NumberFormat(settings.numberFormat, {
    notation: settings.compactNumbers ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  })
  const formatted = formatter.format(value)
  return settings.showCurrencyCode ? `${settings.currency} ${formatted}` : formatted
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`
}

export function formatDate(value: string, settings: Pick<AppSettings, 'dateFormat'>) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')

  switch (settings.dateFormat) {
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`
    default:
      return `${day}/${month}/${year}`
  }
}
