# Socotra Explorer — PRD & Build Log

## Original Problem Statement
Production-ready Arabic-first (RTL) tourism & local discovery mobile app for Socotra Island, Yemen.
Travelers discover destinations on an interactive map, explore beaches/nature/activities/accommodation/
services/cultural sites/local experiences, view rich destination details, save favorites, get directions,
browse a local marketplace, discover events/offers, and browse & book tourism trips. Data-driven and
admin-ready so a future web dashboard can manage all content. React Native + Expo, FastAPI, MongoDB.

## User Choices
- Auth: BOTH email/password (custom) AND Emergent-managed Google login.
- Map: Google Maps (react-native-maps, native; list fallback on web).
- Scope: ALL sections working end-to-end with demo Socotra content.
- Payments: later — bookings recorded without payment; payment layer kept modular.

## Architecture
- **Backend** `/app/backend/server.py` (FastAPI) + `seed_data.py` (demo content, admin-replaceable).
  - Unified auth: email/password + Google both mint `session_token` in `user_sessions`; Bearer tokens.
  - Collections (admin-ready models): users, user_sessions, destination_categories, destinations,
    trips, experiences, product_categories, products, events, offers, favorites, bookings, reviews,
    notifications.
  - All responses exclude Mongo `_id`; string `id` (uuid) public identifiers; tz-aware datetimes.
  - Endpoints: auth (register/login/session/me/logout), categories, destinations(+filters, +related),
    trips, experiences, marketplace/categories, products(+filters), events, offers, discover (aggregate),
    search, favorites (ids/toggle), bookings (create+list, auto-notification), reviews, notifications,
    admin/stats (is_admin gated).
- **Frontend** Expo Router, RTL forced (I18nManager), Cairo/Tajawal fonts, teal/turquoise theme from
  design_guidelines.json. Providers: Auth, Favorites, Toast, KeyboardController, GestureHandler, SafeArea.
  - Tabs: Map, Discover(index), Trips, Favorites, Account (custom glass tab bar).
  - Detail routes: destination/[id], trip/[id], experience/[id], product/[id]; plus marketplace,
    experiences, booking (modal), search.
  - Reusable: theme, api client (Bearer), useFetch, cards, CategoryChips, DetailHero, States, Toast,
    TextField, Button, Section/Rail, Stars, FavoriteButton, MapCanvas(.tsx native / .web.tsx fallback).

## Implemented (2026-06)
- Full auth (email/password + Google) with secure sessions; login/register screens with validation.
- Data-driven Discover, interactive Map (native) + web list fallback, category filtering.
- Destination / Trip / Experience / Product detail pages with galleries, sticky glass CTAs.
- Favorites (destinations/experiences/products/trips) persisted per user.
- Booking flow (trip & experience) saved to DB + notification; bookings visible in Account.
- Local marketplace (2-col grid, category chips), Experiences list, global search with filters.
- Account: profile, bookings, notifications, logout.
- Reviews: interactive star rating + comment on destination/experience/trip; blended into item rating.
- **Reviews v2 (2026-06)**: photo attachments via Emergent Object Storage (`/api/upload`, public `/api/files/{path}`); "زيارة مؤكدة" verified badge when the reviewer actually booked the item.
- **Cart & Checkout (2026-06)**: persistent client cart, marketplace cart badge, cart screen with qty steppers + delivery form; `POST /api/orders` records orders (no payment) + notification; orders shown in Account → طلباتي.
- **Admin panel (2026-06)**: in-app, is_admin-gated (`/admin`). Dashboard stats, manage bookings (confirm/cancel + user notification), CRUD for destinations/trips/offers/products/experiences with image upload. Backend: `/api/admin/{entity}` CRUD, `/api/admin/bookings`, `/api/admin/bookings/{id}/status`.
- **Host replies (2026-06)**: admins can reply to any review via `PUT /api/reviews/{id}/reply` (admin-gated); reply shows as "رد المضيف" under the review.
- **Language toggle (2026-06)**: Arabic/English switch (`LanguageContext`, persisted). `t()` UI dictionary + `pick()` bilingual content helper (name/description/location use `_en` with `_ar` fallback). Toggle in Account. Verified across all major screens; default Arabic.
- **V1 scope change (2026-06)**: Trips removed from the mobile UI (bottom tab hidden via `href:null`, removed from Discover/Favorites/Search, quick tile → Services). Trips backend/models/collection kept intact for V2/V3.
- **Services & Events admin (2026-06)**: added `services` collection + `GET /api/services`, seeded idempotently; admin CRUD now covers destinations/products/experiences/offers/**services**/**events** (all with image upload). New `/services` screen; Discover Services quick tile.
- **Discover Socotra map (2026-06)**: branded header + category legend; native themed Google map (custom teal style) with markers + interactive preview cards; web shows a branded, category-grouped explore layout with hero banner and photo cards.
- Verified: 62/62 backend tests passing; all frontend flows verified (iterations 1–5). Real secure admin: admin@socotra.app / Admin@123.

## Backlog / Remaining
- P1: Real payment gateway (Stripe/Razorpay) — modular hook present (payment_status=unpaid on orders & bookings).
- P2: Standalone web admin dashboard (current admin runs in-app on web + mobile for admin users).
- P2: Google Maps API key wiring for production builds (app.json config placeholders in place).
- P2: Push notifications (Emergent-managed) — requires deploy + build.
- P2: Multi-language toggle (English secondary) — structure ready.
- P3: Back-fill `verified`/`photos` on iteration-1 reviews (cosmetic; frontend already tolerates missing fields).

## Test Accounts
See `/app/memory/test_credentials.md`.
