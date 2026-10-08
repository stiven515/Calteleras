-- Verificación manual de RLS. NO se ha ejecutado contra una base real: correrla en el editor SQL
-- de Supabase (o con `psql`) después de aplicar 0001_init.sql. Todo ocurre dentro de una
-- transacción que termina en ROLLBACK, así que no deja datos.
-- Si algo falla, lanza una excepción con el motivo; si termina sin error, las políticas cumplen.

begin;

-- Dos usuarios de prueba
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'a@test.local'),
  ('00000000-0000-0000-0000-00000000000b', 'b@test.local');

-- A crea un diseño privado y otro público
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}';
insert into public.designs (id, user_id, template_id, format_id, data, is_public) values
  ('aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a', 't', 'f', '{}', false),
  ('aaaaaaaa-0000-0000-0000-000000000002', '00000000-0000-0000-0000-00000000000a', 't', 'f', '{}', true);

do $$ begin
  if (select count(*) from public.designs) <> 2 then raise exception 'A debe ver sus 2 diseños'; end if;
end $$;

-- B no ve el privado de A, pero sí el público
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated"}';
do $$ begin
  if (select count(*) from public.designs) <> 1 then raise exception 'B debe ver solo el diseño público de A'; end if;
  if exists (select 1 from public.designs where id = 'aaaaaaaa-0000-0000-0000-000000000001') then
    raise exception 'B ve el diseño privado de A';
  end if;
end $$;

-- B no puede modificar ni borrar lo de A (0 filas afectadas)
do $$
declare n int;
begin
  update public.designs set title = 'hack' where id = 'aaaaaaaa-0000-0000-0000-000000000002';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'B pudo actualizar un diseño de A'; end if;
  delete from public.designs where id = 'aaaaaaaa-0000-0000-0000-000000000002';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'B pudo borrar un diseño de A'; end if;
end $$;

-- B no puede crear filas a nombre de A
do $$ begin
  begin
    insert into public.designs (id, user_id, template_id, format_id, data)
    values ('bbbbbbbb-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a', 't', 'f', '{}');
    raise exception 'B pudo insertar a nombre de A';
  exception when insufficient_privilege or check_violation then null;
  end;
end $$;

-- B no puede "robar" una fila de A haciendo upsert con el mismo id
do $$ begin
  begin
    insert into public.designs (id, user_id, template_id, format_id, data)
    values ('aaaaaaaa-0000-0000-0000-000000000002', '00000000-0000-0000-0000-00000000000b', 't', 'f', '{}')
    on conflict (id) do update set user_id = excluded.user_id;
    raise exception 'B pudo apropiarse de un diseño de A';
  exception when insufficient_privilege or check_violation or unique_violation then null;
  end;
end $$;

-- Sin sesión (anon) solo se ve lo público
reset role;
set local role anon;
set local request.jwt.claims = '{"role":"anon"}';
do $$ begin
  if (select count(*) from public.designs) <> 1 then raise exception 'anon debe ver solo lo público'; end if;
  if (select count(*) from public.brand_kits) <> 0 then raise exception 'anon no debe ver kits de marca'; end if;
end $$;

rollback;
