-- Parte 4: pegá y corré esto en el SQL Editor de Supabase (se suma a lo anterior).

-- 1) Fecha de vencimiento real (antes era solo texto suelto tipo "31/08")
alter table public.promos add column if not exists expires_at date;

-- 2) Estadísticas de una promo, solo visibles para su propio dueño.
-- Es una función seguridad-definer: le permite al negocio ver cuántos favoritos y
-- canjes tuvo cada una de SUS promos, sin exponer quién las guardó o canjeó.
create or replace function public.get_my_promo_stats()
returns table (promo_id bigint, favorites_count bigint, redemptions_count bigint)
language sql
security definer
set search_path = public
as $$
  select
    p.id as promo_id,
    (select count(*) from public.favorites f where f.promo_id = p.id) as favorites_count,
    (select count(*) from public.redemptions r where r.promo_id = p.id) as redemptions_count
  from public.promos p
  where p.owner_id = auth.uid();
$$;

grant execute on function public.get_my_promo_stats() to authenticated;

-- 3) Borrar mi cuenta (y todo lo que publiqué). El usuario solo puede borrarse a
-- sí mismo (auth.uid()), nunca a otra persona.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.promos where owner_id = auth.uid();
  delete from auth.users where id = auth.uid();
end;
$$;

grant execute on function public.delete_my_account() to authenticated;
