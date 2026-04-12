-- Push subscriptions for Web Push notifications
create table if not exists public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users not null,
  endpoint   text not null unique,
  p256dh     text not null,
  auth_key   text not null,
  created_at timestamptz default now()
);

alter table public.push_subscriptions enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'push_subscriptions'
      and policyname = 'Users manage own subscriptions'
  ) then
    create policy "Users manage own subscriptions"
      on public.push_subscriptions for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;
