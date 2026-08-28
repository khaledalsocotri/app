import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { storage } from "@/src/utils/storage";

export type Lang = "ar" | "en";

const KEY = "socotra_lang";

// UI string dictionary. Keys are shared; each has an Arabic + English value.
const STRINGS: Record<string, { ar: string; en: string }> = {
  // Tabs
  tab_map: { ar: "الخريطة", en: "Map" },
  tab_discover: { ar: "اكتشف", en: "Discover" },
  tab_trips: { ar: "الرحلات", en: "Trips" },
  tab_favorites: { ar: "المفضلة", en: "Favorites" },
  tab_account: { ar: "حسابي", en: "Account" },
  // Common
  see_all: { ar: "عرض الكل", en: "See all" },
  retry: { ar: "إعادة المحاولة", en: "Retry" },
  loading: { ar: "جارٍ التحميل...", en: "Loading..." },
  no_results: { ar: "لا توجد نتائج", en: "No results" },
  load_error: { ar: "تعذّر تحميل المحتوى", en: "Couldn't load content" },
  check_connection: { ar: "تحقق من اتصالك بالإنترنت", en: "Check your internet connection" },
  currency_per_person: { ar: "للشخص", en: "per person" },
  seats_available: { ar: "مقاعد متاحة", en: "seats available" },
  days: { ar: "أيام", en: "days" },
  // Discover
  hello: { ar: "مرحباً", en: "Hello" },
  discover_socotra: { ar: "اكتشف سقطرى", en: "Discover Socotra" },
  search_placeholder: { ar: "ابحث عن وجهة، تجربة، رحلة...", en: "Search a place, experience, trip..." },
  q_marketplace: { ar: "التسويق", en: "Market" },
  q_experiences: { ar: "التجارب", en: "Experiences" },
  q_map: { ar: "الخريطة", en: "Map" },
  q_trips: { ar: "الرحلات", en: "Trips" },
  q_services: { ar: "الخدمات", en: "Services" },
  services_title: { ar: "الخدمات المحلية", en: "Local services" },
  services_sub: { ar: "خدمات أساسية للمسافرين", en: "Essential services for travelers" },
  no_services: { ar: "لا توجد خدمات", en: "No services" },
  sec_services: { ar: "خدمات محلية", en: "Local services" },
  sec_popular: { ar: "الأماكن الشهيرة", en: "Popular places" },
  sec_popular_sub: { ar: "الأكثر زيارة في الجزيرة", en: "Most visited on the island" },
  sec_local_exp: { ar: "تجارب محلية", en: "Local experiences" },
  sec_local_exp_sub: { ar: "عش الثقافة السقطرية", en: "Live the Socotri culture" },
  sec_local_prod: { ar: "منتجات محلية", en: "Local products" },
  sec_local_prod_sub: { ar: "حرف وأطعمة أصيلة", en: "Authentic crafts & foods" },
  sec_offers: { ar: "عروض خاصة", en: "Special offers" },
  sec_offers_sub: { ar: "لفترة محدودة", en: "Limited time" },
  sec_events: { ar: "فعاليات قادمة", en: "Upcoming events" },
  sec_trips: { ar: "رحلات سياحية", en: "Tourism trips" },
  sec_trips_sub: { ar: "باقات مصممة لك", en: "Packages made for you" },
  featured: { ar: "مميّز", en: "Featured" },
  // Map
  search_in_map: { ar: "ابحث في الخريطة", en: "Search the map" },
  explore_region: { ar: "استكشف هذه المنطقة", en: "Explore this area" },
  map_type: { ar: "نوع الخريطة", en: "Map type" },
  my_location: { ar: "موقعي", en: "My location" },
  download_offline: { ar: "قريباً: تنزيل الخريطة للاستخدام دون اتصال", en: "Coming soon: offline maps" },
  places_here: { ar: "الأماكن في هذه المنطقة", en: "Places in this area" },
  map_web_note: { ar: "الخريطة التفاعلية تعمل على تطبيق الجوال. هذه قائمة المواقع.", en: "The interactive map runs on the mobile app. Here is the list of places." },
  details: { ar: "التفاصيل", en: "Details" },
  directions: { ar: "الاتجاهات", en: "Directions" },
  get_directions: { ar: "الحصول على الاتجاهات", en: "Get directions" },
  // Trips
  trips_title: { ar: "الرحلات السياحية", en: "Tourism trips" },
  trips_sub: { ar: "باقات مصممة لاستكشاف سقطرى", en: "Packages to explore Socotra" },
  no_trips: { ar: "لا توجد رحلات حالياً", en: "No trips available" },
  // Favorites
  favorites_title: { ar: "المفضلة", en: "Favorites" },
  fav_destinations: { ar: "الوجهات", en: "Destinations" },
  fav_experiences: { ar: "التجارب", en: "Experiences" },
  fav_products: { ar: "المنتجات", en: "Products" },
  fav_trips: { ar: "الرحلات", en: "Trips" },
  no_favorites: { ar: "لا توجد عناصر مفضلة", en: "No favorites yet" },
  no_favorites_sub: { ar: "أضف وجهات وتجارب ومنتجات تحبها لتظهر هنا", en: "Save places, experiences and products you love" },
  // Account
  my_bookings: { ar: "حجوزاتي", en: "My bookings" },
  my_orders: { ar: "طلباتي", en: "My orders" },
  notifications: { ar: "الإشعارات", en: "Notifications" },
  local_market: { ar: "التسويق المحلي", en: "Local marketplace" },
  admin_panel: { ar: "لوحة الإدارة", en: "Admin panel" },
  settings: { ar: "الإعدادات", en: "Settings" },
  language: { ar: "اللغة", en: "Language" },
  help_support: { ar: "المساعدة والدعم", en: "Help & support" },
  logout: { ar: "تسجيل الخروج", en: "Log out" },
  admin_badge: { ar: "مدير", en: "Admin" },
  no_bookings: { ar: "لا توجد حجوزات بعد", en: "No bookings yet" },
  no_orders: { ar: "لا توجد طلبات بعد", en: "No orders yet" },
  no_notifications: { ar: "لا توجد إشعارات", en: "No notifications" },
  status_pending: { ar: "قيد المراجعة", en: "Pending" },
  status_confirmed: { ar: "مؤكد", en: "Confirmed" },
  status_cancelled: { ar: "ملغى", en: "Cancelled" },
  people: { ar: "أشخاص", en: "people" },
  items: { ar: "عناصر", en: "items" },
  trip: { ar: "رحلة", en: "Trip" },
  experience: { ar: "تجربة", en: "Experience" },
  date_label: { ar: "التاريخ", en: "Date" },
  // Marketplace / experiences
  market_sub: { ar: "حرف ومنتجات وتجارب سقطرية أصيلة", en: "Authentic Socotri crafts, goods & experiences" },
  no_products: { ar: "لا توجد منتجات", en: "No products" },
  try_other_cat: { ar: "جرّب فئة أخرى", en: "Try another category" },
  experiences_title: { ar: "التجارب المحلية", en: "Local experiences" },
  experiences_sub: { ar: "عش الثقافة السقطرية الأصيلة", en: "Live authentic Socotri culture" },
  no_experiences: { ar: "لا توجد تجارب", en: "No experiences" },
  all: { ar: "الكل", en: "All" },
  // Search
  search_anything: { ar: "ابحث عن أي شيء", en: "Search anything" },
  search_anything_sub: { ar: "وجهات، رحلات، تجارب ومنتجات سقطرى", en: "Destinations, trips, experiences & products" },
  no_search_results: { ar: "لا توجد نتائج", en: "No results" },
  search_global_placeholder: { ar: "ابحث عن وجهة، رحلة، تجربة، منتج...", en: "Search a place, trip, experience, product..." },
  // Detail
  best_time: { ar: "أفضل وقت", en: "Best time" },
  duration: { ar: "المدة", en: "Duration" },
  difficulty: { ar: "الصعوبة", en: "Difficulty" },
  vehicle: { ar: "المركبة", en: "Vehicle" },
  internet: { ar: "الإنترنت", en: "Internet" },
  how_to_get: { ar: "كيفية الوصول", en: "How to get there" },
  available_activities: { ar: "الأنشطة المتاحة", en: "Activities" },
  nearby_services: { ar: "الخدمات القريبة", en: "Nearby services" },
  local_knowledge: { ar: "معرفة محلية", en: "Local knowledge" },
  interesting_facts: { ar: "حقائق ممتعة", en: "Interesting facts" },
  safety_notes: { ar: "تنبيهات وسلامة", en: "Safety notes" },
  view_details: { ar: "عرض التفاصيل", en: "View details" },
  similar_destinations: { ar: "وجهات مشابهة", en: "Similar destinations" },
  location_label: { ar: "الموقع", en: "Location" },
  provider: { ar: "المزوّد", en: "Provider" },
  availability: { ar: "التوفر", en: "Availability" },
  includes: { ar: "يشمل", en: "Includes" },
  excludes: { ar: "لا يشمل", en: "Excludes" },
  accommodation: { ar: "الإقامة", en: "Accommodation" },
  transportation: { ar: "المواصلات", en: "Transportation" },
  itinerary: { ar: "برنامج الرحلة", en: "Itinerary" },
  available_dates: { ar: "تواريخ متاحة", en: "Available dates" },
  starting_from: { ar: "ابتداءً من", en: "From" },
  book_now: { ar: "احجز الآن", en: "Book now" },
  book_experience: { ar: "احجز التجربة", en: "Book experience" },
  add_to_cart: { ar: "أضف إلى السلة", en: "Add to cart" },
  price: { ar: "السعر", en: "Price" },
  added_to_cart: { ar: "تمت الإضافة إلى السلة", en: "Added to cart" },
  // Reviews
  reviews: { ar: "التقييمات", en: "Reviews" },
  add_review: { ar: "أضف تقييمك", en: "Add review" },
  based_on: { ar: "بناءً على", en: "Based on" },
  review_word: { ar: "تقييم", en: "reviews" },
  be_first_review: { ar: "كن أول من يشارك تجربته", en: "Be the first to review" },
  verified_visit: { ar: "زيارة مؤكدة", en: "Verified visit" },
  host_reply: { ar: "رد المضيف", en: "Host reply" },
  reply_as_host: { ar: "الرد كمضيف", en: "Reply as host" },
  review_prompt: { ar: "ما رأيك في هذا المكان؟", en: "How was your experience?" },
  write_experience: { ar: "اكتب تجربتك (اختياري)", en: "Write your experience (optional)" },
  photo: { ar: "صورة", en: "Photo" },
  uploading: { ar: "جارٍ الرفع", en: "Uploading" },
  send_review: { ar: "إرسال التقييم", en: "Submit review" },
  cancel: { ar: "إلغاء", en: "Cancel" },
  // Cart / booking
  cart_title: { ar: "سلة التسوق", en: "Cart" },
  cart_empty: { ar: "سلتك فارغة", en: "Your cart is empty" },
  cart_empty_sub: { ar: "أضف منتجات من التسويق المحلي", en: "Add products from the marketplace" },
  browse_products: { ar: "تصفح المنتجات", en: "Browse products" },
  delivery_info: { ar: "معلومات التوصيل", en: "Delivery info" },
  full_name: { ar: "الاسم الكامل", en: "Full name" },
  phone: { ar: "رقم الهاتف", en: "Phone number" },
  address: { ar: "عنوان التوصيل", en: "Delivery address" },
  notes_optional: { ar: "ملاحظات (اختياري)", en: "Notes (optional)" },
  total: { ar: "الإجمالي", en: "Total" },
  place_order: { ar: "إتمام الطلب", en: "Place order" },
  order_success: { ar: "تم إرسال طلبك بنجاح ✓", en: "Order placed successfully ✓" },
  confirm_booking: { ar: "تأكيد الحجز", en: "Confirm booking" },
  choose_date: { ar: "اختر التاريخ", en: "Choose a date" },
  guests_count: { ar: "عدد الأشخاص", en: "Number of guests" },
  booking_success: { ar: "تم إرسال طلب الحجز بنجاح ✓", en: "Booking request sent ✓" },
  payment_note_booking: { ar: "سيتم تسجيل طلبك وسنتواصل معك للتأكيد. الدفع غير مطلوب الآن.", en: "Your request will be recorded and we'll contact you to confirm. No payment needed now." },
  payment_note_cart: { ar: "سيتم تسجيل طلبك وسنتواصل معك للتأكيد والدفع عند الاستلام.", en: "Your order will be recorded and we'll confirm with cash on delivery." },
  // Auth
  login: { ar: "تسجيل الدخول", en: "Log in" },
  login_cta: { ar: "دخول", en: "Sign in" },
  welcome_back: { ar: "مرحباً بعودتك، سجّل الدخول للمتابعة", en: "Welcome back, sign in to continue" },
  email: { ar: "البريد الإلكتروني", en: "Email" },
  password: { ar: "كلمة المرور", en: "Password" },
  continue_google: { ar: "المتابعة عبر Google", en: "Continue with Google" },
  no_account: { ar: "ليس لديك حساب؟", en: "No account?" },
  create_account: { ar: "إنشاء حساب", en: "Create account" },
  have_account: { ar: "لديك حساب بالفعل؟", en: "Already have an account?" },
  tagline: { ar: "اكتشف جزيرة سقطرى — جوهرة المحيط الهندي", en: "Discover Socotra — the jewel of the Indian Ocean" },
  or: { ar: "أو", en: "or" },
};

type I18nState = {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  t: (key: keyof typeof STRINGS | string) => string;
  pick: (item: any, base: string) => string;
};

const I18nContext = createContext<I18nState>({} as I18nState);
export const useI18n = () => useContext(I18nContext);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");

  useEffect(() => {
    storage.getItem(KEY, "ar").then((v) => {
      if (v === "en" || v === "ar") setLangState(v);
    });
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    storage.setItem(KEY, l);
  }, []);

  const toggle = useCallback(() => setLang(lang === "ar" ? "en" : "ar"), [lang, setLang]);

  const t = useCallback(
    (key: string) => {
      const entry = STRINGS[key];
      if (!entry) return key;
      return entry[lang];
    },
    [lang]
  );

  const pick = useCallback(
    (item: any, base: string) => {
      if (!item) return "";
      return item[`${base}_${lang}`] || item[`${base}_ar`] || item[`${base}_en`] || "";
    },
    [lang]
  );

  return <I18nContext.Provider value={{ lang, setLang, toggle, t, pick }}>{children}</I18nContext.Provider>;
}
