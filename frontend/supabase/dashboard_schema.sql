create extension if not exists pgcrypto;

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric not null,
  stock integer default 0,
  created_at timestamp default now()
);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  created_at timestamp default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id),
  total numeric not null,
  status text default 'pending',
  created_at timestamp default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id),
  product_id uuid references products(id),
  quantity integer not null,
  price numeric not null
);

create table if not exists ai_insights (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  created_at timestamp default now()
);

create index if not exists orders_status_idx on orders(status);
create index if not exists orders_created_at_idx on orders(created_at);
create index if not exists order_items_order_id_idx on order_items(order_id);
create index if not exists order_items_product_id_idx on order_items(product_id);
