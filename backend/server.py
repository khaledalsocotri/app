"""
Socotra Explorer — Backend API
Tourism & local discovery platform for Socotra Island.

Design notes:
- All documents use a string `id` (uuid4) as the public identifier. MongoDB's `_id`
  is always excluded from responses via projection {"_id": 0}.
- Auth is unified: both email/password and Google (Emergent-managed) flows mint a
  row in `user_sessions` with a `session_token`. Clients send `Authorization: Bearer <token>`.
- The schema is admin-ready: every content collection can be managed by a future
  web dashboard through the same models used here.
"""
import os
import uuid
import logging
import secrets
import requests
from pathlib import Path
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal

import httpx
import bcrypt
from fastapi import FastAPI, APIRouter, Depends, HTTPException, Header, Query, UploadFile, File
from fastapi.responses import Response
from starlette.concurrency import run_in_threadpool
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

from seed_data import build_seed

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

EMERGENT_SESSION_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"

# ---- Emergent Object Storage config ----
STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "socotra-explorer"
_storage_key: Optional[str] = None


def init_storage() -> Optional[str]:
    global _storage_key
    if _storage_key:
        return _storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    _storage_key = resp.json()["storage_key"]
    return _storage_key


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data,
        timeout=120,
    )
    if resp.status_code == 503:
        globals()["_storage_key"] = None
        key = init_storage()
        resp = requests.put(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": key, "Content-Type": content_type},
            data=data,
            timeout=120,
        )
    resp.raise_for_status()
    return resp.json()


def get_object(path: str):
    key = init_storage()
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("socotra")

app = FastAPI(title="Socotra Explorer API")
api = APIRouter(prefix="/api")


# ----------------------------- Helpers -----------------------------
def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def new_id(prefix: str = "") -> str:
    return f"{prefix}{uuid.uuid4().hex[:16]}"


def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


async def mint_session(user_id: str) -> str:
    token = secrets.token_urlsafe(32)
    await db.user_sessions.insert_one({
        "session_token": token,
        "user_id": user_id,
        "created_at": now_utc(),
        "expires_at": now_utc() + timedelta(days=7),
    })
    return token


async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ", 1)[1].strip()
    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    exp = session.get("expires_at")
    if exp is not None:
        if exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        if exp < now_utc():
            raise HTTPException(status_code=401, detail="Session expired")
    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# ----------------------------- Models -----------------------------
class RegisterInput(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=6)


class LoginInput(BaseModel):
    email: EmailStr
    password: str


class SessionInput(BaseModel):
    session_id: str


class FavoriteInput(BaseModel):
    item_type: Literal["destination", "experience", "product", "trip"]
    item_id: str


class BookingInput(BaseModel):
    booking_type: Literal["trip", "experience"]
    item_id: str
    date: Optional[str] = None
    guests: int = 1
    full_name: str
    phone: str
    notes: Optional[str] = None


class ReviewInput(BaseModel):
    item_type: str
    item_id: str
    rating: float = Field(ge=1, le=5)
    comment: Optional[str] = None
    photos: Optional[List[str]] = None


class OrderItemInput(BaseModel):
    product_id: str
    quantity: int = Field(ge=1)


class OrderInput(BaseModel):
    items: List[OrderItemInput]
    full_name: str
    phone: str
    address: str
    notes: Optional[str] = None


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin only")
    return user


def _public_user(user: dict) -> dict:
    return {
        "user_id": user["user_id"],
        "name": user.get("name"),
        "email": user.get("email"),
        "picture": user.get("picture"),
        "provider": user.get("provider"),
        "is_admin": user.get("is_admin", False),
    }


