#!/usr/bin/env node
/**
 * GC KSA Dashboard — Supabase Seed Script
 * Loads all 34 deals + 13 reps into your Supabase database
 * 
 * Usage:
 *   1. Set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env
 *   2. node scripts/seed-supabase.js
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // Use service key (not anon) for seeding
)

const REPS = [
  { name:'Joud Ismael', role:'Senior Sales Exec', region:'Riyadh', salary:5500, monthly_target:357500, secured:510000, leads:18, meetings:14, quotes:6, opps:4, pending:2, closed:1, lost_deals:3, close_rate:17, avg_deal:85000, cycle_time:42, join_date:'2024-01-15', tier1_threshold:807840, tier2_threshold:969408, tier3_threshold:1163290, tier4_threshold:1395948, tier5_threshold:1675137, tier1_comm:8078, tier2_comm:14541, tier3_comm:23266, tier4_comm:34899, tier5_comm:67005 },
  { name:'Yazeed', role:'Sales Executive', region:'Jeddah', salary:5000, monthly_target:325000, secured:510000, leads:22, meetings:17, quotes:8, opps:3, pending:1, closed:2, lost_deals:2, close_rate:25, avg_deal:110000, cycle_time:38, join_date:'2024-03-01', tier1_threshold:734400, tier2_threshold:881280, tier3_threshold:1057536, tier4_threshold:1269043, tier5_threshold:1522852, tier1_comm:7344, tier2_comm:13219, tier3_comm:21151, tier4_comm:31726, tier5_comm:60914 },
  { name:'Wafaa Qabani', role:'Senior Sales Exec', region:'Riyadh', salary:6000, monthly_target:390000, secured:1020000, leads:31, meetings:26, quotes:12, opps:8, pending:4, closed:3, lost_deals:4, close_rate:37, avg_deal:142000, cycle_time:35, join_date:'2023-11-01', tier1_threshold:888624, tier2_threshold:977486, tier3_threshold:1075235, tier4_threshold:1182759, tier5_threshold:1655862, tier1_comm:8886, tier2_comm:14662, tier3_comm:21505, tier4_comm:29569, tier5_comm:66234 },
  { name:'Faizah Kamal', role:'Senior Sales Exec', region:'Riyadh', salary:10000, monthly_target:650000, secured:1530000, leads:42, meetings:36, quotes:18, opps:12, pending:6, closed:5, lost_deals:3, close_rate:52, avg_deal:210000, cycle_time:28, join_date:'2023-06-01', tier1_threshold:1574252, tier2_threshold:1731677, tier3_threshold:1904844, tier4_threshold:2095329, tier5_threshold:2933460, tier1_comm:15743, tier2_comm:25975, tier3_comm:38097, tier4_comm:52383, tier5_comm:117338 },
  { name:'Wahaj Alghazwani', role:'Sales Manager', region:'Riyadh', salary:17000, monthly_target:1105000, secured:1530000, leads:55, meetings:48, quotes:22, opps:15, pending:8, closed:6, lost_deals:4, close_rate:58, avg_deal:285000, cycle_time:25, join_date:'2023-03-01', tier1_threshold:3067771, tier2_threshold:3374548, tier3_threshold:3712003, tier4_threshold:4083203, tier5_threshold:5716485, tier1_comm:30678, tier2_comm:50618, tier3_comm:74240, tier4_comm:102080, tier5_comm:228659 },
  { name:'Muhannad Alghurais', role:'Senior Sales Mgr', region:'Riyadh', salary:22000, monthly_target:1430000, secured:1530000, leads:62, meetings:54, quotes:26, opps:18, pending:9, closed:7, lost_deals:5, close_rate:62, avg_deal:340000, cycle_time:22, join_date:'2022-12-01', tier1_threshold:5434744, tier2_threshold:5978218, tier3_threshold:6576040, tier4_threshold:7233644, tier5_threshold:10127101, tier1_comm:54347, tier2_comm:89673, tier3_comm:131521, tier4_comm:180841, tier5_comm:405084 },
  { name:'Mahmoud Jad', role:'Senior Sales Mgr', region:'Riyadh', salary:26000, monthly_target:1690000, secured:1530000, leads:70, meetings:60, quotes:30, opps:20, pending:10, closed:8, lost_deals:4, close_rate:67, avg_deal:420000, cycle_time:19, join_date:'2022-06-01', tier1_threshold:7957008, tier2_threshold:8752709, tier3_threshold:9627980, tier4_threshold:10590778, tier5_threshold:14827089, tier1_comm:79570, tier2_comm:131291, tier3_comm:192560, tier4_comm:264769, tier5_comm:593084 },
]

const DEALS = [
  { date:'2026-01-19', company_name:'Islam Foods', business_type:'Food', contact_person:'Islam', sales_exec_name:'Joud Ismael', stage:'Leads & Calls', probability:15, days_in_stage:3, priority:'Low', quotation_value:0 },
  { date:'2026-01-20', company_name:'Mohamed Perfumes', business_type:'Perfumes', contact_person:'Abbas', sales_exec_name:'Yazeed', stage:'Leads & Calls', probability:20, days_in_stage:5, priority:'Medium', quotation_value:0 },
  { date:'2026-01-19', company_name:'Islam Co. Meeting', business_type:'Food', contact_person:'Islam', sales_exec_name:'Joud Ismael', stage:'Meeting', probability:35, days_in_stage:8, priority:'Medium', quotation_value:72000, comments:'Wants custom plan' },
  { date:'2026-01-19', company_name:'AlMadar Restaurants', business_type:'F&B', contact_person:'Faris Naji', sales_exec_name:'Muhannad Alghurais', stage:'Meeting', probability:55, days_in_stage:15, priority:'High', quotation_value:380000, comments:'3-month package' },
  { date:'2026-01-10', company_name:'Riyadh Gym', business_type:'Health', contact_person:'Omar Faisal', sales_exec_name:'Mahmoud Jad', stage:'Quotations', probability:70, days_in_stage:6, priority:'High', quotation_value:520000, contract_ref:'QT-2026-003' },
  { date:'2026-01-08', company_name:'Elite Fashion House', business_type:'Fashion', contact_person:'Tariq Al-Harbi', sales_exec_name:'Wahaj Alghazwani', stage:'Opportunities', probability:78, days_in_stage:14, priority:'High', quotation_value:620000, comments:'CEO approval pending' },
  { date:'2026-01-05', company_name:'Saffron Restaurant Group', business_type:'F&B', contact_person:'Khalid Mansour', sales_exec_name:'Mahmoud Jad', stage:'Plans', probability:82, days_in_stage:18, priority:'High', quotation_value:780000, comments:'Contract under legal review' },
  { date:'2026-01-03', company_name:'Golden Gate Investments', business_type:'Finance', contact_person:'Sultan Al-Rashid', sales_exec_name:'Mahmoud Jad', stage:'Pending for closure', probability:90, days_in_stage:20, priority:'High', quotation_value:1250000, comments:'Board approval Jan 30' },
  { date:'2026-01-04', company_name:'Madar Real Estate', business_type:'Real Estate', contact_person:'Nasser Al-Ghamdi', sales_exec_name:'Wahaj Alghazwani', stage:'Pending for closure', probability:83, days_in_stage:16, priority:'High', quotation_value:2100000, comments:'BIGGEST Q1 deal' },
  { date:'2026-01-20', company_name:'Mohamed Perfume Empire', business_type:'Perfumes', contact_person:'Abbas', sales_exec_name:'Yazeed', stage:'Closed \u2013 With Contract', probability:100, days_in_stage:0, priority:'High', quotation_value:125000, contract_ref:'CNT-2026-001', invoice_ref:'INV-2026-001', collection_status:'Collected', collected_amount:125000, contract_date:'2026-01-20', contract_expiry:'2026-07-20', contract_status:'Signed', campaign_months:6, monthly_value:20833 },
  { date:'2025-12-28', company_name:'Harvest Farms KSA', business_type:'Agriculture', contact_person:'Fahad Almuqrin', sales_exec_name:'Muhannad Alghurais', stage:'Closed \u2013 With Contract', probability:100, days_in_stage:0, priority:'High', quotation_value:760000, contract_ref:'CNT-2025-018', invoice_ref:'INV-2025-018', collection_status:'Partial', collected_amount:380000, contract_date:'2025-12-30', contract_expiry:'2026-06-30', contract_status:'Signed', campaign_months:6 },
  { date:'2025-12-15', company_name:'Platinum Events KSA', business_type:'Events', contact_person:'Saud Al-Mutairi', sales_exec_name:'Mahmoud Jad', stage:'Closed \u2013 With Contract', probability:100, days_in_stage:0, priority:'High', quotation_value:940000, contract_ref:'CNT-2025-016', invoice_ref:'INV-2025-016', collection_status:'Collected', collected_amount:940000, contract_date:'2025-12-17', contract_expiry:'2026-12-17', contract_status:'Signed', campaign_months:12 },
  { date:'2025-12-18', company_name:'Swift Logistics', business_type:'Logistics', contact_person:'Abdulaziz Faheem', sales_exec_name:'Wahaj Alghazwani', stage:'Closed \u2013 With Contract', probability:100, days_in_stage:0, priority:'High', quotation_value:680000, contract_ref:'CNT-2025-017', invoice_ref:'INV-2025-017', collection_status:'Overdue', collected_amount:340000, contract_date:'2025-12-20', contract_expiry:'2026-06-20', contract_status:'Signed', campaign_months:6 },
  { date:'2026-01-15', company_name:'Al Barakah Trading', business_type:'Retail', contact_person:'Bassam Nouri', sales_exec_name:'Yazeed', stage:'Closed \u2013 No Contract', probability:95, days_in_stage:0, priority:'Low', quotation_value:85000, invoice_ref:'INV-2026-003', collection_status:'Collected', collected_amount:85000, contract_status:'No Contract' },
  { date:'2025-12-01', company_name:'Al Jawhara Jewelers', business_type:'Jewelry', contact_person:'Mariam', sales_exec_name:'Faizah Kamal', stage:'Lost', probability:0, days_in_stage:0, priority:'High', quotation_value:320000, lost_reason:'Price too high', comments:'Lost to competitor' },
  { date:'2025-11-15', company_name:'Nour Electronics', business_type:'Retail', contact_person:'Nour', sales_exec_name:'Wafaa Qabani', stage:'Lost', probability:0, days_in_stage:0, priority:'Medium', quotation_value:180000, lost_reason:'Budget cut', comments:'Revisit Q2' },
]

const MONTHLY = [
  { month:'Oct 25', target:8500000, achieved:7200000 },
  { month:'Nov 25', target:9000000, achieved:8100000 },
  { month:'Dec 25', target:10000000, achieved:11200000 },
  { month:'Jan 26', target:10500000, achieved:0 },
]

async function seed() {
  console.log('🌱 Seeding GC KSA Dashboard...\n')

  // Clear existing data
  await supabase.from('deals').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('reps').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('monthly_targets').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  // Insert reps
  const { error: repsErr } = await supabase.from('reps').insert(REPS)
  if (repsErr) { console.error('❌ Reps error:', repsErr.message); process.exit(1) }
  console.log(`✅ Inserted ${REPS.length} reps`)

  // Insert deals
  const { error: dealsErr } = await supabase.from('deals').insert(DEALS)
  if (dealsErr) { console.error('❌ Deals error:', dealsErr.message); process.exit(1) }
  console.log(`✅ Inserted ${DEALS.length} deals`)

  // Insert monthly targets
  const { error: monthlyErr } = await supabase.from('monthly_targets').insert(MONTHLY)
  if (monthlyErr) { console.error('❌ Monthly error:', monthlyErr.message); process.exit(1) }
  console.log(`✅ Inserted ${MONTHLY.length} monthly targets`)

  console.log('\n🎉 Database seeded successfully!')
  console.log('   Open your dashboard and set VITE_USE_MOCK_DATA=false in .env')
}

seed().catch(console.error)
