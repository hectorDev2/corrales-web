-- Webhook trigger: notifica al endpoint de Web Push cuando llega un pedido nuevo.
-- La URL de destino es fija; el secret se lee del setting de base de datos
-- configurado con: ALTER DATABASE postgres SET app.push_notify_secret = '<secret>'

create or replace function public.handle_new_order_push()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  _secret text := current_setting('app.push_notify_secret', true);
begin
  perform net.http_post(
    url     := 'https://corrales-web.vercel.app/api/admin/push/notify',
    body    := jsonb_build_object(
                 'type',       'INSERT',
                 'table',      'orders',
                 'schema',     'public',
                 'record',     row_to_json(new)::jsonb,
                 'old_record', null
               )::text,
    headers := jsonb_build_object(
                 'Content-Type',      'application/json',
                 'x-webhook-secret',  coalesce(_secret, '')
               )
  );
  return new;
end;
$$;

create trigger on_new_order_push_notify
  after insert on public.orders
  for each row execute procedure public.handle_new_order_push();
