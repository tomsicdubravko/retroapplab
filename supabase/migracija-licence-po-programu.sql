-- Licence po programu (zavrsni, doh)
-- Projekt: zavrsni-racun. Pokrenuti jednom, u SQL Editoru, sve odjednom.
-- Sve je u jednoj transakciji: ako bilo što ne uspije, ništa se ne mijenja.
-- Postojeći Završni račun radi i dalje bez promjene koda:
-- check_licence(p_device) bez programa znači 'zavrsni'.

begin;

-- 1. Svaka licenca dobiva program. Postojeće licence postaju 'zavrsni'.
alter table public.licence
  add column product text not null default 'zavrsni';

alter table public.licence
  add constraint licence_product_check check (product in ('zavrsni', 'doh'));

-- 2. Umjesto "jedna licenca po korisniku": jedna licenca po korisniku i programu.
alter table public.licence drop constraint licence_user_id_key;
alter table public.licence
  add constraint licence_user_product_key unique (user_id, product);

-- Računala (licence_devices) vezana su za licence_id, pa se sama vode po programu.

-- 3. Provjera licence za zadani program.
drop function public.check_licence(text);

create function public.check_licence(p_device text, p_product text default 'zavrsni')
 returns json
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  l public.licence;
  n int;
begin
  if auth.uid() is null then
    return json_build_object('ok', false, 'reason', 'not_logged_in');
  end if;
  select * into l from public.licence
   where user_id = auth.uid() and product = coalesce(p_product, 'zavrsni');
  if not found then
    return json_build_object('ok', false, 'reason', 'no_licence');
  end if;
  if l.valid_until < current_date then
    return json_build_object('ok', false, 'reason', 'expired', 'valid_until', l.valid_until);
  end if;
  if coalesce(length(p_device), 0) < 16 then
    return json_build_object('ok', false, 'reason', 'bad_device');
  end if;
  if exists (select 1 from public.licence_devices where licence_id = l.id and device_id = p_device) then
    update public.licence_devices set last_seen = now() where licence_id = l.id and device_id = p_device;
  else
    select count(*) into n from public.licence_devices where licence_id = l.id;
    if n >= l.max_devices then
      return json_build_object('ok', false, 'reason', 'other_device');
    end if;
    insert into public.licence_devices (licence_id, device_id) values (l.id, p_device);
  end if;
  return json_build_object('ok', true, 'product', l.product, 'valid_until', l.valid_until,
    'days_left', l.valid_until - current_date, 'email', l.email);
end;
$function$;

-- 4. Za izbornik: sve licence prijavljenog korisnika (bez vezanja računala).
create function public.my_licences()
 returns table(product text, valid_until date, days_left integer)
 language sql
 stable
 security definer
 set search_path to 'public'
as $function$
  select l.product, l.valid_until, (l.valid_until - current_date)::integer
  from public.licence l
  where l.user_id = auth.uid()
  order by l.product;
$function$;

-- 5. Administracija: dodjela licence za program (bez programa = zavrsni).
drop function public.admin_set_licence(text, date, integer);

create function public.admin_set_licence(p_email text, p_until date, p_max integer, p_product text default 'zavrsni')
 returns void
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare uid uuid;
begin
  if not public.is_admin() then raise exception 'not_admin'; end if;
  select id into uid from auth.users where lower(email) = lower(trim(p_email));
  if uid is null then raise exception 'no_user'; end if;
  insert into public.licence (user_id, email, valid_until, max_devices, product)
  values (uid, lower(trim(p_email)), p_until, greatest(coalesce(p_max, 1), 1), coalesce(p_product, 'zavrsni'))
  on conflict (user_id, product) do update
    set valid_until = excluded.valid_until, max_devices = excluded.max_devices;
end; $function$;

-- 6. Administracija: odvezivanje računala za program (bez programa = svi programi, kao dosad).
drop function public.admin_reset_devices(text);

create function public.admin_reset_devices(p_email text, p_product text default null)
 returns void
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
begin
  if not public.is_admin() then raise exception 'not_admin'; end if;
  delete from public.licence_devices
  where licence_id in (
    select l.id from public.licence l join auth.users u on u.id = l.user_id
    where lower(u.email) = lower(trim(p_email))
      and (p_product is null or l.product = p_product));
end; $function$;

-- 7. Administracija: popis, sada s programom (jedan redak po licenci).
drop function public.admin_list();

create function public.admin_list()
 returns table(email text, product text, valid_until date, max_devices integer, devices bigint,
               last_seen timestamp with time zone, last_sign_in timestamp with time zone)
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
begin
  if not public.is_admin() then raise exception 'not_admin'; end if;
  return query
    select u.email::text, l.product, l.valid_until, l.max_devices,
           (select count(*) from public.licence_devices d where d.licence_id = l.id),
           (select max(d.last_seen) from public.licence_devices d where d.licence_id = l.id),
           u.last_sign_in_at
    from auth.users u left join public.licence l on l.user_id = u.id
    order by u.email, l.product;
end; $function$;

-- 8. Pravo pozivanja funkcija. Tablice ostaju zatvorene (RLS bez pravila);
--    sve ide samo kroz ove funkcije, a administratorske provjeravaju is_admin().
grant execute on function public.check_licence(text, text) to anon, authenticated;
grant execute on function public.my_licences() to authenticated;
grant execute on function public.admin_set_licence(text, date, integer, text) to authenticated;
grant execute on function public.admin_reset_devices(text, text) to authenticated;
grant execute on function public.admin_list() to authenticated;

commit;

-- Provjera nakon pokretanja (pokrenuti zasebno):
-- select email, product, valid_until, max_devices from public.licence order by email, product;
-- Sve postojeće licence trebaju imati product = 'zavrsni'.
