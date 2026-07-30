-- Parte 10: reportar contenido (promociones o reseñas sospechosas/ofensivas).
-- Se suma a lo que ya existe.

create table if not exists public.reports (
  id bigint generated always as identity primary key,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('promo', 'review')),
  target_id bigint not null,
  reason text not null,
  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;

create policy "Cada usuario ve solo sus propias denuncias"
  on public.reports for select
  to authenticated
  using (auth.uid() = reporter_id);

create policy "Cada usuario crea sus propias denuncias"
  on public.reports for insert
  to authenticated
  with check (auth.uid() = reporter_id);

-- Para revisar las denuncias que lleguen, entrá al Table Editor de Supabase
-- y abrí la tabla "reports" (por ahora no hay panel de administración en la app).
