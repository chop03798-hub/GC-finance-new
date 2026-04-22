import type { Deal, Rep } from './supabase'

export interface DealFieldOptions {
  companyOptions: string[]
  salesExecOptions: string[]
  brandOptions: string[]
  parentCompanyOptions: string[]
  brandToParentCompany: Map<string, string>
  companyProfiles: Map<string, Pick<Deal, 'brand_name' | 'parent_company_name'>>
}

const BRAND_PARENT_SEED: Record<string, string> = {
  Popeyes: 'Al-Tanmiya',
  'Krispy Kreme': 'Al-Tanmiya',
  "Hardee's": 'Americana',
  KFC: 'Americana',
}

function normalizeLookup(value?: string | null) {
  return value?.trim().toLowerCase() ?? ''
}

function sortOptions(values: Iterable<string>) {
  return [...new Set([...values].map((value) => value.trim()).filter(Boolean))]
    .sort((left, right) => left.localeCompare(right))
}

export function findCanonicalOption(options: string[], value?: string | null) {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) return ''
  const matched = options.find((option) => normalizeLookup(option) === normalizeLookup(trimmed))
  return matched ?? trimmed
}

export function buildDealFieldOptions(deals: Deal[], reps: Rep[]): DealFieldOptions {
  const companyOptions = sortOptions(deals.map((deal) => deal.company_name))
  const salesExecOptions = sortOptions([
    ...reps.map((rep) => rep.name),
    ...deals.map((deal) => deal.sales_exec_name),
  ])
  const brandOptions = sortOptions([
    ...Object.keys(BRAND_PARENT_SEED),
    ...deals.map((deal) => deal.brand_name ?? ''),
  ])
  const parentCompanyOptions = sortOptions([
    ...Object.values(BRAND_PARENT_SEED),
    ...deals.map((deal) => deal.parent_company_name ?? ''),
    ...companyOptions,
  ])

  const brandToParentCompany = new Map<string, string>(
    Object.entries(BRAND_PARENT_SEED).map(([brand, parentCompany]) => [normalizeLookup(brand), parentCompany]),
  )

  const companyProfiles = new Map<string, Pick<Deal, 'brand_name' | 'parent_company_name'>>()
  const latestDeals = [...deals].sort((left, right) => right.date.localeCompare(left.date))

  for (const deal of latestDeals) {
    const companyKey = normalizeLookup(deal.company_name)
    if (!companyKey) continue

    if (deal.brand_name && deal.parent_company_name) {
      brandToParentCompany.set(normalizeLookup(deal.brand_name), deal.parent_company_name)
    }

    const currentProfile = companyProfiles.get(companyKey) ?? {}
    companyProfiles.set(companyKey, {
      brand_name: currentProfile.brand_name || deal.brand_name,
      parent_company_name: currentProfile.parent_company_name || deal.parent_company_name,
    })
  }

  return {
    companyOptions,
    salesExecOptions,
    brandOptions,
    parentCompanyOptions,
    brandToParentCompany,
    companyProfiles,
  }
}

export function applyDealDataRules(currentDeal: Deal, patch: Partial<Deal>, fieldOptions: DealFieldOptions): Partial<Deal> {
  const nextPatch = { ...patch }

  if (typeof nextPatch.company_name === 'string') {
    nextPatch.company_name = findCanonicalOption(fieldOptions.companyOptions, nextPatch.company_name)
  }
  if (typeof nextPatch.sales_exec_name === 'string') {
    nextPatch.sales_exec_name = findCanonicalOption(fieldOptions.salesExecOptions, nextPatch.sales_exec_name)
  }
  if (typeof nextPatch.brand_name === 'string') {
    nextPatch.brand_name = findCanonicalOption(fieldOptions.brandOptions, nextPatch.brand_name)
  }
  if (typeof nextPatch.parent_company_name === 'string') {
    nextPatch.parent_company_name = findCanonicalOption(fieldOptions.parentCompanyOptions, nextPatch.parent_company_name)
  }

  const companyName = typeof nextPatch.company_name === 'string' ? nextPatch.company_name : currentDeal.company_name
  const brandName = typeof nextPatch.brand_name === 'string' ? nextPatch.brand_name : currentDeal.brand_name
  const parentCompanyName = typeof nextPatch.parent_company_name === 'string'
    ? nextPatch.parent_company_name
    : currentDeal.parent_company_name
  const brandWasUpdated = typeof nextPatch.brand_name === 'string'

  const brandParentCompany = brandName
    ? fieldOptions.brandToParentCompany.get(normalizeLookup(brandName))
    : undefined

  if (brandParentCompany && (brandWasUpdated || !parentCompanyName)) {
    nextPatch.parent_company_name = brandParentCompany
  }

  if (companyName) {
    const profile = fieldOptions.companyProfiles.get(normalizeLookup(companyName))
    if (!nextPatch.parent_company_name && !currentDeal.parent_company_name && profile?.parent_company_name) {
      nextPatch.parent_company_name = profile.parent_company_name
    }
    if (!nextPatch.brand_name && !currentDeal.brand_name && profile?.brand_name) {
      nextPatch.brand_name = profile.brand_name
    }
  }

  return nextPatch
}
