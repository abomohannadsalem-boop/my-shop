-- Golden Lion: national ID, "verified account" badge, unique phone / national ID, registration conflict check.
-- Run once in Supabase > SQL Editor. Safe to run more than once.

alter table public.customer_profiles
  add column if not exists national_id text,
  add column if not exists is_verified boolean not null default false,
  add column if not exists verified_at timestamptz;

-- Old accounts created with the internal phone-alias email must not show that alias as their contact email.
update public.customer_profiles
set contact_email = null
where contact_email ~* '^phone-[0-9]+@';

-- Unique phone and national ID (a phone/ID can belong to only one account).
-- If old data already contains duplicate phones the index is skipped with a NOTICE; fix duplicates and run again.
do $$
begin
  if exists (select 1 from public.customer_profiles where nullif(phone, '') is not null group by phone having count(*) > 1) then
    raise notice 'Duplicate phone numbers exist in customer_profiles: unique phone index NOT created. Fix them and re-run this file.';
  else
    create unique index if not exists customer_profiles_phone_unique on public.customer_profiles (phone) where nullif(phone, '') is not null;
  end if;
  if exists (select 1 from public.customer_profiles where nullif(national_id, '') is not null group by national_id having count(*) > 1) then
    raise notice 'Duplicate national IDs exist: unique national_id index NOT created.';
  else
    create unique index if not exists customer_profiles_national_id_unique on public.customer_profiles (national_id) where nullif(national_id, '') is not null;
  end if;
end $$;

-- A profile is "verified" only when ALL of these are true:
--   phone = 11 digits (09...), national ID = 10 digits, postal code = 10 digits, birth date set, name set,
--   and the contact email is confirmed by Supabase Auth (auth email = contact email, email_confirmed_at set).
create or replace function public.customer_is_verified(
  p_user_id uuid, p_full_name text, p_phone text, p_national_id text, p_postal_code text, p_dob date, p_contact_email text
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  u_email text;
  u_confirmed timestamptz;
begin
  select email, email_confirmed_at into u_email, u_confirmed from auth.users where id = p_user_id;
  return coalesce(btrim(p_full_name), '') <> ''
     and coalesce(p_phone, '') ~ '^09[0-9]{9}$'
     and coalesce(p_national_id, '') ~ '^[0-9]{10}$'
     and coalesce(p_postal_code, '') ~ '^[0-9]{10}$'
     and p_dob is not null
     and u_confirmed is not null
     and u_email is not null
     and u_email !~* '^phone-[0-9]+@'
     and p_contact_email is not null
     and lower(u_email) = lower(p_contact_email);
end;
$$;

-- Computes the badge on every insert/update (users cannot fake it) and keeps customer_code/user_id immutable.
create or replace function public.customer_profiles_before_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' then
    new.customer_code := old.customer_code;
    new.user_id := old.user_id;
  end if;
  new.is_verified := public.customer_is_verified(new.user_id, new.full_name, new.phone, new.national_id, new.postal_code, new.date_of_birth, new.contact_email);
  if new.is_verified then
    new.verified_at := coalesce(case when tg_op = 'UPDATE' then old.verified_at end, now());
  else
    new.verified_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists customer_profiles_before_write on public.customer_profiles;
create trigger customer_profiles_before_write
before insert or update on public.customer_profiles
for each row execute function public.customer_profiles_before_write();

-- When Supabase confirms / changes the Auth email, mirror it into the profile and recompute the badge.
create or replace function public.sync_profile_after_auth_email_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.customer_profiles
  set contact_email = case
        when new.email is not null and new.email !~* '^phone-[0-9]+@' and new.email_confirmed_at is not null then new.email
        else contact_email
      end,
      updated_at = now()
  where user_id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_changed on auth.users;
create trigger on_auth_user_email_changed
after update of email, email_confirmed_at on auth.users
for each row execute function public.sync_profile_after_auth_email_change();

-- New accounts: copy every sign-up field (incl. national ID) from user metadata into the profile.
create or replace function public.create_customer_profile_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.customer_profiles (user_id, full_name, phone, national_id, contact_email, postal_code, date_of_birth)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), ''),
    coalesce(
      public.normalize_iranian_mobile(new.raw_user_meta_data ->> 'local_phone'),
      public.normalize_iranian_mobile(new.raw_user_meta_data ->> 'phone'),
      public.normalize_iranian_mobile(new.phone)
    ),
    nullif(new.raw_user_meta_data ->> 'national_id', ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'contact_email', ''), case when new.email ~* '^phone-[0-9]+@' then null else nullif(new.email, '') end),
    nullif(new.raw_user_meta_data ->> 'postal_code', ''),
    case when coalesce(new.raw_user_meta_data ->> 'date_of_birth', '') ~ '^\d{4}-\d{2}-\d{2}$'
         then (new.raw_user_meta_data ->> 'date_of_birth')::date else null end
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_customer_profile on auth.users;
create trigger on_auth_user_created_customer_profile
after insert on auth.users
for each row execute function public.create_customer_profile_for_auth_user();

-- Re-run the badge computation for every existing profile.
update public.customer_profiles set updated_at = now();

-- Registration pre-check (so the form can say "this phone / national ID is already registered").
create or replace function public.registration_conflicts(p_phone text, p_national_id text)
returns text
language sql
security definer
set search_path = public
as $$
  select case
    when nullif(p_phone, '') is not null and exists (select 1 from public.customer_profiles where phone = p_phone) then 'phone'
    when nullif(p_national_id, '') is not null and exists (select 1 from public.customer_profiles where national_id = p_national_id) then 'national_id'
    else null
  end;
$$;
revoke all on function public.registration_conflicts(text, text) from public;
grant execute on function public.registration_conflicts(text, text) to anon, authenticated;
