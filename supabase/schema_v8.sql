-- Parte 8: arregla que cualquier cuenta logueada (incluso "persona") pudiera
-- subir archivos al bucket de fotos de promos. Ahora solo cuentas "negocio"
-- pueden subir fotos, igual que ya pasa para publicar una promoción.

drop policy if exists "Usuarios logueados suben fotos de promos" on storage.objects;

create policy "Solo negocios suben fotos de promos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'promo-photos' and public.is_negocio());
