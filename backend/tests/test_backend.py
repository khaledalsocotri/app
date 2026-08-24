"""Comprehensive backend tests for Socotra Explorer API."""
import uuid
import pytest
import requests


# --------------------------- Auth ---------------------------
class TestAuth:
    def test_register_duplicate_returns_400(self, api, base_url):
        # visitor should already exist via fixture chain; but let's ensure by trying to re-register
        api.post(f"{base_url}/auth/register", json={"name": "Visitor", "email": "visitor@socotra.app", "password": "Visit@123"})
        r = api.post(f"{base_url}/auth/register", json={"name": "Visitor", "email": "visitor@socotra.app", "password": "Visit@123"})
        assert r.status_code == 400

    def test_register_new_user_and_login(self, api, base_url):
        email = f"test_{uuid.uuid4().hex[:8]}@socotra.app"
        r = api.post(f"{base_url}/auth/register", json={"name": "TEST User", "email": email, "password": "Passw0rd!"})
        assert r.status_code == 200, r.text
        data = r.json()
        assert "token" in data and "user" in data
        assert data["user"]["email"] == email
        # login with same creds
        r2 = api.post(f"{base_url}/auth/login", json={"email": email, "password": "Passw0rd!"})
        assert r2.status_code == 200
        assert "token" in r2.json()

    def test_login_invalid_returns_401(self, api, base_url):
        r = api.post(f"{base_url}/auth/login", json={"email": "nobody@socotra.app", "password": "wrong"})
        assert r.status_code == 401

    def test_me_requires_bearer(self, api, base_url):
        r = api.get(f"{base_url}/auth/me")
        assert r.status_code == 401

    def test_me_with_token(self, api, base_url, auth_headers):
        r = api.get(f"{base_url}/auth/me", headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["email"] == "visitor@socotra.app"

    def test_logout_ok(self, api, base_url):
        # Login to a fresh session token to avoid killing other tests' token
        r = api.post(f"{base_url}/auth/login", json={"email": "visitor@socotra.app", "password": "Visit@123"})
        token = r.json()["token"]
        r2 = api.post(f"{base_url}/auth/logout", headers={"Authorization": f"Bearer {token}"})
        assert r2.status_code == 200
        # after logout token should be invalid
        r3 = api.get(f"{base_url}/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert r3.status_code == 401


# --------------------------- Content GETs ---------------------------
class TestContent:
    def test_categories(self, api, base_url):
        r = api.get(f"{base_url}/categories")
        assert r.status_code == 200
        arr = r.json()
        assert isinstance(arr, list) and len(arr) > 0
        assert "key" in arr[0] and "name_ar" in arr[0]

    def test_destinations_all(self, api, base_url):
        r = api.get(f"{base_url}/destinations")
        assert r.status_code == 200 and len(r.json()) > 0

    def test_destinations_filters(self, api, base_url):
        cats = api.get(f"{base_url}/categories").json()
        key = cats[0]["key"]
        r = api.get(f"{base_url}/destinations", params={"category": key})
        assert r.status_code == 200
        for d in r.json():
            assert d["category"] == key
        r2 = api.get(f"{base_url}/destinations", params={"featured": "true"})
        assert r2.status_code == 200
        r3 = api.get(f"{base_url}/destinations", params={"popular": "true"})
        assert r3.status_code == 200
        r4 = api.get(f"{base_url}/destinations", params={"search": "socotra"})
        assert r4.status_code == 200

    def test_destination_detail_includes_related(self, api, base_url):
        items = api.get(f"{base_url}/destinations").json()
        did = items[0]["id"]
        r = api.get(f"{base_url}/destinations/{did}")
        assert r.status_code == 200
        body = r.json()
        assert body["id"] == did
        assert "related" in body and isinstance(body["related"], list)

    def test_destination_not_found(self, api, base_url):
        r = api.get(f"{base_url}/destinations/does-not-exist")
        assert r.status_code == 404

    def test_trips_list_and_detail(self, api, base_url):
        r = api.get(f"{base_url}/trips")
        assert r.status_code == 200
        arr = r.json()
        assert len(arr) > 0
        tid = arr[0]["id"]
        r2 = api.get(f"{base_url}/trips/{tid}")
        assert r2.status_code == 200 and r2.json()["id"] == tid

    def test_experiences_list_and_detail(self, api, base_url):
        r = api.get(f"{base_url}/experiences")
        assert r.status_code == 200
        arr = r.json()
        assert len(arr) > 0
        eid = arr[0]["id"]
        r2 = api.get(f"{base_url}/experiences/{eid}")
        assert r2.status_code == 200 and r2.json()["id"] == eid

    def test_marketplace_categories(self, api, base_url):
        r = api.get(f"{base_url}/marketplace/categories")
        assert r.status_code == 200 and len(r.json()) > 0

    def test_products_list_filter_detail(self, api, base_url):
        r = api.get(f"{base_url}/products")
        assert r.status_code == 200 and len(r.json()) > 0
        cats = api.get(f"{base_url}/marketplace/categories").json()
        key = cats[0]["key"]
        r2 = api.get(f"{base_url}/products", params={"category": key})
        assert r2.status_code == 200
        for p in r2.json():
            assert p["category"] == key
        pid = r.json()[0]["id"]
        r3 = api.get(f"{base_url}/products/{pid}")
        assert r3.status_code == 200 and r3.json()["id"] == pid

    def test_events_offers(self, api, base_url):
        r = api.get(f"{base_url}/events"); assert r.status_code == 200
        r = api.get(f"{base_url}/offers"); assert r.status_code == 200

    def test_discover_all_keys(self, api, base_url):
        r = api.get(f"{base_url}/discover")
        assert r.status_code == 200
        data = r.json()
        for k in ["featured_destinations", "popular_places", "experiences", "products", "events", "offers", "trips"]:
            assert k in data, f"missing key {k}"

    def test_search(self, api, base_url):
        r = api.get(f"{base_url}/search", params={"q": "so"})
        assert r.status_code == 200
        data = r.json()
        for k in ["destinations", "trips", "experiences", "products"]:
            assert k in data


# --------------------------- Favorites ---------------------------
class TestFavorites:
    def test_unauth_favorites_401(self, api, base_url):
        assert api.get(f"{base_url}/favorites").status_code == 401
        assert api.get(f"{base_url}/favorites/ids").status_code == 401
        assert api.post(f"{base_url}/favorites", json={"item_type": "destination", "item_id": "x"}).status_code == 401

    def test_toggle_twice_adds_then_removes(self, api, base_url, auth_headers):
        dest = api.get(f"{base_url}/destinations").json()[0]
        payload = {"item_type": "destination", "item_id": dest["id"]}
        r1 = api.post(f"{base_url}/favorites", json=payload, headers=auth_headers)
        assert r1.status_code == 200
        first = r1.json()["favorited"]
        r2 = api.post(f"{base_url}/favorites", json=payload, headers=auth_headers)
        assert r2.status_code == 200
        assert r2.json()["favorited"] != first

    def test_favorites_grouped(self, api, base_url, auth_headers):
        r = api.get(f"{base_url}/favorites", headers=auth_headers)
        assert r.status_code == 200
        for k in ["destinations", "experiences", "products", "trips"]:
            assert k in r.json()

    def test_favorites_ids(self, api, base_url, auth_headers):
        r = api.get(f"{base_url}/favorites/ids", headers=auth_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# --------------------------- Bookings ---------------------------
class TestBookings:
    def test_unauth_bookings_401(self, api, base_url):
        assert api.get(f"{base_url}/bookings").status_code == 401
        assert api.post(f"{base_url}/bookings", json={"booking_type": "trip", "item_id": "x", "full_name": "a", "phone": "b"}).status_code == 401

    def test_booking_unknown_item_404(self, api, base_url, auth_headers):
        r = api.post(f"{base_url}/bookings", json={"booking_type": "trip", "item_id": "no-such-id", "full_name": "TEST", "phone": "0000"}, headers=auth_headers)
        assert r.status_code == 404

    def test_create_trip_booking_and_notification(self, api, base_url, auth_headers):
        trip = api.get(f"{base_url}/trips").json()[0]
        payload = {"booking_type": "trip", "item_id": trip["id"], "date": "2026-02-15", "guests": 2, "full_name": "TEST Booker", "phone": "+96700000", "notes": "TEST"}
        r = api.post(f"{base_url}/bookings", json=payload, headers=auth_headers)
        assert r.status_code == 200, r.text
        booking = r.json()
        assert booking["item_id"] == trip["id"]
        assert booking["status"] == "pending"
        # GET verify persistence
        listed = api.get(f"{base_url}/bookings", headers=auth_headers).json()
        assert any(b["id"] == booking["id"] for b in listed)
        # notification created
        notifs = api.get(f"{base_url}/notifications", headers=auth_headers).json()
        assert any(n.get("type") == "booking" for n in notifs)

    def test_create_experience_booking(self, api, base_url, auth_headers):
        exp = api.get(f"{base_url}/experiences").json()[0]
        payload = {"booking_type": "experience", "item_id": exp["id"], "guests": 1, "full_name": "TEST", "phone": "+96700000"}
        r = api.post(f"{base_url}/bookings", json=payload, headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["booking_type"] == "experience"


# --------------------------- Reviews ---------------------------
class TestReviews:
    def test_reviews_get_empty(self, api, base_url):
        r = api.get(f"{base_url}/reviews", params={"item_type": "destination", "item_id": "any"})
        assert r.status_code == 200 and isinstance(r.json(), list)

    def test_create_review_auth(self, api, base_url, auth_headers):
        dest = api.get(f"{base_url}/destinations").json()[0]
        r = api.post(f"{base_url}/reviews", json={"item_type": "destination", "item_id": dest["id"], "rating": 4.5, "comment": "TEST review"}, headers=auth_headers)
        assert r.status_code == 200
        rev = r.json()
        assert rev["rating"] == 4.5
        # Verify persistence
        listed = api.get(f"{base_url}/reviews", params={"item_type": "destination", "item_id": dest["id"]}).json()
        assert any(x["id"] == rev["id"] for x in listed)

    def test_review_requires_auth(self, api, base_url):
        r = api.post(f"{base_url}/reviews", json={"item_type": "destination", "item_id": "x", "rating": 5})
        assert r.status_code == 401


# --------------------------- Notifications ---------------------------
class TestNotifications:
    def test_notifications_requires_auth(self, api, base_url):
        assert api.get(f"{base_url}/notifications").status_code == 401

    def test_notifications_ok(self, api, base_url, auth_headers):
        r = api.get(f"{base_url}/notifications", headers=auth_headers)
        assert r.status_code == 200 and isinstance(r.json(), list)


# --------------------------- Admin ---------------------------
class TestAdmin:
    def test_admin_non_admin_403(self, api, base_url, auth_headers):
        r = api.get(f"{base_url}/admin/stats", headers=auth_headers)
        assert r.status_code == 403

    def test_admin_stats_ok(self, api, base_url, admin_headers):
        r = api.get(f"{base_url}/admin/stats", headers=admin_headers)
        assert r.status_code == 200
        data = r.json()
        for k in ["users", "destinations", "trips", "products", "experiences", "bookings"]:
            assert k in data and isinstance(data[k], int)


# --------------------------- Orders (Cart / Checkout) ---------------------------
class TestOrders:
    def test_orders_requires_auth(self, api, base_url):
        assert api.get(f"{base_url}/orders").status_code == 401
        assert api.post(f"{base_url}/orders", json={"items": [], "full_name": "a", "phone": "b", "address": "c"}).status_code == 401

    def test_empty_cart_returns_400(self, api, base_url, auth_headers):
        r = api.post(f"{base_url}/orders", json={"items": [], "full_name": "TEST", "phone": "0", "address": "TEST"}, headers=auth_headers)
        assert r.status_code == 400

    def test_unknown_product_returns_404(self, api, base_url, auth_headers):
        payload = {"items": [{"product_id": "bad-id", "quantity": 1}], "full_name": "TEST", "phone": "0", "address": "TEST"}
        r = api.post(f"{base_url}/orders", json=payload, headers=auth_headers)
        assert r.status_code == 404

    def test_create_order_computes_total_and_persists(self, api, base_url, auth_headers):
        prods = api.get(f"{base_url}/products").json()
        p1, p2 = prods[0], prods[1]
        payload = {
            "items": [
                {"product_id": p1["id"], "quantity": 2},
                {"product_id": p2["id"], "quantity": 3},
            ],
            "full_name": "TEST Buyer", "phone": "+96700", "address": "TEST street",
        }
        r = api.post(f"{base_url}/orders", json=payload, headers=auth_headers)
        assert r.status_code == 200, r.text
        order = r.json()
        expected = round((p1.get("price") or 0) * 2 + (p2.get("price") or 0) * 3, 2)
        assert order["total"] == expected
        assert order["status"] == "pending"
        assert len(order["items"]) == 2
        # Persistence via GET
        listed = api.get(f"{base_url}/orders", headers=auth_headers).json()
        assert any(o["id"] == order["id"] for o in listed)
        # Newest first
        assert listed[0]["id"] == order["id"]
        # Notification created
        notifs = api.get(f"{base_url}/notifications", headers=auth_headers).json()
        assert any(n.get("type") == "order" for n in notifs)


# --------------------------- Verified Reviews ---------------------------
class TestVerifiedReviews:
    def test_review_verified_when_booked_trip(self, api, base_url, auth_headers):
        trip = api.get(f"{base_url}/trips").json()[0]
        # Ensure booking exists for this user+trip
        api.post(f"{base_url}/bookings", json={
            "booking_type": "trip", "item_id": trip["id"], "date": "2026-03-01",
            "guests": 1, "full_name": "TEST", "phone": "+96700",
        }, headers=auth_headers)
        r = api.post(f"{base_url}/reviews", json={
            "item_type": "trip", "item_id": trip["id"], "rating": 5, "comment": "TEST verified",
        }, headers=auth_headers)
        assert r.status_code == 200
        assert r.json().get("verified") is True

    def test_review_not_verified_for_unbooked_experience(self, api, base_url, auth_headers):
        exps = api.get(f"{base_url}/experiences").json()
        # Pick an experience that isn't booked; use a synthetic item_id to guarantee no booking
        fake_item_id = "no-booking-item-xyz"
        # Since the review is tied to item_id in bookings, a fake unbooked id yields verified=false
        r = api.post(f"{base_url}/reviews", json={
            "item_type": "experience", "item_id": fake_item_id, "rating": 4, "comment": "TEST not verified",
        }, headers=auth_headers)
        assert r.status_code == 200
        assert r.json().get("verified") is False

    def test_destination_review_always_unverified(self, api, base_url, auth_headers):
        dest = api.get(f"{base_url}/destinations").json()[0]
        r = api.post(f"{base_url}/reviews", json={
            "item_type": "destination", "item_id": dest["id"], "rating": 4, "comment": "TEST dest",
        }, headers=auth_headers)
        assert r.status_code == 200
        assert r.json().get("verified") is False

    def test_reviews_return_verified_and_photos_fields(self, api, base_url, auth_headers):
        dest = api.get(f"{base_url}/destinations").json()[0]
        r = api.post(f"{base_url}/reviews", json={
            "item_type": "destination", "item_id": dest["id"], "rating": 4,
            "comment": "TEST photos", "photos": ["socotra-explorer/uploads/x/y.jpg"],
        }, headers=auth_headers)
        assert r.status_code == 200
        new_id = r.json()["id"]
        listed = api.get(f"{base_url}/reviews", params={"item_type": "destination", "item_id": dest["id"]}).json()
        mine = next((x for x in listed if x["id"] == new_id), None)
        assert mine is not None
        assert "verified" in mine and mine["verified"] is False
        assert "photos" in mine and mine["photos"] == ["socotra-explorer/uploads/x/y.jpg"]


# --------------------------- Uploads (Photo attachment) ---------------------------
class TestUploads:
    def test_upload_requires_auth(self, api, base_url):
        files = {"file": ("t.png", b"\x89PNG\r\n\x1a\n", "image/png")}
        # Requests session has JSON content-type header; but multipart overrides via files=
        r = requests.post(f"{base_url}/upload", files=files)
        assert r.status_code == 401

    def test_upload_and_serve_public(self, api, base_url, auth_headers):
        # 1x1 PNG
        png = bytes.fromhex(
            "89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4"
            "890000000A49444154789C6300010000000500010D0A2DB40000000049454E44AE426082"
        )
        # Use a fresh session so we don't send application/json header on multipart
        r = requests.post(f"{base_url}/upload", files={"file": ("t.png", png, "image/png")}, headers=auth_headers)
        assert r.status_code == 200, r.text
        body = r.json()
        assert "path" in body and "url" in body
        assert body["url"].startswith("/api/files/")
        # Serve publicly (no auth)
        r2 = requests.get(f"{base_url}/files/{body['path']}")
        assert r2.status_code == 200
        assert r2.headers.get("content-type", "").startswith("image/")


# --------------------------- Admin Bookings + CRUD ---------------------------
class TestAdminAdvanced:
    def test_admin_bookings_requires_admin(self, api, base_url, auth_headers):
        r = api.get(f"{base_url}/admin/bookings", headers=auth_headers)
        assert r.status_code == 403

    def test_admin_bookings_lists(self, api, base_url, admin_headers):
        r = api.get(f"{base_url}/admin/bookings", headers=admin_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_admin_update_booking_status_and_notify(self, api, base_url, auth_headers, admin_headers):
        # Create booking as visitor
        trip = api.get(f"{base_url}/trips").json()[0]
        r = api.post(f"{base_url}/bookings", json={
            "booking_type": "trip", "item_id": trip["id"], "guests": 1,
            "full_name": "TEST Confirm", "phone": "+96700",
        }, headers=auth_headers)
        bk_id = r.json()["id"]
        # Admin confirms
        r2 = api.put(f"{base_url}/admin/bookings/{bk_id}/status", json={"status": "confirmed"}, headers=admin_headers)
        assert r2.status_code == 200
        assert r2.json()["status"] == "confirmed"
        # Verify visitor sees status change + notification
        listed = api.get(f"{base_url}/bookings", headers=auth_headers).json()
        assert any(b["id"] == bk_id and b["status"] == "confirmed" for b in listed)
        notifs = api.get(f"{base_url}/notifications", headers=auth_headers).json()
        assert any("confirmed" in (n.get("body_en") or "") for n in notifs)

    def test_admin_booking_status_invalid_400(self, api, base_url, admin_headers):
        # Grab any booking
        arr = api.get(f"{base_url}/admin/bookings", headers=admin_headers).json()
        if not arr:
            pytest.skip("no bookings")
        r = api.put(f"{base_url}/admin/bookings/{arr[0]['id']}/status", json={"status": "junk"}, headers=admin_headers)
        assert r.status_code == 400

    def test_admin_crud_destination(self, api, base_url, admin_headers):
        payload = {
            "name_ar": "TEST مكان", "name_en": "TEST Place", "category": "beaches",
            "cover_image": "https://example.com/x.jpg", "location_ar": "TEST",
            "rating": 4.5, "reviews_count": 0, "featured": False, "popular": False,
        }
        r = api.post(f"{base_url}/admin/destinations", json=payload, headers=admin_headers)
        assert r.status_code == 200
        new_id = r.json()["id"]
        # Appears in public list
        listed = api.get(f"{base_url}/destinations").json()
        assert any(d["id"] == new_id for d in listed)
        # Update
        ru = api.put(f"{base_url}/admin/destinations/{new_id}", json={"name_en": "TEST Updated"}, headers=admin_headers)
        assert ru.status_code == 200 and ru.json()["name_en"] == "TEST Updated"
        # Delete
        rd = api.delete(f"{base_url}/admin/destinations/{new_id}", headers=admin_headers)
        assert rd.status_code == 200
        after = api.get(f"{base_url}/destinations").json()
        assert not any(d["id"] == new_id for d in after)

    def test_admin_crud_non_admin_forbidden(self, api, base_url, auth_headers):
        r = api.post(f"{base_url}/admin/destinations", json={"name_ar": "x"}, headers=auth_headers)
        assert r.status_code == 403
        r2 = api.put(f"{base_url}/admin/destinations/xxx", json={"a": 1}, headers=auth_headers)
        assert r2.status_code == 403
        r3 = api.delete(f"{base_url}/admin/destinations/xxx", headers=auth_headers)
        assert r3.status_code == 403
