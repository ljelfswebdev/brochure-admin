# Brochure Admin App

Minimal scaffold matching your brief.

## Quickstart

1. Install deps
   ```bash
   npm i   # or yarn or pnpm
   ```

2. Configure environment
   - Edit `.env.local` (already prefilled with your values).
   - Set **ADMIN_EMAIL/ADMIN_PASSWORD** to desired credentials.

3. Seed admin
   ```bash
   node scripts/seed-admin.js
   ```

4. Run the app
   ```bash
   npm run dev
   ```

- Frontend:
  - Dynamic pages: `/[slug]` using the `Page` model.
  - News listing: `/news`, detail: `/news/[slug]`.
  - Contact form: `/contact` (sends via Gmail SMTP).

- Admin:
  - `/admin` with Tailwind buttons (button, button--primary/secondary/tertiary).
  - Section pages are placeholders for CRUD; wire up your forms or table UIs.

### Notes
- Block components are unstyled; they render data only.
- Menus are rendered by `Header` and `Footer` using the `Menu` model with keys `header`/`footer`.
- Cloudinary keys are available in env; integrate uploads in your admin as needed.


## Admin Auth
- Visit `/auth/signin` to log in (after seeding).
- `/admin/*` is protected by middleware (requires session).

## CRUD
- Pages: Add title/slug and paste blocks JSON.
- Menus: Upsert by `key` with items JSON.
- Reviews: Simple create/delete.
- Settings: Basic fields + socials JSON.
- News: Create posts with blocks JSON, select categories by IDs.
- Forms: JSON rows/fields builder for "contact".
