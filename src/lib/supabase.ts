import { createClient } from '@supabase/supabase-js'

// ── Replace these with your Supabase project credentials ──────────────────
// 1. Go to https://supabase.com → New Project
// 2. Settings → API → copy "Project URL" and "anon public" key
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://YOUR_PROJECT.supabase.co'
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ── Database types ─────────────────────────────────────────────────────────
export type Stage =
  | 'Leads & Calls'
  | 'Meeting'
  | 'Quotations'
  | 'Opportunities'
  | 'Plans'
  | 'Pending for closure'
  | 'Closed – With Contract'
  | 'Closed – No Contract'
  | 'Lost'

export type Priority = 'High' | 'Medium' | 'Low'
export type CollectionStatus = 'Pending' | 'Partial' | 'Collected' | 'Overdue'
export type ContractStatus = 'Signed' | 'Pending Signature' | 'No Contract' | 'Expired' | 'Renewed'

export interface Deal {
  id: string
  created_at?: string
  date: string
  company_name: string
  parent_company_name?: string
  brand_name?: string
  instagram_account?: string
  business_type: string
  contact_person: string
  designation?: string
  mobile_number?: string
  email?: string
  sales_exec_name: string
  status?: string
  stage: Stage
  probability: number
  days_in_stage: number
  priority: Priority
  quotation_value: number
  contract_ref?: string
  invoice_ref?: string
  collection_status?: CollectionStatus
  collected_amount?: number
  contract_date?: string
  contract_expiry?: string
  contract_status?: ContractStatus
  campaign_months?: number
  monthly_value?: number
  lost_reason?: string
  comments?: string
}

export interface Rep {
  id: string
  created_at?: string
  name: string
  role: string
  region: string
  salary: number
  monthly_target: number
  secured: number
  leads: number
  meetings: number
  quotes: number
  opps: number
  pending: number
  closed: number
  lost_deals: number
  close_rate: number
  avg_deal: number
  cycle_time: number
  join_date: string
  tier1_threshold: number
  tier2_threshold: number
  tier3_threshold: number
  tier4_threshold: number
  tier5_threshold: number
  tier1_comm: number
  tier2_comm: number
  tier3_comm: number
  tier4_comm: number
  tier5_comm: number
  email?: string
  phone?: string
  total_commission_paid: number
  last_payment_date?: string
  payment_status: 'pending' | 'paid' | 'partial'
}

export interface MonthlyTarget {
  id: string
  month: string
  target: number
  achieved: number
}

export interface ClientFeedback {
  id: string
  created_at?: string
  client_id: string
  feedback_text: string
  rating: number
  feedback_date: string
}
