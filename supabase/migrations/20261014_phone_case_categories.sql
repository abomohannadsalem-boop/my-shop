-- Phone-case category hierarchy. Safe to run more than once.
alter table public.categories
  add column if not exists parent_id bigint references public.categories(id) on delete cascade;

create index if not exists categories_parent_id_idx on public.categories(parent_id);

-- Create/update the four main categories.
insert into public.categories (name, slug, parent_id) values
  ('قاب اپل (Apple)', 'apple-cases', null),
  ('قاب سامسونگ (Samsung)', 'samsung-cases', null),
  ('قاب شیائومی (Xiaomi)', 'xiaomi-cases', null),
  ('قاب سایر گوشی‌ها', 'other-phone-cases', null)
on conflict (slug) do update set name = excluded.name;

-- Add the requested Apple models.
insert into public.categories (name, slug, parent_id)
select v.name, v.slug, p.id
from (values
  ('آیفون ۱۸ پرو مکس (iPhone 18 Pro Max)', 'iphone-18-pro-max'),
  ('آیفون ۱۸ پرو (iPhone 18 Pro)', 'iphone-18-pro'),
  ('آیفون ۱۸ (iPhone 18)', 'iphone-18'),
  ('آیفون ۱۷ پرو مکس (iPhone 17 Pro Max)', 'iphone-17-pro-max'),
  ('آیفون ۱۷ پرو (iPhone 17 Pro)', 'iphone-17-pro'),
  ('آیفون ۱۷ (iPhone 17)', 'iphone-17')
) as v(name, slug)
join public.categories p on p.slug = 'apple-cases'
on conflict (slug) do update set name = excluded.name, parent_id = excluded.parent_id;

-- Add the requested Samsung models.
insert into public.categories (name, slug, parent_id)
select v.name, v.slug, p.id
from (values
  ('سامسونگ Samsung A56', 'samsung-a56'),
  ('سامسونگ Samsung A36', 'samsung-a36'),
  ('سامسونگ Samsung A26', 'samsung-a26'),
  ('سامسونگ Samsung A16', 'samsung-a16'),
  ('سامسونگ Samsung A73', 'samsung-a73'),
  ('سامسونگ Samsung A72', 'samsung-a72'),
  ('سامسونگ Samsung A71', 'samsung-a71')
) as v(name, slug)
join public.categories p on p.slug = 'samsung-cases'
on conflict (slug) do update set name = excluded.name, parent_id = excluded.parent_id;

-- Remove the four original demo categories. Products remain intact; only their obsolete category assignment is cleared.
update public.products
set category_id = null
where category_id in (
  select id from public.categories
  where slug in ('sports', 'plants', 'computer-accessories', 'home-appliances')
);
delete from public.categories
where slug in ('sports', 'plants', 'computer-accessories', 'home-appliances');
