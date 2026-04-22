import type { Deal, Rep, MonthlyTarget, ClientFeedback, Stage } from './supabase'

// ── SEED DATA (mirrors your v9 dashboard) ─────────────────────────────────
const BASE_MOCK_REPS = [
  { id:'r1', name:'Joud Ismael', role:'Senior Sales Exec', region:'Riyadh', salary:5500, monthly_target:357500, secured:510000, leads:18, meetings:14, quotes:6, opps:4, pending:2, closed:1, lost_deals:3, close_rate:17, avg_deal:85000, cycle_time:42, join_date:'2024-01-15', tier1_threshold:807840, tier2_threshold:969408, tier3_threshold:1163290, tier4_threshold:1395948, tier5_threshold:1675137, tier1_comm:8078, tier2_comm:14541, tier3_comm:23266, tier4_comm:34899, tier5_comm:67005 },
  { id:'r2', name:'Yazeed', role:'Sales Executive', region:'Jeddah', salary:5000, monthly_target:325000, secured:510000, leads:22, meetings:17, quotes:8, opps:3, pending:1, closed:2, lost_deals:2, close_rate:25, avg_deal:110000, cycle_time:38, join_date:'2024-03-01', tier1_threshold:734400, tier2_threshold:881280, tier3_threshold:1057536, tier4_threshold:1269043, tier5_threshold:1522852, tier1_comm:7344, tier2_comm:13219, tier3_comm:21151, tier4_comm:31726, tier5_comm:60914 },
  { id:'r3', name:'Wafaa Qabani', role:'Senior Sales Exec', region:'Riyadh', salary:6000, monthly_target:390000, secured:1020000, leads:31, meetings:26, quotes:12, opps:8, pending:4, closed:3, lost_deals:4, close_rate:37, avg_deal:142000, cycle_time:35, join_date:'2023-11-01', tier1_threshold:888624, tier2_threshold:977486, tier3_threshold:1075235, tier4_threshold:1182759, tier5_threshold:1655862, tier1_comm:8886, tier2_comm:14662, tier3_comm:21505, tier4_comm:29569, tier5_comm:66234 },
  { id:'r4', name:'Moataz Alshahrani', role:'Sales Executive', region:'Dammam', salary:6500, monthly_target:422500, secured:1020000, leads:28, meetings:21, quotes:10, opps:6, pending:3, closed:2, lost_deals:3, close_rate:29, avg_deal:165000, cycle_time:44, join_date:'2024-02-15', tier1_threshold:977486, tier2_threshold:1075235, tier3_threshold:1182759, tier4_threshold:1301034, tier5_threshold:1821448, tier1_comm:9775, tier2_comm:16129, tier3_comm:23655, tier4_comm:32526, tier5_comm:72858 },
  { id:'r5', name:'Abdullah Alamoudi', role:'Sales Executive', region:'Riyadh', salary:7000, monthly_target:455000, secured:1020000, leads:35, meetings:29, quotes:14, opps:9, pending:5, closed:4, lost_deals:2, close_rate:44, avg_deal:185000, cycle_time:31, join_date:'2023-09-01', tier1_threshold:1075235, tier2_threshold:1182759, tier3_threshold:1301034, tier4_threshold:1431138, tier5_threshold:2003593, tier1_comm:10752, tier2_comm:17741, tier3_comm:26021, tier4_comm:35778, tier5_comm:80144 },
  { id:'r6', name:'Faizah Kamal', role:'Senior Sales Exec', region:'Riyadh', salary:10000, monthly_target:650000, secured:1530000, leads:42, meetings:36, quotes:18, opps:12, pending:6, closed:5, lost_deals:3, close_rate:52, avg_deal:210000, cycle_time:28, join_date:'2023-06-01', tier1_threshold:1574252, tier2_threshold:1731677, tier3_threshold:1904844, tier4_threshold:2095329, tier5_threshold:2933460, tier1_comm:15743, tier2_comm:25975, tier3_comm:38097, tier4_comm:52383, tier5_comm:117338 },
  { id:'r7', name:'Wahaj Alghazwani', role:'Sales Manager', region:'Riyadh', salary:17000, monthly_target:1105000, secured:1530000, leads:55, meetings:48, quotes:22, opps:15, pending:8, closed:6, lost_deals:4, close_rate:58, avg_deal:285000, cycle_time:25, join_date:'2023-03-01', tier1_threshold:3067771, tier2_threshold:3374548, tier3_threshold:3712003, tier4_threshold:4083203, tier5_threshold:5716485, tier1_comm:30678, tier2_comm:50618, tier3_comm:74240, tier4_comm:102080, tier5_comm:228659 },
  { id:'r8', name:'Alanoud Alharbi', role:'Sales Executive', region:'Jeddah', salary:8000, monthly_target:520000, secured:1020000, leads:33, meetings:27, quotes:11, opps:7, pending:3, closed:3, lost_deals:2, close_rate:38, avg_deal:155000, cycle_time:37, join_date:'2024-01-01', tier1_threshold:1301034, tier2_threshold:1431138, tier3_threshold:1574252, tier4_threshold:1731677, tier5_threshold:2424347, tier1_comm:13010, tier2_comm:21467, tier3_comm:31485, tier4_comm:43292, tier5_comm:96974 },
  { id:'r9', name:'Sara Alzahrani', role:'Senior Sales Exec', region:'Riyadh', salary:10000, monthly_target:650000, secured:1530000, leads:40, meetings:33, quotes:16, opps:10, pending:5, closed:4, lost_deals:3, close_rate:48, avg_deal:195000, cycle_time:30, join_date:'2023-08-15', tier1_threshold:1182759, tier2_threshold:1301034, tier3_threshold:1431138, tier4_threshold:1574252, tier5_threshold:2203952, tier1_comm:11828, tier2_comm:19516, tier3_comm:28623, tier4_comm:39356, tier5_comm:88158 },
  { id:'r10', name:'Muhannad Alghurais', role:'Senior Sales Mgr', region:'Riyadh', salary:22000, monthly_target:1430000, secured:1530000, leads:62, meetings:54, quotes:26, opps:18, pending:9, closed:7, lost_deals:5, close_rate:62, avg_deal:340000, cycle_time:22, join_date:'2022-12-01', tier1_threshold:5434744, tier2_threshold:5978218, tier3_threshold:6576040, tier4_threshold:7233644, tier5_threshold:10127101, tier1_comm:54347, tier2_comm:89673, tier3_comm:131521, tier4_comm:180841, tier5_comm:405084 },
  { id:'r11', name:'Mahmoud Jad', role:'Senior Sales Mgr', region:'Riyadh', salary:26000, monthly_target:1690000, secured:14827089, leads:70, meetings:60, quotes:30, opps:20, pending:10, closed:8, lost_deals:4, close_rate:67, avg_deal:420000, cycle_time:19, join_date:'2022-06-01', tier1_threshold:7957008, tier2_threshold:8752709, tier3_threshold:9627980, tier4_threshold:10590778, tier5_threshold:14827089, tier1_comm:79570, tier2_comm:131291, tier3_comm:192560, tier4_comm:264769, tier5_comm:593084 },
  { id:'r12', name:'Hossam Tahoun', role:'Senior Sales Exec', region:'Dammam', salary:18000, monthly_target:1170000, secured:1530000, leads:48, meetings:41, quotes:19, opps:13, pending:7, closed:5, lost_deals:4, close_rate:55, avg_deal:245000, cycle_time:27, join_date:'2023-04-01', tier1_threshold:3374548, tier2_threshold:3712003, tier3_threshold:4083203, tier4_threshold:4491524, tier5_threshold:6288133, tier1_comm:33745, tier2_comm:55680, tier3_comm:81664, tier4_comm:112288, tier5_comm:251525 },
  { id:'r13', name:'Meshari Alghamdi', role:'Sales Executive', region:'Jeddah', salary:19500, monthly_target:1267500, secured:1530000, leads:52, meetings:44, quotes:21, opps:14, pending:7, closed:6, lost_deals:3, close_rate:59, avg_deal:265000, cycle_time:24, join_date:'2023-07-15', tier1_threshold:4083203, tier2_threshold:4491524, tier3_threshold:4940676, tier4_threshold:5434744, tier5_threshold:7608641, tier1_comm:40832, tier2_comm:67373, tier3_comm:98814, tier4_comm:135869, tier5_comm:304346 },
] satisfies Array<Omit<Rep, 'total_commission_paid' | 'payment_status'>>

