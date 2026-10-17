-- Accept local Iranian mobile numbers in the UI (09xxxxxxxxx), while Supabase Auth
-- continues to store/sign in with the required E.164 format (+989xxxxxxxxx).
-- Also makes customer profile/cart reads available to the designated admin only.

create or replace function public.normalize_iranian_mobile(phone_value text)
returns text
language plpgsql
immutable
as $$
declare
  digits text;
begin
  if phone_value is null or btrim(phone_value) = '' then
    return null;
  end if;
  digits := regexp_replace(phone_value, '[^0-9]', '', 'g');
  if digits ~ '^09[0-9]{9}$' then
    return digits;
  elsif digits ~ '^989[0-9]{9}$' then
    return '0' || substring(digits from 3);
  elsif digits ~ '^00989[0-9]{9}$' then
    return '0' || substring(digits from 5);
  end if;
  return nullif(btrim(phone_value), '');
end;
$$;

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

create table if not exists public.user_carts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  items jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.customer_profiles enable row level security;
alter table public.user_carts enable row level security;

grant select on public.customer_profiles, public.user_carts to authenticated;
grant insert, update on public.user_carts to authenticated;
grant update on public.customer_profiles to authenticated;

drop policy if exists "Customers can read own profile" on public.customer_profiles;
create policy "Customers can read own profile" on public.customer_profiles
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Customers can update own profile" on public.customer_profiles;
create policy "Customers can update own profile" on public.customer_profiles
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Admin can read customer profiles" on public.customer_profiles;
create policy "Admin can read customer profiles" on public.customer_profiles
  for select to authenticated
  using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'mrehsanshop@gmail.com');

drop policy if exists "Users can read own cart" on public.user_carts;
create policy "Users can read own cart" on public.user_carts
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert own cart" on public.user_carts;
create policy "Users can insert own cart" on public.user_carts
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "Users can update own cart" on public.user_carts;
create policy "Users can update own cart" on public.user_carts
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Admin can read all customer carts" on public.user_carts;
create policy "Admin can read all customer carts" on public.user_carts
  for select to authenticated
  using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'mrehsanshop@gmail.com');

-- Save the local 09xxxxxxxxx form in the customer profile, not the E.164 auth value.
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
    coalesce(
      public.normalize_iranian_mobile(new.raw_user_meta_data ->> 'local_phone'),
      public.normalize_iranian_mobile(new.raw_user_meta_data ->> 'phone'),
      public.normalize_iranian_mobile(new.phone)
    ),
    coalesce(nullif(new.raw_user_meta_data ->> 'contact_email', ''), nullif(new.email, '')),
    nullif(new.raw_user_meta_data ->> 'postal_code', ''),
    case
      when coalesce(new.raw_user_meta_data ->> 'date_of_birth', '') ~ '^\d{4}-\d{2}-\d{2}$'
      then (new.raw_user_meta_data ->> 'date_of_birth')::date
      else null
    end
  )
  on conflict (user_id) do update set
    full_name = case when excluded.full_name <> '' then excluded.full_name else customer_profiles.full_name end,
    phone = coalesce(excluded.phone, customer_profiles.phone),
    contact_email = coalesce(excluded.contact_email, customer_profiles.contact_email),
    postal_code = coalesce(excluded.postal_code, customer_profiles.postal_code),
    date_of_birth = coalesce(excluded.date_of_birth, customer_profiles.date_of_birth),
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_customer_profile on auth.users;
create trigger on_auth_user_created_customer_profile
after insert on auth.users
for each row execute function public.create_customer_profile_for_auth_user();

-- Convert existing Iranian phone numbers to the same local display format.
update public.customer_profiles
set phone = public.normalize_iranian_mobile(phone), updated_at = now()
where phone is not null;

-- Backfill any Auth account that has no profile row yet. Existing customer codes are preserved.
insert into public.customer_profiles (user_id, full_name, phone, contact_email, postal_code, date_of_birth)
select
  u.id,
  coalesce(nullif(u.raw_user_meta_data ->> 'full_name', ''), ''),
  coalesce(
    public.normalize_iranian_mobile(u.raw_user_meta_data ->> 'local_phone'),
    public.normalize_iranian_mobile(u.raw_user_meta_data ->> 'phone'),
    public.normalize_iranian_mobile(u.phone)
  ),
  coalesce(nullif(u.raw_user_meta_data ->> 'contact_email', ''), nullif(u.email, '')),
  nullif(u.raw_user_meta_data ->> 'postal_code', ''),
  case
    when coalesce(u.raw_user_meta_data ->> 'date_of_birth', '') ~ '^\d{4}-\d{2}-\d{2}$'
    then (u.raw_user_meta_data ->> 'date_of_birth')::date
    else null
  end
from auth.users u
on conflict (user_id) do nothing;
