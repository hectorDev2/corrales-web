-- Enable Realtime for the orders table.
-- Without this, postgres_changes subscriptions on "orders" never fire.
alter table orders replica identity full;
alter publication supabase_realtime add table orders;
