-- Apply in Supabase Dashboard > SQL Editor.
-- Adds product color/image variants and a private customer registry with stable customer codes.

alter table public.products
  add column if not exists variants jsonb not null default '[]'::jsonb;

-- Retain the selected color when a cart is converted to an order.
alter table public.order_items
  add column if not exists color_name text,
  add column if not exists color_hex text;

create sequence if not exists public.customer_code_seq start with 1 increment by 1;

create table if not exists public.customer_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  customer_code text not null unique default ('CUS-' || lpad(nextval('public.customer_code_seq')::text, 6, '0')),
  full_name text not null default '',
  phone text,
  contact_email text,
  postal_code text,
  date_of_birth date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customer_profiles_created_at_idx on public.customer_profiles(created_at desc);
create index if not exists customer_profiles_phone_idx on public.customer_profiles(phone);

alter table public.customer_profiles enable row level security;

drop policy if exists "Customers can read own profile" on public.customer_profiles;
create policy "Customers can read own profile" on public.customer_profiles
  for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Customers can update own profile" on public.customer_profiles;
create policy "Customers can update own profile" on public.customer_profiles
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Admin can read customer profiles" on public.customer_profiles;
create policy "Admin can read customer profiles" on public.customer_profiles
  for select to authenticated using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'mrehsanshop@gmail.com');

-- Create a customer profile whenever Supabase Auth creates a user.
create or replace function public.create_customer_profile_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.customer_profiles (
    user_id, full_name, phone, contact_email, postal_code, date_of_birth
  ) values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), ''),
    coalesce(nullif(new.phone, ''), nullif(new.raw_user_meta_data ->> 'phone', '')),
    coalesce(nullif(new.raw_user_meta_data ->> 'contact_email', ''), nullif(new.email, '')),
    nullif(new.raw_user_meta_data ->> 'postal_code', ''),
    nullif(new.raw_user_meta_data ->> 'date_of_birth', '')::date
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_customer_profile on auth.users;
create trigger on_auth_user_created_customer_profile
after insert on auth.users
for each row execute function public.create_customer_profile_for_auth_user();

-- Backfill accounts that were created before this migration.
insert into public.customer_profiles (user_id, full_name, phone, contact_email, postal_code, date_of_birth)
select
  u.id,
  coalesce(nullif(u.raw_user_meta_data ->> 'full_name', ''), ''),
  coalesce(nullif(u.phone, ''), nullif(u.raw_user_meta_data ->> 'phone', '')),
  coalesce(nullif(u.raw_user_meta_data ->> 'contact_email', ''), nullif(u.email, '')),
  nullif(u.raw_user_meta_data ->> 'postal_code', ''),
  case when coalesce(u.raw_user_meta_data ->> 'date_of_birth', '') ~ '^\d{4}-\d{2}-\d{2}$'
       then (u.raw_user_meta_data ->> 'date_of_birth')::date else null end
from auth.users u
on conflict (user_id) do nothing;

-- The store owner can see every cart only from the admin interface; customers retain access to their own cart.
drop policy if exists "Admin can read all customer carts" on public.user_carts;
create policy "Admin can read all customer carts" on public.user_carts
  for select to authenticated using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'mrehsanshop@gmail.com');
