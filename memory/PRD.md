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
- Verified: 33/33 backend pytest passed; all key frontend flows verified.

## Backlog / Remaining
- P1: Reviews submission UI (backend ready), cart/checkout for marketplace, real payment gateway
  (Stripe/Razorpay) — modular hook already present (payment_status=unpaid).
- P1: Web admin dashboard (backend models & endpoints already admin-ready; add admin CRUD + auth role).
- P2: Google Maps API key wiring for production builds (app.json config placeholders in place).
- P2: Push notifications (Emergent-managed) — requires deploy + build.
- P2: Image upload via Object Storage for admin-managed content.
- P2: Multi-language toggle (English secondary) — structure ready.

## Test Accounts
See `/app/memory/test_credentials.md`.