export const MOCK_REPS: Rep[] = BASE_MOCK_REPS.map((rep) => ({
  ...rep,
  total_commission_paid: 0,
  payment_status: 'pending',
}))

export const MOCK_DEALS: Deal[] = [
  { id:'d1', date:'2026-01-19', company_name:'Islam Foods', instagram_account:'@islamfood', business_type:'Food', contact_person:'Islam', designation:'Marketing Mgr', mobile_number:'0580346143', email:'islam@islamfoods.sa', sales_exec_name:'Joud Ismael', status:'Interested', stage:'Leads & Calls', probability:15, days_in_stage:3, priority:'Low', quotation_value:0, comments:'' },
  { id:'d2', date:'2026-01-20', company_name:'Mohamed Perfumes', instagram_account:'@mohperfume', business_type:'Perfumes', contact_person:'Abbas', designation:'CEO', mobile_number:'0580346143', email:'abbass@mohperfumes.sa', sales_exec_name:'Yazeed', status:'Interested', stage:'Leads & Calls', probability:20, days_in_stage:5, priority:'Medium', quotation_value:0, comments:'' },
  { id:'d3', date:'2026-01-19', company_name:'Islam Co. Meeting', instagram_account:'@islamfood2', business_type:'Food', contact_person:'Islam', designation:'Marketing', mobile_number:'0580346143', email:'islamq@islamfoods.sa', sales_exec_name:'Joud Ismael', status:'Interested', stage:'Meeting', probability:35, days_in_stage:8, priority:'Medium', quotation_value:72000, comments:'Wants custom plan' },
  { id:'d4', date:'2026-01-19', company_name:'AlMadar Restaurants', instagram_account:'@almadarrest', business_type:'F&B', contact_person:'Faris Naji', designation:'Ops Manager', mobile_number:'0541234567', email:'faris@almadar.sa', sales_exec_name:'Muhannad Alghurais', status:'Interested', stage:'Meeting', probability:55, days_in_stage:15, priority:'High', quotation_value:380000, comments:'3-month package' },
  { id:'d5', date:'2026-01-10', company_name:'Riyadh Gym', instagram_account:'@riyadhgym', business_type:'Health', contact_person:'Omar Faisal', designation:'GM', mobile_number:'0554321987', email:'omar@riyadhgym.sa', sales_exec_name:'Mahmoud Jad', status:'Interested', stage:'Quotations', probability:70, days_in_stage:6, priority:'High', quotation_value:520000, contract_ref:'QT-2026-003', comments:'6-month commitment' },
  { id:'d6', date:'2026-01-12', company_name:'Spark Digital Agency', instagram_account:'@sparkdigital', business_type:'Marketing', contact_person:'Nadia Hassan', designation:'CEO', mobile_number:'0558765432', email:'nadia@sparkdigital.sa', sales_exec_name:'Wahaj Alghazwani', status:'Interested', stage:'Quotations', probability:65, days_in_stage:8, priority:'High', quotation_value:310000, contract_ref:'QT-2026-004', comments:'' },
  { id:'d7', date:'2026-01-08', company_name:'Elite Fashion House', instagram_account:'@elitefashion_ksa', business_type:'Fashion', contact_person:'Tariq Al-Harbi', designation:'Director', mobile_number:'0546789012', email:'tariq@elitefashion.sa', sales_exec_name:'Meshari Alghamdi', status:'Interested', stage:'Opportunities', probability:78, days_in_stage:14, priority:'High', quotation_value:620000, comments:'CEO approval pending' },
  { id:'d8', date:'2026-01-09', company_name:'Royal Dates Company', instagram_account:'@royaldates', business_type:'Food', contact_person:'Abdullah Said', designation:'Export Mgr', mobile_number:'0551234560', email:'asaid@royaldates.sa', sales_exec_name:'Faizah Kamal', status:'Interested', stage:'Opportunities', probability:75, days_in_stage:12, priority:'High', quotation_value:450000, comments:'' },
  { id:'d9', date:'2026-01-05', company_name:'Saffron Restaurant Group', instagram_account:'@saffrongroup', business_type:'F&B', contact_person:'Khalid Mansour', designation:'CEO', mobile_number:'0547891234', email:'kmansour@saffron.sa', sales_exec_name:'Mahmoud Jad', status:'Interested', stage:'Plans', probability:82, days_in_stage:18, priority:'High', quotation_value:780000, comments:'Contract under legal review' },
  { id:'d10', date:'2026-01-07', company_name:'Sahari Beauty Studio', instagram_account:'@saharibeauty', business_type:'Beauty', contact_person:'Raneem Khalil', designation:'Founder', mobile_number:'0545678901', email:'raneem@sahari.sa', sales_exec_name:'Wafaa Qabani', status:'Interested', stage:'Plans', probability:79, days_in_stage:16, priority:'Medium', quotation_value:295000, comments:'' },
  { id:'d11', date:'2026-01-03', company_name:'Golden Gate Investments', instagram_account:'@goldengateKSA', business_type:'Finance', contact_person:'Sultan Al-Rashid', designation:'Director', mobile_number:'0542345678', email:'sultan@goldengate.sa', sales_exec_name:'Mahmoud Jad', status:'Interested', stage:'Pending for closure', probability:90, days_in_stage:20, priority:'High', quotation_value:1250000, comments:'Board approval Jan 30' },
  { id:'d12', date:'2026-01-04', company_name:'Oud & Musk House', instagram_account:'@oudmusk', business_type:'Perfumes', contact_person:'Waleed Alsharif', designation:'MD', mobile_number:'0543456789', email:'waleed@oudmusk.sa', sales_exec_name:'Meshari Alghamdi', status:'Interested', stage:'Pending for closure', probability:85, days_in_stage:19, priority:'High', quotation_value:860000, comments:'' },
  { id:'d13', date:'2026-01-07', company_name:'Madar Real Estate', instagram_account:'@madarrealty', business_type:'Real Estate', contact_person:'Nasser Al-Ghamdi', designation:'CEO', mobile_number:'0549876543', email:'nasser@madar.sa', sales_exec_name:'Wahaj Alghazwani', status:'Interested', stage:'Pending for closure', probability:83, days_in_stage:16, priority:'High', quotation_value:2100000, comments:'BIGGEST Q1 deal' },
  { id:'d14', date:'2026-01-20', company_name:'Mohamed Perfume Empire', instagram_account:'@mohempire', business_type:'Perfumes', contact_person:'Abbas', designation:'CEO', mobile_number:'0580346143', email:'abbasclosed@mp.sa', sales_exec_name:'Yazeed', status:'Closed', stage:'Closed – With Contract', probability:100, days_in_stage:0, priority:'High', quotation_value:125000, contract_ref:'CNT-2026-001', invoice_ref:'INV-2026-001', collection_status:'Collected', collected_amount:125000, contract_date:'2026-01-20', contract_expiry:'2026-07-20', contract_status:'Signed', campaign_months:6, monthly_value:20833 },
  { id:'d15', date:'2025-12-28', company_name:'Harvest Farms KSA', instagram_account:'@harvestfarms', business_type:'Agriculture', contact_person:'Fahad Almuqrin', designation:'Director', mobile_number:'0550987654', email:'fahad@harvest.sa', sales_exec_name:'Muhannad Alghurais', status:'Closed', stage:'Closed – With Contract', probability:100, days_in_stage:0, priority:'High', quotation_value:760000, contract_ref:'CNT-2025-018', invoice_ref:'INV-2025-018', collection_status:'Partial', collected_amount:380000, contract_date:'2025-12-30', contract_expiry:'2026-06-30', contract_status:'Signed', campaign_months:6, monthly_value:126667 },
  { id:'d16', date:'2026-01-10', company_name:'Royale Cake Studio', instagram_account:'@royalecake', business_type:'Bakery', contact_person:'Hana Al-Zahrawi', designation:'Founder', mobile_number:'0552109876', email:'hana@royalecake.sa', sales_exec_name:'Faizah Kamal', status:'Closed', stage:'Closed – With Contract', probability:100, days_in_stage:0, priority:'High', quotation_value:380000, contract_ref:'CNT-2026-002', invoice_ref:'INV-2026-002', collection_status:'Pending', collected_amount:0, contract_date:'2026-01-12', contract_expiry:'2026-07-12', contract_status:'Signed', campaign_months:6, monthly_value:63333 },
  { id:'d17', date:'2025-12-15', company_name:'Platinum Events KSA', instagram_account:'@platevents', business_type:'Events', contact_person:'Saud Al-Mutairi', designation:'CEO', mobile_number:'0553210987', email:'saud@platevents.sa', sales_exec_name:'Mahmoud Jad', status:'Closed', stage:'Closed – With Contract', probability:100, days_in_stage:0, priority:'High', quotation_value:940000, contract_ref:'CNT-2025-016', invoice_ref:'INV-2025-016', collection_status:'Collected', collected_amount:940000, contract_date:'2025-12-17', contract_expiry:'2026-12-17', contract_status:'Signed', campaign_months:12, monthly_value:78333 },
  { id:'d18', date:'2025-12-18', company_name:'Swift Logistics', instagram_account:'@swiftlog', business_type:'Logistics', contact_person:'Abdulaziz Faheem', designation:'Ops Head', mobile_number:'0554321098', email:'abf@swiftlog.sa', sales_exec_name:'Wahaj Alghazwani', status:'Closed', stage:'Closed – With Contract', probability:100, days_in_stage:0, priority:'High', quotation_value:680000, contract_ref:'CNT-2025-017', invoice_ref:'INV-2025-017', collection_status:'Overdue', collected_amount:340000, contract_date:'2025-12-20', contract_expiry:'2026-06-20', contract_status:'Signed', campaign_months:6, monthly_value:113333 },
  { id:'d19', date:'2026-01-15', company_name:'Al Barakah Trading', instagram_account:'@albarakah', business_type:'Retail', contact_person:'Bassam Nouri', designation:'Owner', mobile_number:'0545678901', email:'bassam@albarakah.sa', sales_exec_name:'Yazeed', status:'Closed', stage:'Closed – No Contract', probability:95, days_in_stage:0, priority:'Low', quotation_value:85000, invoice_ref:'INV-2026-003', collection_status:'Collected', collected_amount:85000, contract_status:'No Contract', campaign_months:1, monthly_value:85000 },
  { id:'d20', date:'2025-12-10', company_name:'Sama Sweets', instagram_account:'@samasweets', business_type:'Bakery', contact_person:'Sama', designation:'Founder', mobile_number:'0556781234', email:'sama@samasweets.sa', sales_exec_name:'Wafaa Qabani', status:'Closed', stage:'Closed – No Contract', probability:95, days_in_stage:0, priority:'Low', quotation_value:45000, invoice_ref:'INV-2025-020', collection_status:'Collected', collected_amount:45000, contract_status:'No Contract', campaign_months:1, monthly_value:45000 },
  { id:'d21', date:'2025-12-01', company_name:'Al Jawhara Jewelers', instagram_account:'@aljawhara', business_type:'Jewelry', contact_person:'Mariam', designation:'Owner', mobile_number:'0551234567', email:'mariam@aljawhara.sa', sales_exec_name:'Sara Alzahrani', status:'Lost', stage:'Lost', probability:0, days_in_stage:0, priority:'High', quotation_value:320000, lost_reason:'Price too high', comments:'Lost to competitor – 30% cheaper' },
  { id:'d22', date:'2025-11-15', company_name:'Nour Electronics', instagram_account:'@nourelectronics', business_type:'Retail', contact_person:'Nour', designation:'CEO', mobile_number:'0554321098', email:'nour@electronics.sa', sales_exec_name:'Abdullah Alamoudi', status:'Lost', stage:'Lost', probability:0, days_in_stage:0, priority:'Medium', quotation_value:180000, lost_reason:'Budget cut', comments:'Company restructuring – revisit Q2' },
  { id:'d23', date:'2025-12-10', company_name:'Harb Coffee Roasters', instagram_account:'@harbcoffee', business_type:'F&B', contact_person:'Ahmad Harb', designation:'Founder', mobile_number:'0557890123', email:'ahmad@harbcoffee.sa', sales_exec_name:'Hossam Tahoun', status:'Lost', stage:'Lost', probability:0, days_in_stage:0, priority:'Low', quotation_value:95000, lost_reason:'Went to competitor', comments:'Follow up in 6 months' },
]

