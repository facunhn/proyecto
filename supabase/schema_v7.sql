-- Parte 7: varias fotos por promo, horario del comercio, límite de canjes
-- por promo, reseñas por negocio, y estadísticas con evolución en el tiempo.
-- Se suma a lo que ya existe, no hace falta volver a correr los anteriores.

-- 1) Varias fotos por promo (antes solo había una foto por promo).
alter table public.promos add column if not exists photo_urls text[] not null default '{}';
alter table public.promos add column if not exists photo_paths text[] not null default '{}';

-- 2) Horario de atención (opcional, lo carga el negocio al publicar).
alter table public.promos add column if not exists business_hours text;

-- 3) Límite de canjes por persona, configurable por el negocio al publicar.
--    Si queda vacío (null), no hay límite.
alter table public.promos add column if not exists redemption_limit int;

create or replace function public.check_redemption_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  limit_val int;
  current_count int;
begin
  select redemption_limit into limit_val from public.promos where id = new.promo_id;
  if limit_val is not null then
    select count(*) into current_count from public.redemptions
      where promo_id = new.promo_id and user_id = new.user_id;
    if current_count >= limit_val then
      raise exception 'redemption_limit_reached';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_check_redemption_limit on public.redemptions;
create trigger trg_check_redemption_limit
  before insert on public.redemptions
  for each row execute function public.check_redemption_limit();

-- 4) Reseñas y calificación por negocio (no por promoción individual).
create table if not exists public.business_reviews (
  id bigint generated always as identity primary key,
  business_id uuid not null references auth.users(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (business_id, reviewer_id)
);

alter table public.business_reviews enable row level security;

create policy "Las reseñas son de lectura pública"
  on public.business_reviews for select
  using (true);

create policy "Un usuario deja su propia reseña"
  on public.business_reviews for insert
  to authenticated
  with check (auth.uid() = reviewer_id and business_id <> reviewer_id);

create policy "Un usuario edita su propia reseña"
  on public.business_reviews for update
  to authenticated
  using (auth.uid() = reviewer_id)
  with check (auth.uid() = reviewer_id);

create policy "Un usuario borra su propia reseña"
  on public.business_reviews for delete
  to authenticated
  using (auth.uid() = reviewer_id);

-- 5) Estadísticas de canjes con evolución en los últimos 14 días,
--    para el gráfico en "Publicar".
create or replace function public.get_my_promo_timeseries()
returns table(day date, redemptions_count bigint)
language sql
security definer
set search_path = public
as $$
  select d::date as day, count(r.id) as redemptions_count
  from generate_series(current_date - interval '13 days', current_date, interval '1 day') d
  left join public.redemptions r
    on r.redeemed_at::date = d::date
    and r.promo_id in (select id from public.promos where owner_id = auth.uid())
  group by d
  order by d;
$$;
