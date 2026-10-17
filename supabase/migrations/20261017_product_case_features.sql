-- Phone-case features (material / design / type) selectable by admin and filterable by customers.
-- Run once in Supabase > SQL Editor. Safe to run more than once.
alter table public.products
  add column if not exists case_features text[] not null default '{}';

create index if not exists products_case_features_gin_idx
  on public.products using gin (case_features);