# ----------------------------- Auth routes -----------------------------
@api.post("/auth/register")
async def register(body: RegisterInput):
    existing = await db.users.find_one({"email": body.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="البريد الإلكتروني مسجل بالفعل")
    user = {
        "user_id": new_id("user_"),
        "name": body.name,
        "email": body.email.lower(),
        "password": hash_password(body.password),
        "picture": None,
        "provider": "email",
        "is_admin": False,
        "created_at": now_utc(),
    }
    await db.users.insert_one(user)
    token = await mint_session(user["user_id"])
    return {"token": token, "user": _public_user(user)}


@api.post("/auth/login")
async def login(body: LoginInput):
    user = await db.users.find_one({"email": body.email.lower()})
    if not user or not user.get("password") or not verify_password(body.password, user["password"]):
        raise HTTPException(status_code=401, detail="بيانات الدخول غير صحيحة")
    token = await mint_session(user["user_id"])
    return {"token": token, "user": _public_user(user)}


@api.post("/auth/session")
async def google_session(body: SessionInput):
    async with httpx.AsyncClient(timeout=15) as hc:
        resp = await hc.get(EMERGENT_SESSION_URL, headers={"X-Session-ID": body.session_id})
    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid session id")
    data = resp.json()
    email = data.get("email", "").lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        user = existing
    else:
        user = {
            "user_id": new_id("user_"),
            "name": data.get("name", email.split("@")[0]),
            "email": email,
            "password": None,
            "picture": data.get("picture"),
            "provider": "google",
            "is_admin": False,
            "created_at": now_utc(),
        }
        await db.users.insert_one(user)
    token = await mint_session(user["user_id"])
    return {"session_token": token, "token": token, "user": _public_user(user)}


@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return _public_user(user)


@api.post("/auth/logout")
async def logout(authorization: Optional[str] = Header(None)):
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1].strip()
        await db.user_sessions.delete_one({"session_token": token})
    return {"ok": True}


# ----------------------------- Content routes -----------------------------
@api.get("/categories")
async def categories():
    cats = await db.destination_categories.find({}, {"_id": 0}).to_list(100)
    return sorted(cats, key=lambda c: c.get("order", 0))


@api.get("/destinations")
async def list_destinations(
    category: Optional[str] = None,
    search: Optional[str] = None,
    featured: Optional[bool] = None,
    popular: Optional[bool] = None,
):
    q: dict = {}
    if category and category != "all":
        q["category"] = category
    if featured:
        q["featured"] = True
    if popular:
        q["popular"] = True
    if search:
        q["$or"] = [
            {"name_ar": {"$regex": search, "$options": "i"}},
            {"name_en": {"$regex": search, "$options": "i"}},
            {"location_ar": {"$regex": search, "$options": "i"}},
        ]
    items = await db.destinations.find(q, {"_id": 0}).to_list(500)
    return items


@api.get("/destinations/{dest_id}")
async def get_destination(dest_id: str):
    dest = await db.destinations.find_one({"id": dest_id}, {"_id": 0})
    if not dest:
        raise HTTPException(status_code=404, detail="Destination not found")
    related = await db.destinations.find(
        {"category": dest["category"], "id": {"$ne": dest_id}}, {"_id": 0}
    ).to_list(6)
    dest["related"] = related[:4]
    return dest


@api.get("/trips")
async def list_trips(search: Optional[str] = None):
    q: dict = {}
    if search:
        q["$or"] = [
            {"name_ar": {"$regex": search, "$options": "i"}},
            {"name_en": {"$regex": search, "$options": "i"}},
        ]
    return await db.trips.find(q, {"_id": 0}).to_list(200)


@api.get("/trips/{trip_id}")
async def get_trip(trip_id: str):
    trip = await db.trips.find_one({"id": trip_id}, {"_id": 0})
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip


@api.get("/experiences")
async def list_experiences(search: Optional[str] = None):
    q: dict = {}
    if search:
        q["$or"] = [
            {"name_ar": {"$regex": search, "$options": "i"}},
            {"name_en": {"$regex": search, "$options": "i"}},
        ]
    return await db.experiences.find(q, {"_id": 0}).to_list(200)


@api.get("/experiences/{exp_id}")
async def get_experience(exp_id: str):
    exp = await db.experiences.find_one({"id": exp_id}, {"_id": 0})
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")
    return exp


@api.get("/marketplace/categories")
async def marketplace_categories():
    cats = await db.product_categories.find({}, {"_id": 0}).to_list(100)
    return sorted(cats, key=lambda c: c.get("order", 0))


@api.get("/products")
async def list_products(category: Optional[str] = None, search: Optional[str] = None):
    q: dict = {}
    if category and category != "all":
        q["category"] = category
    if search:
        q["$or"] = [
            {"name_ar": {"$regex": search, "$options": "i"}},
            {"name_en": {"$regex": search, "$options": "i"}},
        ]
    return await db.products.find(q, {"_id": 0}).to_list(500)


