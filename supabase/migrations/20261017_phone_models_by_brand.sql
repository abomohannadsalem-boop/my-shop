-- Golden Lion: replace the phone-model subcategories of 5 brands:
-- Samsung, Xiaomi (+Redmi/Poco), Daria, Vocal (وکال), Lenovo.
-- Safe to run more than once. Paste the whole file into Supabase > SQL Editor > Run.
--  * Old subcategories of these brands that are NOT in the new list are deleted.
--  * Products are NEVER deleted. A product linked to a deleted subcategory just becomes uncategorized.
--  * Subcategories that stay (same slug, e.g. samsung-a56) keep their ID, so their products stay linked.
--  * Apple categories are not touched.

alter table public.categories
  add column if not exists parent_id bigint references public.categories(id) on delete cascade;
create index if not exists categories_parent_id_idx on public.categories(parent_id);

do $$
declare
  pid bigint;
begin
  -- ===== قاب سامسونگ (Samsung) (96 models) =====
  select id into pid from public.categories where parent_id is null and name ~* 'سامسونگ|samsung' order by id limit 1;
  if pid is null then
    insert into public.categories (name, slug, parent_id) values ('قاب سامسونگ (Samsung)', 'samsung-cases', null)
    on conflict (slug) do update set parent_id = null
    returning id into pid;
  end if;

  delete from public.categories
  where parent_id = pid
    and slug not in (select slug from (values ('samsung-s26-ultra'),('samsung-s26-plus'),('samsung-s26'),('samsung-s25-ultra'),('samsung-s25-edge'),('samsung-s25-plus'),('samsung-s25'),('samsung-s25-fe'),('samsung-s24-ultra'),('samsung-s24-plus'),('samsung-s24'),('samsung-s24-fe'),('samsung-s23-ultra'),('samsung-s23-plus'),('samsung-s23'),('samsung-s23-fe'),('samsung-s22-ultra'),('samsung-s22-plus'),('samsung-s22'),('samsung-s21-ultra'),('samsung-s21-plus'),('samsung-s21'),('samsung-s21-fe'),('samsung-s20-ultra'),('samsung-s20-plus'),('samsung-s20'),('samsung-s20-fe'),('samsung-s10-plus'),('samsung-s10'),('samsung-a73'),('samsung-a72'),('samsung-a71'),('samsung-a56'),('samsung-a55'),('samsung-a54'),('samsung-a53'),('samsung-a52s'),('samsung-a52'),('samsung-a36'),('samsung-a35'),('samsung-a34'),('samsung-a33'),('samsung-a32'),('samsung-a26'),('samsung-a25'),('samsung-a24'),('samsung-a23'),('samsung-a22'),('samsung-a21s'),('samsung-a17'),('samsung-a16'),('samsung-a15'),('samsung-a14'),('samsung-a13'),('samsung-a12'),('samsung-a07'),('samsung-a06'),('samsung-a05s'),('samsung-a05'),('samsung-a04s'),('samsung-a04'),('samsung-a03s'),('samsung-a03'),('samsung-m55'),('samsung-m54'),('samsung-m53'),('samsung-m52'),('samsung-m51'),('samsung-m36'),('samsung-m35'),('samsung-m34'),('samsung-m33'),('samsung-m32'),('samsung-m23'),('samsung-m16'),('samsung-m15'),('samsung-m14'),('samsung-m13'),('samsung-f54'),('samsung-f34'),('samsung-f15'),('samsung-z-fold-7'),('samsung-z-fold-6'),('samsung-z-fold-5'),('samsung-z-fold-4'),('samsung-z-fold-3'),('samsung-z-flip-7'),('samsung-z-flip-7-fe'),('samsung-z-flip-6'),('samsung-z-flip-5'),('samsung-z-flip-4'),('samsung-z-flip-3'),('samsung-note-20-ultra'),('samsung-note-20'),('samsung-note-10-plus'),('samsung-note-10')) as keep(slug));

  insert into public.categories (name, slug, parent_id)
  select v.name, v.slug, pid
  from (values
      ('سامسونگ Samsung S26 Ultra', 'samsung-s26-ultra'),
      ('سامسونگ Samsung S26+', 'samsung-s26-plus'),
      ('سامسونگ Samsung S26', 'samsung-s26'),
      ('سامسونگ Samsung S25 Ultra', 'samsung-s25-ultra'),
      ('سامسونگ Samsung S25 Edge', 'samsung-s25-edge'),
      ('سامسونگ Samsung S25+', 'samsung-s25-plus'),
      ('سامسونگ Samsung S25', 'samsung-s25'),
      ('سامسونگ Samsung S25 FE', 'samsung-s25-fe'),
      ('سامسونگ Samsung S24 Ultra', 'samsung-s24-ultra'),
      ('سامسونگ Samsung S24+', 'samsung-s24-plus'),
      ('سامسونگ Samsung S24', 'samsung-s24'),
      ('سامسونگ Samsung S24 FE', 'samsung-s24-fe'),
      ('سامسونگ Samsung S23 Ultra', 'samsung-s23-ultra'),
      ('سامسونگ Samsung S23+', 'samsung-s23-plus'),
      ('سامسونگ Samsung S23', 'samsung-s23'),
      ('سامسونگ Samsung S23 FE', 'samsung-s23-fe'),
      ('سامسونگ Samsung S22 Ultra', 'samsung-s22-ultra'),
      ('سامسونگ Samsung S22+', 'samsung-s22-plus'),
      ('سامسونگ Samsung S22', 'samsung-s22'),
      ('سامسونگ Samsung S21 Ultra', 'samsung-s21-ultra'),
      ('سامسونگ Samsung S21+', 'samsung-s21-plus'),
      ('سامسونگ Samsung S21', 'samsung-s21'),
      ('سامسونگ Samsung S21 FE', 'samsung-s21-fe'),
      ('سامسونگ Samsung S20 Ultra', 'samsung-s20-ultra'),
      ('سامسونگ Samsung S20+', 'samsung-s20-plus'),
      ('سامسونگ Samsung S20', 'samsung-s20'),
      ('سامسونگ Samsung S20 FE', 'samsung-s20-fe'),
      ('سامسونگ Samsung S10+', 'samsung-s10-plus'),
      ('سامسونگ Samsung S10', 'samsung-s10'),
      ('سامسونگ Samsung A73', 'samsung-a73'),
      ('سامسونگ Samsung A72', 'samsung-a72'),
      ('سامسونگ Samsung A71', 'samsung-a71'),
      ('سامسونگ Samsung A56', 'samsung-a56'),
      ('سامسونگ Samsung A55', 'samsung-a55'),
      ('سامسونگ Samsung A54', 'samsung-a54'),
      ('سامسونگ Samsung A53', 'samsung-a53'),
      ('سامسونگ Samsung A52s', 'samsung-a52s'),
      ('سامسونگ Samsung A52', 'samsung-a52'),
      ('سامسونگ Samsung A36', 'samsung-a36'),
      ('سامسونگ Samsung A35', 'samsung-a35'),
      ('سامسونگ Samsung A34', 'samsung-a34'),
      ('سامسونگ Samsung A33', 'samsung-a33'),
      ('سامسونگ Samsung A32', 'samsung-a32'),
      ('سامسونگ Samsung A26', 'samsung-a26'),
      ('سامسونگ Samsung A25', 'samsung-a25'),
      ('سامسونگ Samsung A24', 'samsung-a24'),
      ('سامسونگ Samsung A23', 'samsung-a23'),
      ('سامسونگ Samsung A22', 'samsung-a22'),
      ('سامسونگ Samsung A21s', 'samsung-a21s'),
      ('سامسونگ Samsung A17', 'samsung-a17'),
      ('سامسونگ Samsung A16', 'samsung-a16'),
      ('سامسونگ Samsung A15', 'samsung-a15'),
      ('سامسونگ Samsung A14', 'samsung-a14'),
      ('سامسونگ Samsung A13', 'samsung-a13'),
      ('سامسونگ Samsung A12', 'samsung-a12'),
      ('سامسونگ Samsung A07', 'samsung-a07'),
      ('سامسونگ Samsung A06', 'samsung-a06'),
      ('سامسونگ Samsung A05s', 'samsung-a05s'),
      ('سامسونگ Samsung A05', 'samsung-a05'),
      ('سامسونگ Samsung A04s', 'samsung-a04s'),
      ('سامسونگ Samsung A04', 'samsung-a04'),
      ('سامسونگ Samsung A03s', 'samsung-a03s'),
      ('سامسونگ Samsung A03', 'samsung-a03'),
      ('سامسونگ Samsung M55', 'samsung-m55'),
      ('سامسونگ Samsung M54', 'samsung-m54'),
      ('سامسونگ Samsung M53', 'samsung-m53'),
      ('سامسونگ Samsung M52', 'samsung-m52'),
      ('سامسونگ Samsung M51', 'samsung-m51'),
      ('سامسونگ Samsung M36', 'samsung-m36'),
      ('سامسونگ Samsung M35', 'samsung-m35'),
      ('سامسونگ Samsung M34', 'samsung-m34'),
      ('سامسونگ Samsung M33', 'samsung-m33'),
      ('سامسونگ Samsung M32', 'samsung-m32'),
      ('سامسونگ Samsung M23', 'samsung-m23'),
      ('سامسونگ Samsung M16', 'samsung-m16'),
      ('سامسونگ Samsung M15', 'samsung-m15'),
      ('سامسونگ Samsung M14', 'samsung-m14'),
      ('سامسونگ Samsung M13', 'samsung-m13'),
      ('سامسونگ Samsung F54', 'samsung-f54'),
      ('سامسونگ Samsung F34', 'samsung-f34'),
      ('سامسونگ Samsung F15', 'samsung-f15'),
      ('سامسونگ Samsung Z Fold 7', 'samsung-z-fold-7'),
      ('سامسونگ Samsung Z Fold 6', 'samsung-z-fold-6'),
      ('سامسونگ Samsung Z Fold 5', 'samsung-z-fold-5'),
      ('سامسونگ Samsung Z Fold 4', 'samsung-z-fold-4'),
      ('سامسونگ Samsung Z Fold 3', 'samsung-z-fold-3'),
      ('سامسونگ Samsung Z Flip 7', 'samsung-z-flip-7'),
      ('سامسونگ Samsung Z Flip 7 FE', 'samsung-z-flip-7-fe'),
      ('سامسونگ Samsung Z Flip 6', 'samsung-z-flip-6'),
      ('سامسونگ Samsung Z Flip 5', 'samsung-z-flip-5'),
      ('سامسونگ Samsung Z Flip 4', 'samsung-z-flip-4'),
      ('سامسونگ Samsung Z Flip 3', 'samsung-z-flip-3'),
      ('سامسونگ Samsung Note 20 Ultra', 'samsung-note-20-ultra'),
      ('سامسونگ Samsung Note 20', 'samsung-note-20'),
      ('سامسونگ Samsung Note 10+', 'samsung-note-10-plus'),
      ('سامسونگ Samsung Note 10', 'samsung-note-10')
  ) as v(name, slug)
  on conflict (slug) do update set name = excluded.name, parent_id = excluded.parent_id;

  -- ===== قاب شیائومی (Xiaomi) (82 models) =====
  select id into pid from public.categories where parent_id is null and name ~* 'شیائومی|xiaomi' order by id limit 1;
  if pid is null then
    insert into public.categories (name, slug, parent_id) values ('قاب شیائومی (Xiaomi)', 'xiaomi-cases', null)
    on conflict (slug) do update set parent_id = null
    returning id into pid;
  end if;

  delete from public.categories
  where parent_id = pid
    and slug not in (select slug from (values ('xiaomi-17-pro-max'),('xiaomi-17-pro'),('xiaomi-17'),('xiaomi-15t-pro'),('xiaomi-15t'),('xiaomi-15-ultra'),('xiaomi-15'),('xiaomi-14t-pro'),('xiaomi-14t'),('xiaomi-14-ultra'),('xiaomi-14'),('xiaomi-13t-pro'),('xiaomi-13t'),('xiaomi-13-ultra'),('xiaomi-13-pro'),('xiaomi-13'),('xiaomi-13-lite'),('xiaomi-12t-pro'),('xiaomi-12t'),('xiaomi-12-pro'),('xiaomi-12'),('xiaomi-12-lite'),('xiaomi-11t-pro'),('xiaomi-11t'),('xiaomi-11-lite-5g-ne'),('redmi-note-15-pro-plus'),('redmi-note-15-pro'),('redmi-note-15'),('redmi-note-14-pro-plus'),('redmi-note-14-pro'),('redmi-note-14'),('redmi-note-13-pro-plus'),('redmi-note-13-pro'),('redmi-note-13-pro-4g'),('redmi-note-13'),('redmi-note-12-pro-plus'),('redmi-note-12-pro'),('redmi-note-12s'),('redmi-note-12'),('redmi-note-11-pro-plus'),('redmi-note-11-pro'),('redmi-note-11s'),('redmi-note-11'),('redmi-note-10-pro'),('redmi-note-10s'),('redmi-note-10'),('redmi-15'),('redmi-15c'),('redmi-14c'),('redmi-13'),('redmi-13c'),('redmi-12'),('redmi-12c'),('redmi-10'),('redmi-10c'),('redmi-a5'),('redmi-a3'),('poco-f7-ultra'),('poco-f7-pro'),('poco-f7'),('poco-f6-pro'),('poco-f6'),('poco-f5-pro'),('poco-f5'),('poco-f4-gt'),('poco-f4'),('poco-x7-pro'),('poco-x7'),('poco-x6-pro'),('poco-x6'),('poco-x5-pro'),('poco-x5'),('poco-x4-pro'),('poco-x3-pro'),('poco-m7-pro'),('poco-m7'),('poco-m6-pro'),('poco-m6'),('poco-m5'),('poco-c75'),('poco-c65'),('poco-c55')) as keep(slug));

  insert into public.categories (name, slug, parent_id)
  select v.name, v.slug, pid
  from (values
      ('شیائومی Xiaomi 17 Pro Max', 'xiaomi-17-pro-max'),
      ('شیائومی Xiaomi 17 Pro', 'xiaomi-17-pro'),
      ('شیائومی Xiaomi 17', 'xiaomi-17'),
      ('شیائومی Xiaomi 15T Pro', 'xiaomi-15t-pro'),
      ('شیائومی Xiaomi 15T', 'xiaomi-15t'),
      ('شیائومی Xiaomi 15 Ultra', 'xiaomi-15-ultra'),
      ('شیائومی Xiaomi 15', 'xiaomi-15'),
      ('شیائومی Xiaomi 14T Pro', 'xiaomi-14t-pro'),
      ('شیائومی Xiaomi 14T', 'xiaomi-14t'),
      ('شیائومی Xiaomi 14 Ultra', 'xiaomi-14-ultra'),
      ('شیائومی Xiaomi 14', 'xiaomi-14'),
      ('شیائومی Xiaomi 13T Pro', 'xiaomi-13t-pro'),
      ('شیائومی Xiaomi 13T', 'xiaomi-13t'),
      ('شیائومی Xiaomi 13 Ultra', 'xiaomi-13-ultra'),
      ('شیائومی Xiaomi 13 Pro', 'xiaomi-13-pro'),
      ('شیائومی Xiaomi 13', 'xiaomi-13'),
      ('شیائومی Xiaomi 13 Lite', 'xiaomi-13-lite'),
      ('شیائومی Xiaomi 12T Pro', 'xiaomi-12t-pro'),
      ('شیائومی Xiaomi 12T', 'xiaomi-12t'),
      ('شیائومی Xiaomi 12 Pro', 'xiaomi-12-pro'),
      ('شیائومی Xiaomi 12', 'xiaomi-12'),
      ('شیائومی Xiaomi 12 Lite', 'xiaomi-12-lite'),
      ('شیائومی Xiaomi 11T Pro', 'xiaomi-11t-pro'),
      ('شیائومی Xiaomi 11T', 'xiaomi-11t'),
      ('شیائومی Xiaomi 11 Lite 5G NE', 'xiaomi-11-lite-5g-ne'),
      ('ردمی Redmi Note 15 Pro+', 'redmi-note-15-pro-plus'),
      ('ردمی Redmi Note 15 Pro', 'redmi-note-15-pro'),
      ('ردمی Redmi Note 15', 'redmi-note-15'),
      ('ردمی Redmi Note 14 Pro+', 'redmi-note-14-pro-plus'),
      ('ردمی Redmi Note 14 Pro', 'redmi-note-14-pro'),
      ('ردمی Redmi Note 14', 'redmi-note-14'),
      ('ردمی Redmi Note 13 Pro+', 'redmi-note-13-pro-plus'),
      ('ردمی Redmi Note 13 Pro', 'redmi-note-13-pro'),
      ('ردمی Redmi Note 13 Pro 4G', 'redmi-note-13-pro-4g'),
      ('ردمی Redmi Note 13', 'redmi-note-13'),
      ('ردمی Redmi Note 12 Pro+', 'redmi-note-12-pro-plus'),
      ('ردمی Redmi Note 12 Pro', 'redmi-note-12-pro'),
      ('ردمی Redmi Note 12S', 'redmi-note-12s'),
      ('ردمی Redmi Note 12', 'redmi-note-12'),
      ('ردمی Redmi Note 11 Pro+', 'redmi-note-11-pro-plus'),
      ('ردمی Redmi Note 11 Pro', 'redmi-note-11-pro'),
      ('ردمی Redmi Note 11S', 'redmi-note-11s'),
      ('ردمی Redmi Note 11', 'redmi-note-11'),
      ('ردمی Redmi Note 10 Pro', 'redmi-note-10-pro'),
      ('ردمی Redmi Note 10S', 'redmi-note-10s'),
      ('ردمی Redmi Note 10', 'redmi-note-10'),
      ('ردمی Redmi 15', 'redmi-15'),
      ('ردمی Redmi 15C', 'redmi-15c'),
      ('ردمی Redmi 14C', 'redmi-14c'),
      ('ردمی Redmi 13', 'redmi-13'),
      ('ردمی Redmi 13C', 'redmi-13c'),
      ('ردمی Redmi 12', 'redmi-12'),
      ('ردمی Redmi 12C', 'redmi-12c'),
      ('ردمی Redmi 10', 'redmi-10'),
      ('ردمی Redmi 10C', 'redmi-10c'),
      ('ردمی Redmi A5', 'redmi-a5'),
      ('ردمی Redmi A3', 'redmi-a3'),
      ('پوکو Poco F7 Ultra', 'poco-f7-ultra'),
      ('پوکو Poco F7 Pro', 'poco-f7-pro'),
      ('پوکو Poco F7', 'poco-f7'),
      ('پوکو Poco F6 Pro', 'poco-f6-pro'),
      ('پوکو Poco F6', 'poco-f6'),
      ('پوکو Poco F5 Pro', 'poco-f5-pro'),
      ('پوکو Poco F5', 'poco-f5'),
      ('پوکو Poco F4 GT', 'poco-f4-gt'),
      ('پوکو Poco F4', 'poco-f4'),
      ('پوکو Poco X7 Pro', 'poco-x7-pro'),
      ('پوکو Poco X7', 'poco-x7'),
      ('پوکو Poco X6 Pro', 'poco-x6-pro'),
      ('پوکو Poco X6', 'poco-x6'),
      ('پوکو Poco X5 Pro', 'poco-x5-pro'),
      ('پوکو Poco X5', 'poco-x5'),
      ('پوکو Poco X4 Pro', 'poco-x4-pro'),
      ('پوکو Poco X3 Pro', 'poco-x3-pro'),
      ('پوکو Poco M7 Pro', 'poco-m7-pro'),
      ('پوکو Poco M7', 'poco-m7'),
      ('پوکو Poco M6 Pro', 'poco-m6-pro'),
      ('پوکو Poco M6', 'poco-m6'),
      ('پوکو Poco M5', 'poco-m5'),
      ('پوکو Poco C75', 'poco-c75'),
      ('پوکو Poco C65', 'poco-c65'),
      ('پوکو Poco C55', 'poco-c55')
  ) as v(name, slug)
  on conflict (slug) do update set name = excluded.name, parent_id = excluded.parent_id;

  -- ===== قاب داریا (Daria) (5 models) =====
  select id into pid from public.categories where parent_id is null and name ~* 'داریا|daria' order by id limit 1;
  if pid is null then
    insert into public.categories (name, slug, parent_id) values ('قاب داریا (Daria)', 'daria-cases', null)
    on conflict (slug) do update set parent_id = null
    returning id into pid;
  end if;

  delete from public.categories
  where parent_id = pid
    and slug not in (select slug from (values ('daria-bond'),('daria-bond-5g'),('daria-bond-ii'),('daria-bond-ii-5g'),('daria-bond-ii-lite')) as keep(slug));

  insert into public.categories (name, slug, parent_id)
  select v.name, v.slug, pid
  from (values
      ('داریا Daria Bond', 'daria-bond'),
      ('داریا Daria Bond 5G', 'daria-bond-5g'),
      ('داریا Daria Bond II', 'daria-bond-ii'),
      ('داریا Daria Bond II 5G', 'daria-bond-ii-5g'),
      ('داریا Daria Bond II Lite', 'daria-bond-ii-lite')
  ) as v(name, slug)
  on conflict (slug) do update set name = excluded.name, parent_id = excluded.parent_id;

  -- ===== قاب وکال (Vocal) (4 models) =====
  select id into pid from public.categories where parent_id is null and name ~* 'وکال|vcall|vocal' order by id limit 1;
  if pid is null then
    insert into public.categories (name, slug, parent_id) values ('قاب وکال (Vocal)', 'vocal-cases', null)
    on conflict (slug) do update set parent_id = null
    returning id into pid;
  end if;

  delete from public.categories
  where parent_id = pid
    and slug not in (select slug from (values ('vocal-v1'),('vocal-v01'),('vocal-v2'),('vocal-v2-lite')) as keep(slug));

  insert into public.categories (name, slug, parent_id)
  select v.name, v.slug, pid
  from (values
      ('وکال Vocal V1', 'vocal-v1'),
      ('وکال Vocal V01', 'vocal-v01'),
      ('وکال Vocal V2', 'vocal-v2'),
      ('وکال Vocal V2 Lite', 'vocal-v2-lite')
  ) as v(name, slug)
  on conflict (slug) do update set name = excluded.name, parent_id = excluded.parent_id;

  -- ===== قاب لنوو (Lenovo) (26 models) =====
  select id into pid from public.categories where parent_id is null and name ~* 'لنوو|lenovo' order by id limit 1;
  if pid is null then
    insert into public.categories (name, slug, parent_id) values ('قاب لنوو (Lenovo)', 'lenovo-cases', null)
    on conflict (slug) do update set parent_id = null
    returning id into pid;
  end if;

  delete from public.categories
  where parent_id = pid
    and slug not in (select slug from (values ('lenovo-legion-y90'),('lenovo-legion-y70'),('lenovo-legion-duel-2'),('lenovo-legion-phone-duel'),('lenovo-k15'),('lenovo-k14-plus'),('lenovo-k14'),('lenovo-k13-note'),('lenovo-k12-pro'),('lenovo-k12'),('lenovo-k10-plus'),('lenovo-k10'),('lenovo-k9'),('lenovo-k8-plus'),('lenovo-k8-note'),('lenovo-k6-note'),('lenovo-z6-pro'),('lenovo-z6'),('lenovo-z5s'),('lenovo-z5'),('lenovo-s5-pro'),('lenovo-a7'),('lenovo-a6-note'),('lenovo-vibe-x3'),('lenovo-vibe-k5'),('lenovo-p2')) as keep(slug));

  insert into public.categories (name, slug, parent_id)
  select v.name, v.slug, pid
  from (values
      ('لنوو Lenovo Legion Y90', 'lenovo-legion-y90'),
      ('لنوو Lenovo Legion Y70', 'lenovo-legion-y70'),
      ('لنوو Lenovo Legion Duel 2', 'lenovo-legion-duel-2'),
      ('لنوو Lenovo Legion Phone Duel', 'lenovo-legion-phone-duel'),
      ('لنوو Lenovo K15', 'lenovo-k15'),
      ('لنوو Lenovo K14 Plus', 'lenovo-k14-plus'),
      ('لنوو Lenovo K14', 'lenovo-k14'),
      ('لنوو Lenovo K13 Note', 'lenovo-k13-note'),
      ('لنوو Lenovo K12 Pro', 'lenovo-k12-pro'),
      ('لنوو Lenovo K12', 'lenovo-k12'),
      ('لنوو Lenovo K10 Plus', 'lenovo-k10-plus'),
      ('لنوو Lenovo K10', 'lenovo-k10'),
      ('لنوو Lenovo K9', 'lenovo-k9'),
      ('لنوو Lenovo K8 Plus', 'lenovo-k8-plus'),
      ('لنوو Lenovo K8 Note', 'lenovo-k8-note'),
      ('لنوو Lenovo K6 Note', 'lenovo-k6-note'),
      ('لنوو Lenovo Z6 Pro', 'lenovo-z6-pro'),
      ('لنوو Lenovo Z6', 'lenovo-z6'),
      ('لنوو Lenovo Z5s', 'lenovo-z5s'),
      ('لنوو Lenovo Z5', 'lenovo-z5'),
      ('لنوو Lenovo S5 Pro', 'lenovo-s5-pro'),
      ('لنوو Lenovo A7', 'lenovo-a7'),
      ('لنوو Lenovo A6 Note', 'lenovo-a6-note'),
      ('لنوو Lenovo Vibe X3', 'lenovo-vibe-x3'),
      ('لنوو Lenovo Vibe K5', 'lenovo-vibe-k5'),
      ('لنوو Lenovo P2', 'lenovo-p2')
  ) as v(name, slug)
  on conflict (slug) do update set name = excluded.name, parent_id = excluded.parent_id;
end $$;

-- Check result:
-- select p.name as brand, count(c.id) as models from public.categories p left join public.categories c on c.parent_id = p.id where p.parent_id is null group by p.name order by p.name;
