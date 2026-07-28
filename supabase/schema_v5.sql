-- Notificaciones push reales.
-- Antes de correr esto, reemplazá los dos placeholders de más abajo:
--   1) TU-PROJECT-REF                -> la referencia de tu proyecto (la parte de tu URL de Supabase,
--                                        ej: si tu URL es https://rsexmahwlbdvzuwdmocy.supabase.co,
--                                        el project-ref es "rsexmahwlbdvzuwdmocy")
--   2) TU_SECRETO_COMPARTIDO         -> un texto random que vos inventes (ej: una contraseña larga).
--                                        Tenés que configurar ESE MISMO valor como secreto
--                                        "PUSH_WEBHOOK_SECRET" de la Edge Function (ver instrucciones).

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

create policy "Cada usuario ve sus propias suscripciones push"
  on public.push_subscriptions for select
  using (auth.uid() = user_id);

create policy "Cada usuario crea sus propias suscripciones push"
  on public.push_subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Cada usuario borra sus propias suscripciones push"
  on public.push_subscriptions for delete
  using (auth.uid() = user_id);

-- Cada vez que se crea una notificación en la tabla "notifications", esto
-- llama a la Edge Function "send-push" para mandarla como notificación push real.
create or replace function public.notify_push_on_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform net.http_post(
    url := 'https://rsexmahwlbdvzuwdmocy.supabase.co/functions/v1/send-push',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer FACUNDONAHON110809'
    ),
    body := jsonb_build_object(
      'user_id', new.user_id,
      'title', 'Ahorrix',
      'body', new.message
    )
  );
  return new;
end;
$$;

drop trigger if exists trg_notify_push on public.notifications;
create trigger trg_notify_push
  after insert on public.notifications
  for each row execute function public.notify_push_on_insert();
