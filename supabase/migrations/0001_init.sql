-- Cartelera: esquema inicial. Se aplica en el editor SQL de Supabase o con `supabase db push`.
-- Principio: cada fila pertenece a un usuario (user_id) y la seguridad se impone con RLS en la
-- base de datos, no en el cliente. Con la anon key pública, sin sesión, solo se pueden leer
-- los diseños marcados como públicos.

-- ───────────────────────── Perfiles ─────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "profiles: leer el propio" on public.profiles
  for select to authenticated using (id = auth.uid());
create policy "profiles: actualizar el propio" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)));
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ───────────────────────── Diseños ─────────────────────────
create table public.designs (
  id uuid primary key,                       -- lo genera el cliente (funciona sin conexión)
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  template_id text not null,
  format_id text not null,
  title text not null default '',
  data jsonb not null,                       -- el documento Design completo (versionado con data.v)
  is_public boolean not null default false,
  thumbnail_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index designs_user_updated_idx on public.designs (user_id, updated_at desc);
alter table public.designs enable row level security;

create policy "designs: leer propios o públicos" on public.designs
  for select using (user_id = auth.uid() or is_public);
create policy "designs: crear propios" on public.designs
  for insert to authenticated with check (user_id = auth.uid());
create policy "designs: actualizar propios" on public.designs
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "designs: borrar propios" on public.designs
  for delete to authenticated using (user_id = auth.uid());

-- ───────────────────────── Kit de marca ─────────────────────────
create table public.brand_kits (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.brand_kits enable row level security;

create policy "brand_kits: solo el dueño" on public.brand_kits
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ───────────────────────── Imágenes (Storage) ─────────────────────────
-- Ruta: <user_id>/<asset_id>. El bucket es público para poder mostrar diseños compartidos;
-- los asset_id son UUID v4 (no adivinables). La API (listar/subir/borrar) solo la usa el dueño.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('assets', 'assets', true, 5242880, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

create policy "assets: listar/descargar propios" on storage.objects
  for select to authenticated
  using (bucket_id = 'assets' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "assets: subir en la carpeta propia" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'assets' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "assets: actualizar propios" on storage.objects
  for update to authenticated
  using (bucket_id = 'assets' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "assets: borrar propios" on storage.objects
  for delete to authenticated
  using (bucket_id = 'assets' and (storage.foldername(name))[1] = auth.uid()::text);
