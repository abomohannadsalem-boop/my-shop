-- Run this whole file in Supabase Dashboard > SQL Editor.
-- Admin authorization is enforced by database RLS, not only by hiding UI.

-- The admin email is deliberately restricted to the requested account.
alter table public.products enable row level security;
-- Remove any old write policies that might accidentally grant visitors write access.
do $$ declare pol record; begin
  for pol in select policyname from pg_policies where schemaname='public' and tablename='products' and cmd <> 'SELECT' loop
    execute format('drop policy if exists %I on public.products', pol.policyname);
  end loop;
end $$;
drop policy if exists "Public can read products" on public.products;
create policy "Public can read products" on public.products for select using (true);
drop policy if exists "Admin can insert products" on public.products;
drop policy if exists "Admin can update products" on public.products;
drop policy if exists "Admin can delete products" on public.products;
create policy "Admin can insert products" on public.products for insert to authenticated
  with check (lower(coalesce(auth.jwt() ->> 'email', '')) = 'mrehsanshop@gmail.com');
create policy "Admin can update products" on public.products for update to authenticated
  using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'mrehsanshop@gmail.com')
  with check (lower(coalesce(auth.jwt() ->> 'email', '')) = 'mrehsanshop@gmail.com');
create policy "Admin can delete products" on public.products for delete to authenticated
  using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'mrehsanshop@gmail.com');

-- Product media/category writes are also admin-only (public reads remain available).
do $$ declare pol record; begin
  for pol in select policyname from pg_policies where schemaname='public' and tablename in ('categories','product_media') and cmd <> 'SELECT' loop
    execute format('drop policy if exists %I on public.%I', pol.policyname, pol.tablename);
  end loop;
end $$;
drop policy if exists "Admin can manage categories" on public.categories;
create policy "Admin can manage categories" on public.categories for all to authenticated
  using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'mrehsanshop@gmail.com')
  with check (lower(coalesce(auth.jwt() ->> 'email', '')) = 'mrehsanshop@gmail.com');
drop policy if exists "Admin can manage product media" on public.product_media;
create policy "Admin can manage product media" on public.product_media for all to authenticated
  using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'mrehsanshop@gmail.com')
  with check (lower(coalesce(auth.jwt() ->> 'email', '')) = 'mrehsanshop@gmail.com');

-- Persistent cart per signed-in user.
create table if not exists public.user_carts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  items jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.user_carts enable row level security;
drop policy if exists "Users can read own cart" on public.user_carts;
create policy "Users can read own cart" on public.user_carts for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users can insert own cart" on public.user_carts;
create policy "Users can insert own cart" on public.user_carts for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Users can update own cart" on public.user_carts;
create policy "Users can update own cart" on public.user_carts for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Public bucket for product images. Upload/delete is admin-only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 10485760, array['image/webp'])
on conflict (id) do update set public = true, file_size_limit = 10485760, allowed_mime_types = array['image/webp'];
drop policy if exists "Anyone can view product images" on storage.objects;
create policy "Anyone can view product images" on storage.objects for select using (bucket_id = 'product-images');
drop policy if exists "Admin can upload product images" on storage.objects;
create policy "Admin can upload product images" on storage.objects for insert to authenticated with check (bucket_id = 'product-images' and lower(coalesce(auth.jwt() ->> 'email', '')) = 'mrehsanshop@gmail.com');
drop policy if exists "Admin can update product images" on storage.objects;
create policy "Admin can update product images" on storage.objects for update to authenticated using (bucket_id = 'product-images' and lower(coalesce(auth.jwt() ->> 'email', '')) = 'mrehsanshop@gmail.com') with check (bucket_id = 'product-images' and lower(coalesce(auth.jwt() ->> 'email', '')) = 'mrehsanshop@gmail.com');
drop policy if exists "Admin can delete product images" on storage.objects;
create policy "Admin can delete product images" on storage.objects for delete to authenticated using (bucket_id = 'product-images' and lower(coalesce(auth.jwt() ->> 'email', '')) = 'mrehsanshop@gmail.com');
