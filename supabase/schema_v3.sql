-- Parte 3: pegá y corré esto en el SQL Editor de Supabase (se suma a schema.sql y schema_v2.sql).

-- Arregla un hueco de seguridad: antes, cualquier usuario logueado (aunque fuera
-- cuenta "persona") podía publicar una promoción manipulando la app. Ahora la
-- base de datos verifica de verdad que la cuenta sea de tipo "negocio".

create or replace function public.is_negocio()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() -> 'user_metadata' ->> 'accountType') = 'negocio', false);
$$;

drop policy if exists "Usuarios logueados pueden publicar promos" on public.promos;

create policy "Solo cuentas de negocio pueden publicar promos"
  on public.promos for insert
  to authenticated
  with check (auth.uid() = owner_id and public.is_negocio());
