-- ResolveAI initial schema
-- Tables: bills, bill_line_items, bill_findings, negotiations
-- Storage: private "bills" bucket (PDF/PNG/JPEG, 10 MB limit)
-- All tables use row-level security scoped to auth.uid()

-- Drop everything in dependency order (safe to re-run).
drop table if exists public.negotiations cascade;
drop table if exists public.bill_findings cascade;
drop table if exists public.bill_line_items cascade;
drop table if exists public.bills cascade;

create extension if not exists pgcrypto;

-- ============ Helpers ============

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============ Tables ============

create table public.bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'analyzed', 'failed')),
  provider text,
  category text
    check (category in ('internet', 'mobile', 'tv', 'landline', 'electricity', 'gas', 'water', 'insurance', 'other')),
  account_number text,
  billing_period_start date,
  billing_period_end date,
  total_amount numeric(12,2),
  currency text not null default 'USD',
  file_path text not null,
  file_name text not null,
  file_type text not null,
  file_size_bytes integer not null check (file_size_bytes > 0),
  parse_error text,
  parsed_at timestamptz,
  raw_analysis jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index bills_user_created_idx on public.bills (user_id, created_at desc);
create index bills_user_provider_account_idx on public.bills (user_id, provider, account_number, created_at desc);

create table public.bill_line_items (
  id uuid primary key default gen_random_uuid(),
  bill_id uuid not null references public.bills(id) on delete cascade,
  description text not null,
  category text not null default 'other'
    check (category in ('base_service', 'usage', 'equipment', 'fee', 'tax', 'discount', 'one_time', 'other')),
  amount numeric(12,2) not null,
  quantity numeric(10,2),
  is_recurring boolean not null default false,
  notes text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index bill_line_items_bill_idx on public.bill_line_items (bill_id);

create table public.bill_findings (
  id uuid primary key default gen_random_uuid(),
  bill_id uuid not null references public.bills(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null
    check (type in ('hidden_fee', 'duplicate_charge', 'price_increase', 'contract_mismatch', 'unusual_charge', 'tax_error')),
  severity text not null check (severity in ('low', 'medium', 'high')),
  title text not null,
  explanation text not null,
  confidence numeric(3,2) not null default 0.5 check (confidence between 0 and 1),
  estimated_monthly_savings numeric(12,2),
  evidence jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index bill_findings_bill_idx on public.bill_findings (bill_id);
create index bill_findings_user_idx on public.bill_findings (user_id, created_at desc);

create table public.negotiations (
  id uuid primary key default gen_random_uuid(),
  bill_id uuid not null references public.bills(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'suggested'
    check (status in ('suggested', 'in_progress', 'won', 'lost', 'cancelled')),
  potential_monthly_savings numeric(12,2),
  actual_monthly_savings numeric(12,2),
  draft_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index negotiations_user_idx on public.negotiations (user_id, created_at desc);
create index negotiations_bill_idx on public.negotiations (bill_id);

-- updated_at triggers

create trigger bills_set_updated_at before update on public.bills
  for each row execute function public.set_updated_at();

create trigger negotiations_set_updated_at before update on public.negotiations
  for each row execute function public.set_updated_at();

-- ============ Row Level Security ============

alter table public.bills enable row level security;
alter table public.bill_line_items enable row level security;
alter table public.bill_findings enable row level security;
alter table public.negotiations enable row level security;

-- bills: direct ownership

create policy "bills_select_own" on public.bills
  for select using (auth.uid() = user_id);

create policy "bills_insert_own" on public.bills
  for insert with check (auth.uid() = user_id);

create policy "bills_update_own" on public.bills
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "bills_delete_own" on public.bills
  for delete using (auth.uid() = user_id);

-- bill_line_items: ownership through parent bill

create policy "line_items_select_own" on public.bill_line_items
  for select using (
    exists (select 1 from public.bills b where b.id = bill_id and b.user_id = auth.uid())
  );

create policy "line_items_insert_own" on public.bill_line_items
  for insert with check (
    exists (select 1 from public.bills b where b.id = bill_id and b.user_id = auth.uid())
  );

create policy "line_items_update_own" on public.bill_line_items
  for update using (
    exists (select 1 from public.bills b where b.id = bill_id and b.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.bills b where b.id = bill_id and b.user_id = auth.uid())
  );

create policy "line_items_delete_own" on public.bill_line_items
  for delete using (
    exists (select 1 from public.bills b where b.id = bill_id and b.user_id = auth.uid())
  );

-- bill_findings: denormalized user_id

create policy "findings_select_own" on public.bill_findings
  for select using (auth.uid() = user_id);

create policy "findings_insert_own" on public.bill_findings
  for insert with check (auth.uid() = user_id);

create policy "findings_update_own" on public.bill_findings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "findings_delete_own" on public.bill_findings
  for delete using (auth.uid() = user_id);

-- negotiations: denormalized user_id

create policy "negotiations_select_own" on public.negotiations
  for select using (auth.uid() = user_id);

create policy "negotiations_insert_own" on public.negotiations
  for insert with check (auth.uid() = user_id);

create policy "negotiations_update_own" on public.negotiations
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "negotiations_delete_own" on public.negotiations
  for delete using (auth.uid() = user_id);

-- ============ Storage ============

-- Private bucket; objects are stored as bills/<user_id>/<bill_id>/<filename>

drop policy if exists "bills_storage_select_own" on storage.objects;
drop policy if exists "bills_storage_insert_own" on storage.objects;
drop policy if exists "bills_storage_update_own" on storage.objects;
drop policy if exists "bills_storage_delete_own" on storage.objects;
delete from storage.buckets where id = 'bills';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'bills',
  'bills',
  false,
  10485760, -- 10 MB
  array['application/pdf', 'image/png', 'image/jpeg']
);

create policy "bills_storage_select_own" on storage.objects
  for select using (
    bucket_id = 'bills' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "bills_storage_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'bills' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "bills_storage_update_own" on storage.objects
  for update using (
    bucket_id = 'bills' and (storage.foldername(name))[1] = auth.uid()::text
  ) with check (
    bucket_id = 'bills' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "bills_storage_delete_own" on storage.objects
  for delete using (
    bucket_id = 'bills' and (storage.foldername(name))[1] = auth.uid()::text
  );