@api.get("/products/{product_id}")
async def get_product(product_id: str):
    p = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return p


@api.get("/events")
async def list_events():
    return await db.events.find({}, {"_id": 0}).to_list(100)


@api.get("/services")
async def list_services(category: Optional[str] = None, search: Optional[str] = None):
    q: dict = {}
    if category and category != "all":
        q["category"] = category
    if search:
        q["$or"] = [{"name_ar": {"$regex": search, "$options": "i"}}, {"name_en": {"$regex": search, "$options": "i"}}]
    return await db.services.find(q, {"_id": 0}).to_list(300)


@api.get("/services/{service_id}")
async def get_service(service_id: str):
    s = await db.services.find_one({"id": service_id}, {"_id": 0})
    if not s:
        raise HTTPException(status_code=404, detail="Service not found")
    return s


@api.get("/offers")
async def list_offers():
    return await db.offers.find({}, {"_id": 0}).to_list(100)


@api.get("/discover")
async def discover():
    featured = await db.destinations.find({"featured": True}, {"_id": 0}).to_list(10)
    popular = await db.destinations.find({"popular": True}, {"_id": 0}).to_list(10)
    experiences = await db.experiences.find({}, {"_id": 0}).to_list(8)
    products = await db.products.find({}, {"_id": 0}).to_list(8)
    events = await db.events.find({}, {"_id": 0}).to_list(6)
    offers = await db.offers.find({}, {"_id": 0}).to_list(6)
    trips = await db.trips.find({}, {"_id": 0}).to_list(6)
    return {
        "featured_destinations": featured,
        "popular_places": popular,
        "experiences": experiences,
        "products": products,
        "events": events,
        "offers": offers,
        "trips": trips,
    }


@api.get("/search")
async def global_search(q: str = Query(..., min_length=1)):
    rx = {"$regex": q, "$options": "i"}
    dq = {"$or": [{"name_ar": rx}, {"name_en": rx}]}
    return {
        "destinations": await db.destinations.find(dq, {"_id": 0}).to_list(20),
        "trips": await db.trips.find(dq, {"_id": 0}).to_list(20),
        "experiences": await db.experiences.find(dq, {"_id": 0}).to_list(20),
        "products": await db.products.find(dq, {"_id": 0}).to_list(20),
    }


# ----------------------------- Favorites -----------------------------
@api.get("/favorites")
async def get_favorites(user: dict = Depends(get_current_user)):
    favs = await db.favorites.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(1000)
    by_type: dict = {"destination": [], "experience": [], "product": [], "trip": []}
    for f in favs:
        by_type.setdefault(f["item_type"], []).append(f["item_id"])
    coll_map = {
        "destination": db.destinations,
        "experience": db.experiences,
        "product": db.products,
        "trip": db.trips,
    }
    result: dict = {}
    for t, ids in by_type.items():
        if ids:
            result[t + "s"] = await coll_map[t].find({"id": {"$in": ids}}, {"_id": 0}).to_list(1000)
        else:
            result[t + "s"] = []
    return result


@api.get("/favorites/ids")
async def favorite_ids(user: dict = Depends(get_current_user)):
    favs = await db.favorites.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(1000)
    return [{"item_type": f["item_type"], "item_id": f["item_id"]} for f in favs]


@api.post("/favorites")
async def toggle_favorite(body: FavoriteInput, user: dict = Depends(get_current_user)):
    q = {"user_id": user["user_id"], "item_type": body.item_type, "item_id": body.item_id}
    existing = await db.favorites.find_one(q)
    if existing:
        await db.favorites.delete_one(q)
        return {"favorited": False}
    await db.favorites.insert_one({**q, "id": new_id("fav_"), "created_at": now_utc()})
    return {"favorited": True}


