-- Parte 2: pegá y corré esto en el SQL Editor de Supabase (uno solo, todo junto).
-- No hace falta volver a correr schema.sql, esto se suma a lo que ya existe.

-- 1) Foto del comercio en cada promo
alter table public.promos add column if not exists image_url text;
alter table public.promos add column if not exists image_path text;

-- 2) Permitir que el dueño de una promo la edite o la borre
create policy "Dueños pueden editar sus promos"
  on public.promos for update
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Dueños pueden borrar sus promos"
  on public.promos for delete
  to authenticated
  using (auth.uid() = owner_id);

-- 3) Favoritos, uno por usuario y promo
create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  promo_id bigint not null references public.promos(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, promo_id)
);

alter table public.favorites enable row level security;

create policy "Cada usuario ve solo sus favoritos"
  on public.favorites for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Cada usuario agrega sus propios favoritos"
  on public.favorites for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Cada usuario borra sus propios favoritos"
  on public.favorites for delete
  to authenticated
  using (auth.uid() = user_id);

-- 4) Historial de canjes (cuando alguien toca "Mostrar código en el local")
create table if not exists public.redemptions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  promo_id bigint not null references public.promos(id) on delete cascade,
  redeemed_at timestamptz not null default now()
);

alter table public.redemptions enable row level security;

create policy "Cada usuario ve su propio historial"
  on public.redemptions for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Cada usuario registra sus propios canjes"
  on public.redemptions for insert
  to authenticated
  with check (auth.uid() = user_id);

-- 5) Notificaciones dentro de la app (no son push al celular, se ven al entrar a la app)
create table if not exists public.notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "Cada usuario ve sus propias notificaciones"
  on public.notifications for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Cada usuario marca como leídas sus notificaciones"
  on public.notifications for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Notificación de bienvenida automática al crear una cuenta
create or replace function public.handle_new_user_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, message)
  values (new.id, '¡Bienvenido/a a Ahorrix! Ya podés buscar y guardar promociones.');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user_notification();

-- Notificación automática al dueño de una promo cuando alguien la guarda como favorita
create or replace function public.handle_new_favorite_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  promo_owner uuid;
  promo_business text;
begin
  select owner_id, business into promo_owner, promo_business from public.promos where id = new.promo_id;
  if promo_owner is not null and promo_owner <> new.user_id then
    insert into public.notifications (user_id, message)
    values (promo_owner, 'Alguien guardó "' || promo_business || '" como favorita.');
  end if;
  return new;
end;
$$;

drop trigger if exists on_favorite_created on public.favorites;
create trigger on_favorite_created
  after insert on public.favorites
  for each row execute function public.handle_new_favorite_notification();

-- 6) Espacio de almacenamiento para las fotos de las promos
insert into storage.buckets (id, name, public)
values ('promo-photos', 'promo-photos', true)
on conflict (id) do nothing;

create policy "Cualquiera puede ver las fotos de promos"
  on storage.objects for select
  using (bucket_id = 'promo-photos');

create policy "Usuarios logueados suben fotos de promos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'promo-photos');

create policy "Dueños borran sus propias fotos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'promo-photos' and owner = auth.uid());
