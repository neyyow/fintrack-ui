# FinTrack UI

A React (Vite) frontend for your FinTrackAPI, styled as a "personal ledger / passbook" —
inspired by Money Manager (RealByte), with warm paper tones, a deep pine-green brand color,
and monospace amounts so numbers line up like a real ledger.

## 1. Set your API URL

Copy the example env file and paste in your MonsterASP.NET URL:

```bash
cp .env.example .env
```

Edit `.env`:

```
VITE_API_BASE_URL=https://your-app-name.runasp.net
```

## 2. Install & run

Open this folder in VS Code, then in the integrated terminal:

```bash
npm install
npm run dev
```

Visit the URL Vite prints (usually `http://localhost:5173`).

## Pages

- **/login**, **/register** — auth, calls `POST /login` and `POST /register`
- **/** (Dashboard) — pulls `GET /summary`, `GET /expense`, `GET /income`; shows totals,
  a category breakdown pie chart, and recent entries
- **/expenses** — full CRUD against `GET/POST/PUT/DELETE /expense`
- **/income** — create/read/delete against `GET/POST/DELETE /income` (your API has no
  income update endpoint yet, so editing isn't wired up — add a `PUT /income/{id}` on
  the backend if you want that later)
- **/budget** — visualizes income vs. expenses from `/summary`, plus a category
  breakdown. The "monthly spending target" is stored in the browser only (localStorage),
  since the API doesn't have a budget-target endpoint — a good next feature to add
  server-side.

## Notes on the API contract

- JWT is stored in `localStorage` and attached automatically to every request
  (see `src/api/client.js`). A 401 response clears the token and redirects to `/login`.
- The backend expects PascalCase JSON keys (`Amount`, `Category`, etc.) — the API
  layer in `src/api/*.js` already sends the right shape, and the UI reads both
  PascalCase and camelCase back, in case ASP.NET's default serializer casing changes.
- CORS is already open on the API side (`AllowAnyOrigin`), so no proxy config is needed.

## Next improvements to consider

- Wire up income editing once a `PUT /income/{id}` endpoint exists
- Date-range filtering on Expenses/Income
- Real server-side budgets per category
- Recurring transactions
- Pagination once transaction lists grow large
