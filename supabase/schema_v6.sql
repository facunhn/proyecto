-- Parte 6: promos programadas + alertas de vencimiento.
-- Se suma a lo que ya existe, no hace falta volver a correr los anteriores.

-- 1) Promos programadas: fecha desde la cual una promo se hace visible.
--    Si "starts_at" queda vacío, la promo aparece apenas se publica (como hasta ahora).
alter table public.promos add column if not exists starts_at date;

-- 2) Alertas de vencimiento: una vez por día, le avisamos (por notificación,
--    y si tiene activados los avisos push, también por push) a cada usuario
--    que tiene guardada como favorita una promo que vence al día siguiente.
create extension if not exists pg_cron;

create or replace function public.notify_expiring_favorites()
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.notifications (user_id, message)
  select f.user_id, 'Se vence mañana: ' || p.business || ' (' || p.discount_label || ')'
  from public.favorites f
  join public.promos p on p.id = f.promo_id
  where p.expires_at = current_date + 1;
$$;

-- Corre todos los días a las 15:00 UTC (12:00 hora de Argentina).
-- Si querés otro horario, cambiá el '0 15 * * *' antes de correr esto.
select cron.unschedule('notify-expiring-favorites') where exists (
  select 1 from cron.job where jobname = 'notify-expiring-favorites'
);
select cron.schedule('notify-expiring-favorites', '0 15 * * *', $$select public.notify_expiring_favorites();$$);
