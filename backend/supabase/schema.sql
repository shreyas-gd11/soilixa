-- Supabase schema for Soilixa
-- Run this on your Supabase project (SQL editor)

create extension if not exists "pgcrypto";

-- Products table
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  description text,
  short_description text,
  crop text,
  growth_stage text,
  source_category text,
  recommended_crops text[],
  badges text[],
  benefits text[],
  price numeric(12,2) not null,
  unit text,
  image_url text,
  stock_quantity integer default 0,
  is_available boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Orders table
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_name text not null,
  phone text not null,
  email text,
  address text not null,
  village text,
  taluk text,
  district text,
  state text,
  pincode text,
  order_notes text,
  subtotal numeric(12,2),
  delivery_charge numeric(12,2),
  gst numeric(12,2),
  total_amount numeric(12,2),
  payment_status text default 'Pending Payment Verification',
  payment_method text default 'UPI',
  order_status text default 'New',
  consent boolean not null default false,
  consent_timestamp timestamptz,
  consent_policy_version text,
  created_at timestamptz default now()
);

-- Order items
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  product_name text,
  price numeric(12,2),
  quantity integer,
  total numeric(12,2)
);

create table if not exists farmer_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  message text not null,
  village text,
  taluk text,
  district text,
  pincode text,
  request_type text not null default 'contact',
  consent boolean not null,
  consent_timestamp timestamptz not null,
  consent_policy_version text not null,
  created_at timestamptz not null default now()
);

alter table orders add column if not exists consent boolean not null default false;
alter table orders add column if not exists consent_timestamp timestamptz;
alter table orders add column if not exists consent_policy_version text;

-- Products are publicly readable only when available. Product queries use the anon key.
alter table products enable row level security;
revoke insert, update, delete on products from anon, authenticated;
grant select on products to anon, authenticated;
drop policy if exists "Public read available products" on products;
create policy "Public read available products"
  on products
  for select
  to anon, authenticated
  using (is_available = true);
