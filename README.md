# Villa Kirala — villa listing MVP

A villa rental listing site modelled on the structure of villasayfam.com:
region / dates / guests search, villa cards with "starting from" nightly price,
booking handed off to WhatsApp, Turkish ⇄ English, and currency conversion.

| Part | Stack |
| --- | --- |
| `api/` | NestJS 12 (ESM), Prisma 6, PostgreSQL, JWT (`@nestjs/jwt`), class-validator |
| `web/` | Next.js 16 (App Router, Server Actions), React 19, Tailwind CSS 4 |

All villa data is **fictional demo content**. Images come from picsum.photos.

## Features

- **Villa search**: region, check-in/out (excludes villas with blocked dates), guests,
  minimum bedrooms, price range, features (private pool, jacuzzi, sea view…), keyword,
  sorting, pagination.
- **Booking via WhatsApp (mocked)**: the booking form saves a `BookingInquiry` in the
  database. The API builds the prefilled WhatsApp message and the `wa.me` link. The site
  then shows a mock WhatsApp chat with that message and does **not** open WhatsApp.
  To make it real, open `whatsappUrl` instead of showing the dialog. That is one line in
  `web/src/components/BookingForm.tsx`; look for the `MVP mock` comment.
- **Auth**: register, login, logout. The API issues a JWT. The Next.js server keeps it in an
  httpOnly cookie and sends it to the API as `Authorization: Bearer …`.
- **Authorization**: `USER` and `ADMIN` roles. Admin endpoints use `JwtAuthGuard` +
  `RolesGuard` + `@Roles(Role.ADMIN)`. Every request reloads the user's role from the DB.
  The `/admin` page lets admins change booking request statuses and publish or unpublish villas.
- **Currency conversion**: prices are stored in TRY and shown in TRY, USD, EUR or GBP.
  Live rates come from `open.er-api.com` (ExchangeRate-API, no key needed), cached for 1 h
  in the API. If that source is down, the API uses the rates in `FALLBACK_RATES_TRY_PER_UNIT`
  and the footer says so. Price filters are entered in the chosen currency and converted to TRY.
- **Language switch**: Türkçe (default) / English, stored in a cookie. UI strings live in
  `web/src/lib/dictionaries.ts`. Villa descriptions, regions and features are stored in both languages.

## Run locally

Requirements: Node 20+ (tested on Node 24), PostgreSQL 14+.

```bash
createdb villa_listing
```

### API (port 4000)

```bash
cd api
cp .env.example .env        # then edit DATABASE_URL / JWT_SECRET / WHATSAPP_NUMBER
npm install
npx prisma migrate deploy   # creates tables
npm run db:seed             # demo regions, features, 10 villas, 2 users
npm run start:dev
```

### Web (port 3000)

```bash
cd web
cp .env.example .env.local  # API_URL=http://localhost:4000/api
npm install
npm run dev
```

Open http://localhost:3000.

### Demo accounts (created by the seed; change via `SEED_*` env vars)

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@example.com | Admin123! |
| User | user@example.com | User123! |

## API reference (`/api` prefix)

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| GET | `/health` | – | |
| POST | `/auth/register` | – | `{name,email,password}` → `{accessToken,user}` |
| POST | `/auth/login` | – | `{email,password}` → `{accessToken,user}` |
| GET | `/auth/me` | user | |
| GET | `/regions`, `/features` | – | |
| GET | `/villas` | – | `q, region, checkIn, checkOut, guests, bedrooms, minPrice, maxPrice (TRY), features=a,b, sort=recommended\|price_asc\|price_desc\|newest, page, pageSize` |
| GET | `/villas/:slug` | – | includes upcoming blocked date ranges |
| POST / PATCH / DELETE | `/villas`, `/villas/:id` | admin | create/update take `regionSlug`, `featureSlugs` |
| GET | `/admin/villas` | admin | includes unpublished |
| POST | `/inquiries` | optional | validates dates, capacity, availability → `{inquiry, message, whatsappNumber, whatsappUrl}` |
| GET | `/inquiries/mine` | user | |
| GET | `/admin/inquiries` | admin | |
| PATCH | `/admin/inquiries/:id` | admin | `{status: NEW\|CONTACTED\|CONFIRMED\|CANCELLED}` |
| GET | `/currency/rates` | – | `{base:"TRY", rates:{TRY,USD,EUR,GBP}, source, updatedAt, fallback}` |

## Tests

```bash
cd api
npm test            # unit: WhatsApp message/link, slugify, date ranges
npm run test:e2e    # needs the migrated + seeded DB
```

## Known MVP limits

- WhatsApp is mocked, as described above.
- Logout deletes the token cookie. JWTs are stateless, so a copied token stays valid until
  it expires (7 days by default). Add a denylist or short-lived tokens with refresh if you need more.
- The admin UI covers inquiries and publishing. To create or edit villas, call the API.
  There is no admin UI for blocked dates yet; add them in the `Unavailability` table.
- There is no rate limiting on auth endpoints yet. `@nestjs/throttler` is the first-party option.
