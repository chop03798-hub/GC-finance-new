-- ════════════════════════════════════════════════════════════════════════════
-- GC KSA Sales Command Center — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ════════════════════════════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── REPS table ──────────────────────────────────────────────────────────────
create table if not exists reps (
  id                uuid primary key default uuid_generate_v4(),
  created_at        timestamptz default now(),
  name              text not null,
  role              text not null,
  region            text not null,
  email             text,
  phone             text,
  total_commission_paid numeric(12,2) default 0,
  last_payment_date date,
  payment_status    text default 'pending' check (payment_status in ('pending','paid','partial')),
  salary            numeric(12,2) default 0,
  monthly_target    numeric(12,2) default 0,
  secured           numeric(12,2) default 0,
  leads             int default 0,
  meetings          int default 0,
  quotes            int default 0,
  opps              int default 0,
  pending           int default 0,
  closed            int default 0,
  lost_deals        int default 0,
  close_rate        numeric(5,1) default 0,
  avg_deal          numeric(12,2) default 0,
  cycle_time        int default 0,
  join_date         date,
  -- Tier thresholds (SAR)
  tier1_threshold   numeric(14,2) default 0,
  tier2_threshold   numeric(14,2) default 0,
  tier3_threshold   numeric(14,2) default 0,
  tier4_threshold   numeric(14,2) default 0,
  tier5_threshold   numeric(14,2) default 0,
  -- Tier commissions (SAR/month)
  tier1_comm        numeric(12,2) default 0,
  tier2_comm        numeric(12,2) default 0,
  tier3_comm        numeric(12,2) default 0,
  tier4_comm        numeric(12,2) default 0,
  tier5_comm        numeric(12,2) default 0
);

-- ── DEALS table ─────────────────────────────────────────────────────────────
create table if not exists deals (
  id                uuid primary key default uuid_generate_v4(),
  created_at        timestamptz default now(),
  date              date not null,
  company_name      text not null,
  parent_company_name text,
  brand_name        text,
  instagram_account text,
  business_type     text,
  contact_person    text,
  designation       text,
  mobile_number     text,
  email             text,
  sales_exec_name   text not null,
  status            text,
  stage             text not null check (stage in (
    'Leads & Calls','Meeting','Quotations','Opportunities','Plans',
    'Pending for closure','Closed – With Contract','Closed – No Contract','Lost'
  )),
  probability       int default 0 check (probability between 0 and 100),
  days_in_stage     int default 0,
  priority          text default 'Medium' check (priority in ('High','Medium','Low')),
  quotation_value   numeric(14,2) default 0,
  contract_ref      text,
  invoice_ref       text,
  collection_status text check (collection_status in ('Pending','Partial','Collected','Overdue')),
  collected_amount  numeric(14,2) default 0,
  contract_date     date,
  contract_expiry   date,
  contract_status   text check (contract_status in ('Signed','Pending Signature','No Contract','Expired','Renewed')),
  campaign_months   int,
  monthly_value     numeric(12,2),
  lost_reason       text,
  comments          text
);

alter table deals add column if not exists parent_company_name text;
alter table deals add column if not exists brand_name text;

-- ── MONTHLY TARGETS table ───────────────────────────────────────────────────
create table if not exists monthly_targets (
  id          uuid primary key default uuid_generate_v4(),
  month       text not null unique,
  target      numeric(14,2) default 0,
  achieved    numeric(14,2) default 0
);

-- ── CLIENT FEEDBACKS table ──────────────────────────────────────────────────
create table if not exists client_feedbacks (
  id             uuid primary key default uuid_generate_v4(),
  created_at     timestamptz default now(),
  client_id      uuid references deals(id) on delete cascade,
  feedback_text  text not null,
  rating         int check (rating between 1 and 5),
  feedback_date  date not null
);

-- ── Row Level Security ───────────────────────────────────────────────────────
-- Enable RLS (secure by default)
alter table reps enable row level security;
alter table deals enable row level security;
alter table monthly_targets enable row level security;
alter table client_feedbacks enable row level security;

-- Allow authenticated users to read/write all data
-- (customize per user if you add auth later)
create policy "Allow all for authenticated" on reps
  for all using (auth.role() = 'authenticated');
create policy "Allow all for authenticated" on deals
  for all using (auth.role() = 'authenticated');
create policy "Allow all for authenticated" on monthly_targets
  for all using (auth.role() = 'authenticated');
create policy "Allow all for authenticated" on client_feedbacks
  for all using (auth.role() = 'authenticated');

-- Temp: Allow anon read for demo (remove in production)
create policy "Allow anon read reps" on reps for select using (true);
create policy "Allow anon read deals" on deals for select using (true);
create policy "Allow anon read monthly" on monthly_targets for select using (true);
create policy "Allow anon write reps" on reps for all using (true);
create policy "Allow anon write deals" on deals for all using (true);
create policy "Allow anon write monthly" on monthly_targets for all using (true);

-- ── Useful Views ─────────────────────────────────────────────────────────────
create or replace view pipeline_summary as
  select
    stage,
    count(*) as deal_count,
    sum(quotation_value) as total_value,
    sum(quotation_value * probability / 100) as weighted_value,
    avg(probability) as avg_probability
  from deals
  group by stage;

create or replace view rep_performance as
  select
    r.*,
    count(d.id) filter (where d.stage not in ('Closed – With Contract','Closed – No Contract','Lost')) as active_deals,
    sum(d.quotation_value) filter (where d.stage in ('Closed – With Contract','Closed – No Contract')) as closed_value
  from reps r
  left join deals d on d.sales_exec_name = r.name
  group by r.id;

-- ── Indexes ──────────────────────────────────────────────────────────────────
create index if not exists idx_deals_stage on deals(stage);
create index if not exists idx_deals_rep on deals(sales_exec_name);
create index if not exists idx_deals_date on deals(date);
create index if not exists idx_deals_priority on deals(priority);
create index if not exists idx_deals_parent_company on deals(parent_company_name);
create index if not exists idx_deals_brand on deals(brand_name);
