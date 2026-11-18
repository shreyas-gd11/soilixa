# Soilixa

Bilingual, mobile-first agriculture services and product catalogue for Karnataka farmers.

## Project structure

- `frontend/` — static site published by Netlify
- `backend/` — Express API for order management (planned Render deployment)

## Run locally

Serve `frontend/` from a local HTTP server (do not open `index.html` via `file://`):

```powershell
cd frontend
python -m http.server 5500
```

Open `http://localhost:5500`. The homepage reads products and submits contact requests directly to Supabase using the public anon key in `frontend/js/config.js`. The anon key is expected to be public; never put a Supabase service-role key in frontend code.

## Supabase setup

Run `backend/supabase/schema.sql` in the Supabase SQL editor. The product table is intended to have a public `SELECT` policy limited to `is_available = true`, with no anon/authenticated write grants. The contact form uses an `INSERT`-only policy for consented, length-limited requests; browser clients cannot read or alter lead records. The contact table and insert policy are now installed in the live Supabase project. The repo schema also removes the old broad product policies when applied. Use `frontend/js/config.js` only with the project URL and anon key.

The live `products` table uses `product_name` (not `name`); the browser catalog maps that actual column. The live project still has legacy public product policies; the page currently reads the 10 available products, but apply this SQL in the Supabase SQL editor to remove public product writes and duplicate broad read policies:

```sql
alter table public.products enable row level security;
revoke all on public.products from anon, authenticated;
grant select on public.products to anon, authenticated;
drop policy if exists "Allow insert products" on public.products;
drop policy if exists "Allow update products" on public.products;
drop policy if exists "Anyone can view products" on public.products;
drop policy if exists "Public can read products" on public.products;
drop policy if exists "Public read available products" on public.products;
create policy "Public read available products" on public.products for select to anon, authenticated using (is_available = true);
```

The product list is fetched when the page opens. Setting `is_available=false` or deleting a product removes it from the catalogue on the next page load/refresh; there is no realtime subscription. The cart is also reconciled with the current catalogue when it loads.

## Netlify

The existing root `netlify.toml` is already configured correctly:

| Setting | Value |
|---|---|
| Base directory | repository root |
| Build command | none |
| Publish directory | `frontend` |

No Netlify path setting change is needed. To deploy, push this repository to the connected Netlify site and trigger a deploy (or let the connected Git deploy run). Confirm the deploy settings above and that the site uses the intended custom domain. The public Supabase URL/anon key are in static browser config, not server environment variables, because this site has no build step. Never add a service-role key to Netlify frontend variables or files.

## Backend / orders

The Express API is not deployed yet. Existing checkout/order endpoints still need the backend deployed before server-backed order placement is available. Deploy `backend/` to Render with `npm install` / `npm start` and configure its Supabase server credentials there. The homepage catalogue and WhatsApp cart order message do not depend on the backend.

## Legal drafts

`frontend/terms.html` and `frontend/privacy.html` are drafts for lawyer review. Privacy draft proposes retaining contact requests for up to 12 months after the last interaction and acknowledges that deletion automation and final retention policy must be confirmed before publishing.
