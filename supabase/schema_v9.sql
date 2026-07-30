-- Parte 9: arregla los dos puntos menores de la auditoría.

-- 1) Las reseñas ahora solo se pueden dejar sobre cuentas de tipo "negocio"
--    de verdad (antes se podía reseñar cualquier uuid, aunque en la práctica
--    la app nunca lo permitía desde la pantalla).
create or replace function public.is_business_account(target_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce((raw_user_meta_data ->> 'accountType') = 'negocio', false)
  from auth.users where id = target_id;
$$;

grant execute on function public.is_business_account(uuid) to authenticated;

drop policy if exists "Un usuario deja su propia reseña" on public.business_reviews;
create policy "Un usuario deja su propia reseña"
  on public.business_reviews for insert
  to authenticated
  with check (
    auth.uid() = reviewer_id
    and business_id <> reviewer_id
    and public.is_business_account(business_id)
  );

-- 2) Limpieza automática de fotos huérfanas: una vez por semana, borra del
--    bucket "promo-photos" cualquier archivo que ya no esté referenciado por
--    ninguna promoción (por ejemplo, si se cortó la conexión al borrar una
--    cuenta justo entre borrar las promos y borrar sus fotos).
create or replace function public.cleanup_orphaned_promo_photos()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from storage.objects
  where bucket_id = 'promo-photos'
    and name not in (
      select unnest(photo_paths) from public.promos
    );
end;
$$;

select cron.unschedule('cleanup-orphaned-photos') where exists (
  select 1 from cron.job where jobname = 'cleanup-orphaned-photos'
);
select cron.schedule('cleanup-orphaned-photos', '0 4 * * 0', $$select public.cleanup_orphaned_promo_photos();$$);
