-- Pegá y corré esto en el SQL Editor de Supabase (Project → SQL Editor → New query → Run).
-- Agrega ubicación real (GPS) a cada promoción, para que el geolocalizador
-- muestre la distancia real hasta el comercio en vez de una ubicación de ejemplo.

alter table public.promos add column if not exists lat double precision;
alter table public.promos add column if not exists lon double precision;
