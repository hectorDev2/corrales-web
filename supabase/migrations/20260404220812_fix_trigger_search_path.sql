-- Fix: el trigger se ejecuta en el contexto del schema auth.
-- Sin search_path explícito, Postgres no encuentra public.profiles ni public.user_role.
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'delivery')::public.user_role
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;
