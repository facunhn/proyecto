-- Pegá y corré esto en el SQL Editor de Supabase (Project → SQL Editor → New query → Run).

create table if not exists public.promos (
  id bigint generated always as identity primary key,
  business text not null,
  category text not null,
  discount_label text not null,
  description text default '',
  expiry text default '',
  is_bank boolean not null default false,
  code text default '',
  redeem_hint text default '',
  d_lat double precision default 0,
  d_lon double precision default 0,
  owner_id uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.promos enable row level security;

create policy "Promos son de lectura pública"
  on public.promos for select
  using (true);

create policy "Usuarios logueados pueden publicar promos"
  on public.promos for insert
  to authenticated
  with check (auth.uid() = owner_id);

-- Datos de ejemplo, los mismos que ya vienen precargados en la app.
insert into public.promos (business, category, discount_label, description, expiry, is_bank, code, redeem_hint, d_lat, d_lon) values
  ('Panadería Norte', 'Gastronomía', '20% OFF', 'En panificados y facturas de la casa, todos los días.', '31/08', false, 'PAN20NRT', 'Mostrar código en caja', 0.0026, 0.0026),
  ('Farmacity Centro', 'Farmacias', '2do al 70%', '2do producto de perfumería e higiene al 70% de descuento.', '15/09', false, 'FARM2X70', 'Mostrar código en caja', -0.0057, 0.0057),
  ('Banco Andes', 'Bancos', '30% OFF', 'Con tarjeta de crédito Banco Andes, todos los jueves, tope de reintegro $6000.', '30/09', true, 'BAND30JUE', 'Pagar con tarjeta adherida', 0, 0),
  ('DíaSuper', 'Supermercados', '3x2', 'En almacén y bebidas seleccionadas, todos los fines de semana.', '20/08', false, 'DIA3X2FDS', 'Mostrar código en caja', 0.0076, -0.0076),
  ('Urbana Ropa', 'Retail', '25% OFF', 'En la nueva colección de invierno, todos los locales del país.', '10/09', false, 'URB25INV', 'Mostrar código en caja', -0.0134, -0.0134),
  ('Banco Sur', 'Bancos', '15% OFF', 'En supermercados, con tope de reintegro $4000, pagando con billetera Sur.', '28/08', true, 'SUR15SUP', 'Pagar con billetera Sur', 0, 0),
  ('Trattoria Bianca', 'Gastronomía', '2x1 pastas', 'De domingo a jueves, no acumulable con otras promociones.', '05/09', false, 'BIANCA2X1', 'Mostrar código al mozo', 0.0102, 0.0102),
  ('Farmalife', 'Farmacias', '15% OFF', 'En medicamentos de venta libre y dermocosmética.', '12/09', false, 'LIFE15DVL', 'Mostrar código en caja', -0.0191, 0.0191),
  ('MegaHogar', 'Retail', '6 cuotas sin interés', 'En electrodomésticos de línea blanca, pagando con tarjetas adheridas.', '25/09', false, 'MEGA6SI', 'Pagar con tarjeta adherida', 0.028, -0.028),
  ('CoopMarket', 'Supermercados', '10% OFF', 'Todos los martes y miércoles, en compras superiores a $10000.', '18/08', false, 'COOP10MX', 'Mostrar código en caja', -0.0045, -0.0045);
