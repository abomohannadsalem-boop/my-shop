-- Homepage promotional images: fixed slots, editable only by the Golden Lion admin.
create table if not exists public.storefront_banners (
  slot integer primary key check (slot between 1 and 5),
  image_url text not null,
  alt_text text not null default 'بنر فروشگاه Golden Lion',
  updated_at timestamptz not null default now()
);

alter table public.storefront_banners enable row level security;
drop policy if exists "Public can view storefront banners" on public.storefront_banners;
create policy "Public can view storefront banners" on public.storefront_banners
  for select using (true);
drop policy if exists "Golden Lion admin manages storefront banners" on public.storefront_banners;
create policy "Golden Lion admin manages storefront banners" on public.storefront_banners
  for all using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'mrehsanshop@gmail.com')
  with check (lower(coalesce(auth.jwt() ->> 'email', '')) = 'mrehsanshop@gmail.com');