# ----------------------------- Bookings -----------------------------
@api.post("/bookings")
async def create_booking(body: BookingInput, user: dict = Depends(get_current_user)):
    coll = db.trips if body.booking_type == "trip" else db.experiences
    item = await coll.find_one({"id": body.item_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    images = item.get("images") or ([item.get("cover_image")] if item.get("cover_image") else [])
    booking = {
        "id": new_id("bk_"),
        "user_id": user["user_id"],
        "booking_type": body.booking_type,
        "item_id": body.item_id,
        "item_name_ar": item.get("name_ar"),
        "item_name_en": item.get("name_en"),
        "item_image": images[0] if images else None,
        "date": body.date,
        "guests": body.guests,
        "full_name": body.full_name,
        "phone": body.phone,
        "notes": body.notes,
        "price": item.get("price"),
        "status": "pending",  # pending -> confirmed by admin later
        "payment_status": "unpaid",  # payment gateway integrated later
        "created_at": now_utc().isoformat(),
    }
    await db.bookings.insert_one(booking)
    await db.notifications.insert_one({
        "id": new_id("ntf_"),
        "user_id": user["user_id"],
        "title_ar": "تم استلام طلب الحجز",
        "title_en": "Booking request received",
        "body_ar": f"طلب حجزك لـ {item.get('name_ar')} قيد المراجعة.",
        "body_en": f"Your booking for {item.get('name_en')} is under review.",
        "type": "booking",
        "read": False,
        "created_at": now_utc().isoformat(),
    })
    booking.pop("_id", None)
    return booking


@api.get("/bookings")
async def list_bookings(user: dict = Depends(get_current_user)):
    return await db.bookings.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(200)


# ----------------------------- Reviews -----------------------------
@api.get("/reviews")
async def list_reviews(item_type: str, item_id: str):
    return await db.reviews.find({"item_type": item_type, "item_id": item_id}, {"_id": 0}).to_list(200)


@api.post("/reviews")
async def create_review(body: ReviewInput, user: dict = Depends(get_current_user)):
    # "Verified" if the user actually booked this trip/experience.
    verified = False
    if body.item_type in ("trip", "experience"):
        booking = await db.bookings.find_one({"user_id": user["user_id"], "item_id": body.item_id})
        verified = booking is not None
    review = {
        "id": new_id("rev_"),
        "user_id": user["user_id"],
        "user_name": user.get("name"),
        "user_picture": user.get("picture"),
        "item_type": body.item_type,
        "item_id": body.item_id,
        "rating": body.rating,
        "comment": body.comment,
        "photos": body.photos or [],
        "verified": verified,
        "created_at": now_utc().isoformat(),
    }
    await db.reviews.insert_one(review)
    await _recalc_item_rating(body.item_type, body.item_id)
    review.pop("_id", None)
    return review


@api.put("/reviews/{review_id}/reply")
async def reply_review(review_id: str, body: dict, admin: dict = Depends(require_admin)):
    text = (body.get("reply") or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="الرد فارغ")
    rev = await db.reviews.find_one({"id": review_id})
    if not rev:
        raise HTTPException(status_code=404, detail="Review not found")
    await db.reviews.update_one(
        {"id": review_id},
        {"$set": {"reply": text, "reply_by": admin.get("name") or "المضيف", "reply_at": now_utc().isoformat()}},
    )
    return await db.reviews.find_one({"id": review_id}, {"_id": 0})


async def _recalc_item_rating(item_type: str, item_id: str):
    """Blend the curated seed rating/count baseline with real user reviews so the
    demo data isn't wiped out by the first review."""
    coll_map = {"destination": db.destinations, "experience": db.experiences, "trip": db.trips}
    coll = coll_map.get(item_type)
    if coll is None:
        return
    item = await coll.find_one({"id": item_id})
    if not item:
        return
    # Capture the seed baseline once.
    if "base_rating" not in item:
        base_rating = item.get("rating", 0) or 0
        base_count = item.get("reviews_count", 0) or 0
        await coll.update_one({"id": item_id}, {"$set": {"base_rating": base_rating, "base_reviews_count": base_count}})
    else:
        base_rating = item["base_rating"]
        base_count = item["base_reviews_count"]
    real = await db.reviews.find({"item_type": item_type, "item_id": item_id}, {"_id": 0, "rating": 1}).to_list(5000)
    n_real = len(real)
    sum_real = sum(r.get("rating", 0) for r in real)
    total = base_count + n_real
    avg = round(((base_rating * base_count) + sum_real) / total, 1) if total else base_rating
    await coll.update_one({"id": item_id}, {"$set": {"rating": avg, "reviews_count": total}})


# ----------------------------- Notifications -----------------------------
@api.get("/notifications")
async def list_notifications(user: dict = Depends(get_current_user)):
    return await db.notifications.find(
        {"$or": [{"user_id": user["user_id"]}, {"user_id": None}]}, {"_id": 0}
    ).sort("created_at", -1).to_list(200)


# ----------------------------- Admin (scaffold) -----------------------------
@api.get("/admin/stats")
async def admin_stats(user: dict = Depends(get_current_user)):
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin only")
    return {
        "users": await db.users.count_documents({}),
        "destinations": await db.destinations.count_documents({}),
        "trips": await db.trips.count_documents({}),
        "products": await db.products.count_documents({}),
        "experiences": await db.experiences.count_documents({}),
        "bookings": await db.bookings.count_documents({}),
    }


# ----------------------------- File upload / serve -----------------------------
_EXT = {"image/jpeg": "jpg", "image/jpg": "jpg", "image/png": "png", "image/webp": "webp", "image/heic": "heic"}


@api.post("/upload")
async def upload_file(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    data = await file.read()
    if len(data) > 8 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="الصورة كبيرة جداً (الحد 8MB)")
    ctype = file.content_type or "image/jpeg"
    ext = _EXT.get(ctype, "jpg")
    path = f"{APP_NAME}/uploads/{user['user_id']}/{uuid.uuid4().hex}.{ext}"
    try:
        await run_in_threadpool(put_object, path, data, ctype)
    except requests.HTTPError as e:
        code = e.response.status_code if e.response is not None else 500
        if code == 402:
            raise HTTPException(status_code=402, detail="نفدت مساحة التخزين")
        raise HTTPException(status_code=502, detail="فشل رفع الصورة")
    await db.uploads.insert_one({
        "id": new_id("up_"), "owner_id": user["user_id"], "storage_path": path,
        "content_type": ctype, "created_at": now_utc().isoformat(),
    })
    return {"path": path, "url": f"/api/files/{path}"}


@api.get("/files/{path:path}")
async def serve_file(path: str):
    try:
        content, ctype = await run_in_threadpool(get_object, path)
    except Exception:
        raise HTTPException(status_code=404, detail="File not found")
    return Response(content=content, media_type=ctype, headers={"Cache-Control": "public, max-age=31536000"})


# ----------------------------- Orders (checkout) -----------------------------
@api.post("/orders")
async def create_order(body: OrderInput, user: dict = Depends(get_current_user)):
    if not body.items:
        raise HTTPException(status_code=400, detail="السلة فارغة")
    line_items = []
    total = 0.0
    for it in body.items:
        p = await db.products.find_one({"id": it.product_id}, {"_id": 0})
        if not p:
            raise HTTPException(status_code=404, detail="منتج غير موجود")
        subtotal = (p.get("price") or 0) * it.quantity
        total += subtotal
        line_items.append({
            "product_id": p["id"], "name_ar": p.get("name_ar"), "name_en": p.get("name_en"),
            "image": p.get("cover_image"), "price": p.get("price"), "quantity": it.quantity, "subtotal": subtotal,
        })
    order = {
        "id": new_id("ord_"), "user_id": user["user_id"], "items": line_items, "total": round(total, 2),
        "currency": "USD", "full_name": body.full_name, "phone": body.phone, "address": body.address,
        "notes": body.notes, "status": "pending", "payment_status": "unpaid",
        "created_at": now_utc().isoformat(),
    }
    await db.orders.insert_one(order)
    await db.notifications.insert_one({
        "id": new_id("ntf_"), "user_id": user["user_id"],
        "title_ar": "تم استلام طلبك", "title_en": "Order received",
        "body_ar": f"طلبك بقيمة ${order['total']} قيد التجهيز.", "body_en": f"Your order (${order['total']}) is being prepared.",
        "type": "order", "read": False, "created_at": now_utc().isoformat(),
    })
    order.pop("_id", None)
    return order


@api.get("/orders")
async def list_orders(user: dict = Depends(get_current_user)):
    return await db.orders.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(200)


# ----------------------------- Admin CRUD -----------------------------
_ADMIN_COLLS = {
    "destinations": db.destinations,
    "trips": db.trips,
    "offers": db.offers,
    "products": db.products,
    "experiences": db.experiences,
    "services": db.services,
    "events": db.events,
}


@api.post("/admin/{entity}")
async def admin_create(entity: str, body: dict, admin: dict = Depends(require_admin)):
    coll = _ADMIN_COLLS.get(entity)
    if coll is None:
        raise HTTPException(status_code=404, detail="Unknown entity")
    body["id"] = new_id(entity[:4] + "_")
    await coll.insert_one({**body})
    body.pop("_id", None)
    return body


@api.put("/admin/{entity}/{item_id}")
async def admin_update(entity: str, item_id: str, body: dict, admin: dict = Depends(require_admin)):
    coll = _ADMIN_COLLS.get(entity)
    if coll is None:
        raise HTTPException(status_code=404, detail="Unknown entity")
    body.pop("id", None)
    body.pop("_id", None)
    res = await coll.update_one({"id": item_id}, {"$set": body})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return await coll.find_one({"id": item_id}, {"_id": 0})


@api.delete("/admin/{entity}/{item_id}")
async def admin_delete(entity: str, item_id: str, admin: dict = Depends(require_admin)):
    coll = _ADMIN_COLLS.get(entity)
    if coll is None:
        raise HTTPException(status_code=404, detail="Unknown entity")
    await coll.delete_one({"id": item_id})
    return {"ok": True}


@api.get("/admin/bookings")
async def admin_bookings(admin: dict = Depends(require_admin)):
    return await db.bookings.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)


@api.put("/admin/bookings/{booking_id}/status")
async def admin_booking_status(booking_id: str, body: dict, admin: dict = Depends(require_admin)):
    status = body.get("status")
    if status not in ("pending", "confirmed", "cancelled"):
        raise HTTPException(status_code=400, detail="Invalid status")
    bk = await db.bookings.find_one({"id": booking_id})
    if not bk:
        raise HTTPException(status_code=404, detail="Not found")
    await db.bookings.update_one({"id": booking_id}, {"$set": {"status": status}})
    await db.notifications.insert_one({
        "id": new_id("ntf_"), "user_id": bk["user_id"],
        "title_ar": "تحديث حالة الحجز", "title_en": "Booking status updated",
        "body_ar": f"أصبحت حالة حجزك: {'مؤكد' if status=='confirmed' else 'ملغى' if status=='cancelled' else 'قيد المراجعة'}",
        "body_en": f"Your booking is now {status}.",
        "type": "booking", "read": False, "created_at": now_utc().isoformat(),
    })
    return await db.bookings.find_one({"id": booking_id}, {"_id": 0})


@api.get("/")
async def root():
    return {"message": "Socotra Explorer API", "status": "ok"}


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ----------------------------- Startup: indexes + seed -----------------------------
@app.on_event("startup")
async def startup():
    try:
        await run_in_threadpool(init_storage)
        logger.info("Object storage initialized.")
    except Exception as e:
        logger.warning(f"Object storage init failed (uploads may not work): {e}")

    await db.users.create_index("email", unique=True)
    await db.users.create_index("user_id", unique=True)
    await db.user_sessions.create_index("session_token", unique=True)
    await db.user_sessions.create_index("expires_at", expireAfterSeconds=0)
    await db.destinations.create_index("id", unique=True)
    await db.favorites.create_index([("user_id", 1), ("item_type", 1), ("item_id", 1)])

    if await db.destinations.count_documents({}) == 0:
        seed = build_seed()
        for coll_name, docs in seed.items():
            if docs:
                await db[coll_name].insert_many(docs)
        if not await db.users.find_one({"email": "admin@socotra.app"}):
            await db.users.insert_one({
                "user_id": new_id("user_"),
                "name": "مدير سقطرى",
                "email": "admin@socotra.app",
                "password": hash_password("Admin@123"),
                "picture": None,
                "provider": "email",
                "is_admin": True,
                "created_at": now_utc(),
            })
        logger.info("Seed data inserted.")

    # Idempotent services seed (added in a later iteration).
    if await db.services.count_documents({}) == 0:
        svc_img = "https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=85&w=1200"
        await db.services.insert_many([
            {"id": new_id("serv_"), "name_ar": "مستشفى حديبو", "name_en": "Hadibo Hospital", "category": "health",
             "description_ar": "المستشفى الرئيسي في الجزيرة لخدمات الطوارئ والرعاية الصحية.", "description_en": "The island's main hospital for emergencies and healthcare.",
             "cover_image": svc_img, "images": [svc_img], "location_ar": "حديبو", "location_en": "Hadibo", "phone": "+967 5 660000", "latitude": 12.6520, "longitude": 54.0230, "rating": 4.0},
            {"id": new_id("serv_"), "name_ar": "محطة وقود حديبو", "name_en": "Hadibo Fuel Station", "category": "fuel",
             "description_ar": "محطة وقود لتزويد المركبات قبل الرحلات الطويلة.", "description_en": "Fuel station to refuel before long trips.",
             "cover_image": svc_img, "images": [svc_img], "location_ar": "حديبو", "location_en": "Hadibo", "phone": "", "latitude": 12.6500, "longitude": 54.0180, "rating": 3.8},
            {"id": new_id("serv_"), "name_ar": "صراف آلي - البنك", "name_en": "Bank ATM", "category": "bank",
             "description_ar": "خدمات مصرفية وصرافة في مركز المدينة.", "description_en": "Banking and cash services in the town center.",
             "cover_image": svc_img, "images": [svc_img], "location_ar": "حديبو", "location_en": "Hadibo", "phone": "", "latitude": 12.6530, "longitude": 54.0200, "rating": 3.9},
            {"id": new_id("serv_"), "name_ar": "مكتب المرشدين السياحيين", "name_en": "Tour Guides Office", "category": "guide",
             "description_ar": "حجز مرشدين محليين وسيارات دفع رباعي للرحلات.", "description_en": "Book local guides and 4x4 vehicles for tours.",
             "cover_image": svc_img, "images": [svc_img], "location_ar": "حديبو", "location_en": "Hadibo", "phone": "+967 5 661234", "latitude": 12.6510, "longitude": 54.0250, "rating": 4.6},
        ])
        logger.info("Services seed inserted.")

    # Idempotent enrichment: give existing destinations a map marker icon and
    # sample admin-editable rich content (story/facts/warnings) if missing, so
    # the Discover map & detail pages have data to render out of the box.
    _CAT_ICON = {
        "nature": "leaf", "beaches": "umbrella", "activities": "triangle",
        "accommodation": "bed", "services": "construct", "cultural": "business",
        "experiences": "sparkles",
    }
    async for d in db.destinations.find({}):
        upd = {}
        if not d.get("marker_icon"):
            upd["marker_icon"] = _CAT_ICON.get(d.get("category"), "location")
        if not d.get("story_ar"):
            nm_ar = d.get("name_ar", "هذا الموقع")
            nm_en = d.get("name_en", "this site")
            upd["story_ar"] = f"يُعد {nm_ar} من المعالم المميزة في جزيرة سقطرى، حيث يجمع بين الطبيعة الفريدة وتاريخ السكان المحليين الذين يرتبطون بالمكان منذ أجيال."
            upd["story_en"] = f"{nm_en} is one of Socotra's distinctive landmarks, blending unique nature with the heritage of local communities tied to this place for generations."
        if not d.get("facts_ar"):
            upd["facts_ar"] = "سقطرى موقع تراث عالمي مُدرج ضمن اليونسكو.\nتضم الجزيرة نباتات لا توجد في أي مكان آخر على الأرض.\nأفضل فترة للزيارة بين أكتوبر وأبريل."
            upd["facts_en"] = "Socotra is a UNESCO World Heritage Site.\nThe island hosts plants found nowhere else on Earth.\nBest visited between October and April."
        if not d.get("warnings_ar"):
            upd["warnings_ar"] = "احرص على اصطحاب مرشد محلي في المواقع الوعرة.\nخذ كمية كافية من الماء، فالخدمات محدودة.\nتغطية الإنترنت والاتصالات ضعيفة في المناطق النائية."
            upd["warnings_en"] = "Bring a local guide for rugged areas.\nCarry enough water — services are limited.\nInternet and mobile coverage are weak in remote areas."
        if upd:
            await db.destinations.update_one({"id": d["id"]}, {"$set": upd})
    logger.info("Destination enrichment backfill complete.")


@app.on_event("shutdown")
async def shutdown():
    client.close()
