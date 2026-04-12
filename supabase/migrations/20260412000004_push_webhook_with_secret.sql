-- Reemplaza la función del webhook con el secret embebido.
-- Para rotar el secret: actualizar esta función y redeployar en Vercel.

create or replace function public.handle_new_order_push()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
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
                 'Content-Type',     'application/json',
                 'x-webhook-secret', 'b051ecc20c99a82f372cf430c30452f1e43e5cd8574411aaea46661e872931db'
               )
  );
  return new;
end;
$$;