export const MOCK_MONTHLY: MonthlyTarget[] = [
  { id:'m1', month:'Oct 25', target:8500000, achieved:7200000 },
  { id:'m2', month:'Nov 25', target:9000000, achieved:8100000 },
  { id:'m3', month:'Dec 25', target:10000000, achieved:11200000 },
  { id:'m4', month:'Jan 26', target:10500000, achieved:0 },
]

export const MOCK_FEEDBACKS: ClientFeedback[] = [
  { id:'f1', client_id:'d1', feedback_text:'Great service, very responsive.', rating:5, feedback_date:'2026-01-20' },
  { id:'f2', client_id:'d2', feedback_text:'Good communication, but pricing could be better.', rating:4, feedback_date:'2026-01-21' },
  { id:'f3', client_id:'d3', feedback_text:'Excellent results, highly recommend.', rating:5, feedback_date:'2026-01-22' },
]

// ── Computed helpers ────────────────────────────────────────────────────────
export function repTier(rep: Rep) {
  const s = rep.secured
  if (s >= rep.tier5_threshold) return { tier: 5, comm: rep.tier5_comm }
  if (s >= rep.tier4_threshold) return { tier: 4, comm: rep.tier4_comm }
  if (s >= rep.tier3_threshold) return { tier: 3, comm: rep.tier3_comm }
  if (s >= rep.tier2_threshold) return { tier: 2, comm: rep.tier2_comm }
  if (s >= rep.tier1_threshold) return { tier: 1, comm: rep.tier1_comm }
  return { tier: 0, comm: 0 }
}

export function fmtSAR(n: number) {
  return `SAR ${n.toLocaleString('en-SA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export function fmtK(n: number) {
  if (n >= 1_000_000) return `${(n/1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n/1_000).toFixed(0)}K`
  return String(n)
}

export const STAGE_ORDER: Stage[] = [
  'Leads & Calls','Meeting','Quotations','Opportunities','Plans',
  'Pending for closure','Closed – With Contract','Closed – No Contract','Lost',
]

export const STAGE_COLORS: Record<Stage, string> = {
  'Leads & Calls':           '#6366f1',
  'Meeting':                 '#8b5cf6',
  'Quotations':              '#f59e0b',
  'Opportunities':           '#0891b2',
  'Plans':                   '#10b981',
  'Pending for closure':     '#f97316',
  'Closed – With Contract':  '#16a34a',
  'Closed – No Contract':    '#ca8a04',
  'Lost':                    '#dc2626',
}
