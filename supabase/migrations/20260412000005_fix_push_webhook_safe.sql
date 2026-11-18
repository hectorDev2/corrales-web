-- Habilita pg_net (necesario para net.http_post)
create extension if not exists pg_net schema extensions;

-- Reemplaza la función con manejo de errores:
-- una falla en el webhook NUNCA debe reventar la transacción del pedido.
create or replace function public.handle_new_order_push()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
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
  exception when others then
    -- La notificación falló pero el pedido se guarda igual
    null;
  end;
  return new;
end;
$$;
