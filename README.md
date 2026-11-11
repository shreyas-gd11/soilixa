# Soilixa

Smart farming platform with a fertilizer marketplace, cart, checkout, and Supabase-backed order management.

## Project structure

```
Soilixa/
├── frontend/              # Static site (Netlify)
│   ├── index.html
│   ├── checkout.html
│   ├── order-success.html
│   ├── css/
│   ├── js/
│   │   ├── config.js      # API base URL (update after Render deploy)
│   │   └── script.js
│   ├── images/
│   ├── robots.txt
│   └── sitemap.xml
├── backend/               # Express API (Render)
│   ├── server.js
│   ├── package.json
│   ├── .env               # Backend secrets (not committed)
│   ├── .env.example
│   ├── api/
│   ├── routes/
│   ├── services/
│   │   └── supabase/
│   ├── utils/
│   └── data/
├── .gitignore
└── README.md
```

## Local development

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your Supabase credentials
npm install
npm start
```

API runs at `http://localhost:3000`.

Test health:

```bash
curl http://localhost:3000/health
```

Test products:

```bash
curl http://localhost:3000/api/products
```

Create `backend/.env` from `backend/.env.example` and enter rotated credentials. The backend does not read the legacy root `.env`.

### Frontend

Serve the `frontend/` folder with any static file server:

```bash
# VS Code Live Server (port 5500)
# or
npx serve frontend
```

Open the site in your browser. API calls use `frontend/js/config.js`.

## Environment variables (backend)

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only; used for order and request writes) |
| `SUPABASE_ANON_KEY` | Public anon key used for product reads under read-only RLS |
| `PORT` | API port (default `3000`; Render sets this automatically) |

Example `backend/.env`:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=3000
```

Production CORS is restricted to `https://soilixa.com` and `https://www.soilixa.com`. Use the custom domain on Netlify for production traffic.

## API configuration (frontend)

After deploying the backend to Render, set the single `apiBaseUrl` value in `frontend/js/config.js`. Set the WhatsApp number and UPI ID in the same config file.

### Secret exposure

The previously tracked root `.env` and `node_modules` are now untracked and ignored. Treat every credential that was ever in Git as compromised: rotate Supabase keys and any other exposed credentials, then purge `.env` from Git history. History rewrite commands (run only after coordinating with collaborators):

```bash
git filter-repo --path .env --invert-paths
git push --force --all
git push --force --tags
```

For local development, requests to `localhost` / `127.0.0.1` automatically use `http://localhost:3000`.

## Deployment

### Netlify

| Setting | Value |
|---------|-------|
| Base directory | *(repo root)* |
| Build command | *(none — static site)* |
| Publish directory | `frontend` |

Set `apiBaseUrl`, `whatsappNumber`, and `upiId` in `frontend/js/config.js` after deployment. CORS permits only `soilixa.com` and its `www` subdomain in production; attach the custom domain to Netlify.

### Render

| Setting | Value |
|---------|-------|
| Root directory | `backend` |
| Build command | `npm install` |
| Start command | `npm start` |

Required environment variables on Render:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY` (products read through the anon key and read-only products RLS)

## API routes

- `GET /health` — health check
- `GET /api/products` — list available products
- `GET /api/products/:id` — single product
- `POST /api/orders` — create order with items
- `POST /api/requests` — save a contact or soil-test request and consent record
- `GET /api/orders/:orderNumber` — fetch order
- `GET /api/orders/:orderNumber/invoice` — download PDF invoice

## Database schema

SQL schema: `backend/supabase/schema.sql` (same schema is mirrored at `backend/services/supabase/schema.sql`). Run it in the Supabase SQL editor.
