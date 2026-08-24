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
from pathlib import Path
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal

import httpx
import bcrypt
from fastapi import FastAPI, APIRouter, Depends, HTTPException, Header, Query
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
    review = {
        "id": new_id("rev_"),
        "user_id": user["user_id"],
        "user_name": user.get("name"),
        "item_type": body.item_type,
        "item_id": body.item_id,
        "rating": body.rating,
        "comment": body.comment,
        "created_at": now_utc().isoformat(),
    }
    await db.reviews.insert_one(review)
    await _recalc_item_rating(body.item_type, body.item_id)
    review.pop("_id", None)
    return review


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


@app.on_event("shutdown")
async def shutdown():
    client.close()
