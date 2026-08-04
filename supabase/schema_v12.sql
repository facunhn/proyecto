-- Parte 12: panel de administración de denuncias, seguir negocios (con aviso de
-- promos nuevas), y aviso al negocio cuando recibe una reseña nueva.
-- Se suma a lo que ya existe, no hace falta volver a correr los anteriores.

-- 1) Panel de administración de denuncias.
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists(select 1 from public.admins where user_id = auth.uid());
$$;

grant execute on function public.is_admin() to authenticated;

alter table public.reports add column if not exists resolved boolean not null default false;

create policy "Los administradores ven todas las denuncias"
  on public.reports for select
  to authenticated
  using (public.is_admin());

create policy "Los administradores actualizan las denuncias"
  on public.reports for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Para convertirte en administrador (solo vos deberías serlo), corré esto
-- reemplazando el email por el tuyo:
--   insert into public.admins (user_id) select id from auth.users where email = 'tu-email@ejemplo.com';

-- 2) Seguir un negocio: aviso automático cada vez que publica una promo nueva.
create table if not exists public.business_follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, business_id)
);

alter table public.business_follows enable row level security;

create policy "Un usuario ve a quién sigue"
  on public.business_follows for select
  to authenticated
  using (auth.uid() = follower_id);

create policy "Un usuario sigue negocios"
  on public.business_follows for insert
  to authenticated
  with check (auth.uid() = follower_id and auth.uid() <> business_id);

create policy "Un usuario deja de seguir negocios"
  on public.business_follows for delete
  to authenticated
  using (auth.uid() = follower_id);

create or replace function public.notify_followers_on_new_promo()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, message)
  select follower_id, new.business || ' publicó una promo nueva: ' || new.discount_label
  from public.business_follows
  where business_id = new.owner_id;
  return new;
end;
$$;

drop trigger if exists trg_notify_followers_on_new_promo on public.promos;
create trigger trg_notify_followers_on_new_promo
  after insert on public.promos
  for each row execute function public.notify_followers_on_new_promo();

-- 3) Aviso al negocio cuando recibe una reseña nueva (no en ediciones).
create or replace function public.notify_business_on_new_review()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, message)
  values (new.business_id, 'Recibiste una nueva reseña (' || new.rating || ' de 5 estrellas).');
  return new;
end;
$$;

drop trigger if exists trg_notify_business_on_new_review on public.business_reviews;
create trigger trg_notify_business_on_new_review
  after insert on public.business_reviews
  for each row execute function public.notify_business_on_new_review();
