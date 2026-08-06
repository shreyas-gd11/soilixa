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
