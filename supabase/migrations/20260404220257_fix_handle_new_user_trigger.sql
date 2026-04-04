-- Fix: castear a user_role DESPUÉS del coalesce, no antes.
-- El cast de null a un enum falla en Postgres antes de que coalesce pueda actuar.
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'delivery')::user_role
  );
  return new;
end;
$$ language plpgsql security definer;
