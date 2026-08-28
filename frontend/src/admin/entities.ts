// Central config for the Web Admin Dashboard. Each entity maps to the shared
// FastAPI backend (same DB the mobile app reads). The generic EntityScreen
// renders a table + create/edit form from this config, so content added here
// appears instantly in the mobile app.

export type FieldType = "text" | "number" | "bool" | "list" | "icon" | "select" | "images";

export type AdminField = {
  k: string;
  t: FieldType;
  label: string;
  multiline?: boolean;
  options?: string[];
  optionsFrom?: "categories" | "product_categories";
  hint?: string;
};

export type AdminEntity = {
  key: string; // route segment + backend admin entity name
  entity: string; // backend /api/admin/{entity}
  listPath: string; // GET path for the list
  label: string; // plural label (Arabic)
  labelSingular: string;
  icon: string;
  color: string;
  hasImages: boolean;
  fields: AdminField[];
};

// Preset icons offered in icon pickers (Ionicons names).
export const ICON_PRESETS = [
  "leaf", "umbrella", "triangle", "bonfire", "water", "boat", "business", "bed",
  "construct", "sparkles", "hammer", "color-palette", "restaurant", "briefcase",
  "pricetag", "location", "star", "cafe", "bicycle", "camera", "fish", "flower",
];

const IMAGES_FIELD: AdminField = { k: "images", t: "images", label: "الصور (الأولى هي الغلاف)" };

export const ENTITIES: Record<string, AdminEntity> = {
  places: {
    key: "places",
    entity: "destinations",
    listPath: "/destinations",
    label: "الأماكن",
    labelSingular: "مكان",
    icon: "location",
    color: "#158C9B",
    hasImages: true,
    fields: [
      { k: "name_ar", t: "text", label: "الاسم (عربي)" },
      { k: "name_en", t: "text", label: "الاسم (إنجليزي)" },
      { k: "category", t: "select", label: "الفئة", optionsFrom: "categories" },
      { k: "location_ar", t: "text", label: "الموقع (عربي)" },
      { k: "location_en", t: "text", label: "الموقع (إنجليزي)" },
      { k: "description_ar", t: "text", label: "الوصف (عربي)", multiline: true },
      { k: "description_en", t: "text", label: "الوصف (إنجليزي)", multiline: true },
      IMAGES_FIELD,
      { k: "marker_icon", t: "icon", label: "أيقونة العلامة على الخريطة" },
      { k: "latitude", t: "number", label: "خط العرض (Latitude)" },
      { k: "longitude", t: "number", label: "خط الطول (Longitude)" },
      { k: "rating", t: "number", label: "التقييم (1-5)" },
      { k: "story_ar", t: "text", label: "معرفة محلية / قصة (عربي)", multiline: true },
      { k: "story_en", t: "text", label: "معرفة محلية / قصة (إنجليزي)", multiline: true },
      { k: "facts_ar", t: "text", label: "حقائق ممتعة (عربي) — سطر لكل حقيقة", multiline: true },
      { k: "facts_en", t: "text", label: "حقائق ممتعة (إنجليزي) — سطر لكل حقيقة", multiline: true },
      { k: "warnings_ar", t: "text", label: "تنبيهات وسلامة (عربي) — سطر لكل تنبيه", multiline: true },
      { k: "warnings_en", t: "text", label: "تنبيهات وسلامة (إنجليزي) — سطر لكل تنبيه", multiline: true },
      { k: "best_time_ar", t: "text", label: "أفضل وقت للزيارة" },
      { k: "duration_ar", t: "text", label: "المدة" },
      { k: "difficulty_ar", t: "text", label: "الصعوبة" },
      { k: "how_to_get_ar", t: "text", label: "كيفية الوصول", multiline: true },
      { k: "activities", t: "list", label: "الأنشطة (افصل بفاصلة)" },
      { k: "nearby_services", t: "list", label: "الأماكن/الخدمات القريبة (افصل بفاصلة)" },
      { k: "featured", t: "bool", label: "مميّز (يظهر في الواجهة)" },
      { k: "popular", t: "bool", label: "شائع" },
    ],
  },
  trips: {
    key: "trips",
    entity: "trips",
    listPath: "/trips",
    label: "الرحلات",
    labelSingular: "رحلة",
    icon: "airplane",
    color: "#0F6B76",
    hasImages: true,
    fields: [
      { k: "name_ar", t: "text", label: "الاسم (عربي)" },
      { k: "name_en", t: "text", label: "الاسم (إنجليزي)" },
      IMAGES_FIELD,
      { k: "description_ar", t: "text", label: "الوصف (عربي)", multiline: true },
      { k: "description_en", t: "text", label: "الوصف (إنجليزي)", multiline: true },
      { k: "duration_days", t: "number", label: "عدد الأيام" },
      { k: "price", t: "number", label: "السعر (USD)" },
      { k: "available_seats", t: "number", label: "المقاعد المتاحة" },
      { k: "rating", t: "number", label: "التقييم (1-5)" },
      { k: "dates_ar", t: "list", label: "التواريخ المتاحة (افصل بفاصلة)" },
      { k: "included", t: "list", label: "يشمل (افصل بفاصلة)" },
      { k: "excluded", t: "list", label: "لا يشمل (افصل بفاصلة)" },
      { k: "accommodation_ar", t: "text", label: "الإقامة" },
      { k: "transportation_ar", t: "text", label: "المواصلات" },
      { k: "activities", t: "list", label: "الأنشطة (افصل بفاصلة)" },
    ],
  },
  experiences: {
    key: "experiences",
    entity: "experiences",
    listPath: "/experiences",
    label: "التجارب",
    labelSingular: "تجربة",
    icon: "sparkles",
    color: "#2D7A5D",
    hasImages: true,
    fields: [
      { k: "name_ar", t: "text", label: "الاسم (عربي)" },
      { k: "name_en", t: "text", label: "الاسم (إنجليزي)" },
      IMAGES_FIELD,
      { k: "description_ar", t: "text", label: "الوصف (عربي)", multiline: true },
      { k: "description_en", t: "text", label: "الوصف (إنجليزي)", multiline: true },
      { k: "price", t: "number", label: "السعر للشخص (USD)" },
      { k: "duration_ar", t: "text", label: "المدة" },
      { k: "location_ar", t: "text", label: "الموقع" },
      { k: "provider_ar", t: "text", label: "المزوّد" },
      { k: "availability_ar", t: "text", label: "التوفر" },
      { k: "rating", t: "number", label: "التقييم (1-5)" },
    ],
  },
  products: {
    key: "products",
    entity: "products",
    listPath: "/products",
    label: "المنتجات",
    labelSingular: "منتج",
    icon: "cube",
    color: "#C39158",
    hasImages: true,
    fields: [
      { k: "name_ar", t: "text", label: "الاسم (عربي)" },
      { k: "name_en", t: "text", label: "الاسم (إنجليزي)" },
      { k: "category", t: "select", label: "الفئة", optionsFrom: "product_categories" },
      IMAGES_FIELD,
      { k: "description_ar", t: "text", label: "الوصف (عربي)", multiline: true },
      { k: "description_en", t: "text", label: "الوصف (إنجليزي)", multiline: true },
      { k: "price", t: "number", label: "السعر (USD)" },
      { k: "seller_ar", t: "text", label: "البائع / المزوّد" },
      { k: "availability_ar", t: "text", label: "التوفر" },
      { k: "in_stock", t: "bool", label: "متوفر" },
      { k: "rating", t: "number", label: "التقييم (1-5)" },
    ],
  },
  offers: {
    key: "offers",
    entity: "offers",
    listPath: "/offers",
    label: "العروض والإعلانات",
    labelSingular: "عرض",
    icon: "pricetag",
    color: "#B87F28",
    hasImages: true,
    fields: [
      { k: "name_ar", t: "text", label: "العنوان (عربي)" },
      { k: "name_en", t: "text", label: "العنوان (إنجليزي)" },
      IMAGES_FIELD,
      { k: "description_ar", t: "text", label: "الوصف (عربي)", multiline: true },
      { k: "discount", t: "number", label: "نسبة الخصم %" },
      { k: "valid_until_ar", t: "text", label: "صالح حتى" },
    ],
  },
  events: {
    key: "events",
    entity: "events",
    listPath: "/events",
    label: "الفعاليات",
    labelSingular: "فعالية",
    icon: "calendar",
    color: "#4A6E8C",
    hasImages: true,
    fields: [
      { k: "name_ar", t: "text", label: "الاسم (عربي)" },
      { k: "name_en", t: "text", label: "الاسم (إنجليزي)" },
      IMAGES_FIELD,
      { k: "description_ar", t: "text", label: "الوصف (عربي)", multiline: true },
      { k: "date_ar", t: "text", label: "التاريخ" },
      { k: "location_ar", t: "text", label: "الموقع" },
      { k: "price", t: "number", label: "السعر (0 = مجاني)" },
    ],
  },
  services: {
    key: "services",
    entity: "services",
    listPath: "/services",
    label: "الخدمات",
    labelSingular: "خدمة",
    icon: "construct",
    color: "#38484A",
    hasImages: true,
    fields: [
      { k: "name_ar", t: "text", label: "الاسم (عربي)" },
      { k: "name_en", t: "text", label: "الاسم (إنجليزي)" },
      { k: "category", t: "select", label: "الفئة", options: ["health", "fuel", "bank", "guide", "restaurant", "shop"] },
      IMAGES_FIELD,
      { k: "description_ar", t: "text", label: "الوصف (عربي)", multiline: true },
      { k: "description_en", t: "text", label: "الوصف (إنجليزي)", multiline: true },
      { k: "location_ar", t: "text", label: "الموقع" },
      { k: "phone", t: "text", label: "الهاتف" },
      { k: "latitude", t: "number", label: "خط العرض" },
      { k: "longitude", t: "number", label: "خط الطول" },
      { k: "rating", t: "number", label: "التقييم (1-5)" },
    ],
  },
  categories: {
    key: "categories",
    entity: "categories",
    listPath: "/categories",
    label: "فئات الأماكن",
    labelSingular: "فئة",
    icon: "grid",
    color: "#158C9B",
    hasImages: false,
    fields: [
      { k: "key", t: "text", label: "المعرّف (بالإنجليزية بدون مسافات) مثل: nature", hint: "يُستخدم لربط الأماكن بالفئة" },
      { k: "name_ar", t: "text", label: "الاسم (عربي)" },
      { k: "name_en", t: "text", label: "الاسم (إنجليزي)" },
      { k: "icon", t: "icon", label: "الأيقونة" },
      { k: "color", t: "text", label: "اللون (Hex) مثل: #158C9B" },
      { k: "order", t: "number", label: "الترتيب" },
    ],
  },
  "product-categories": {
    key: "product-categories",
    entity: "product_categories",
    listPath: "/marketplace/categories",
    label: "فئات المتجر",
    labelSingular: "فئة متجر",
    icon: "pricetags",
    color: "#C39158",
    hasImages: false,
    fields: [
      { k: "key", t: "text", label: "المعرّف (بالإنجليزية) مثل: crafts", hint: "يُستخدم لربط المنتجات بالفئة" },
      { k: "name_ar", t: "text", label: "الاسم (عربي)" },
      { k: "name_en", t: "text", label: "الاسم (إنجليزي)" },
      { k: "icon", t: "icon", label: "الأيقونة" },
      { k: "order", t: "number", label: "الترتيب" },
    ],
  },
};

// Sidebar navigation order.
export const NAV: { route: string; label: string; icon: string }[] = [
  { route: "/admin", label: "لوحة التحكم", icon: "grid-outline" },
  { route: "/admin/places", label: "الأماكن", icon: "location-outline" },
  { route: "/admin/trips", label: "الرحلات", icon: "airplane-outline" },
  { route: "/admin/experiences", label: "التجارب", icon: "sparkles-outline" },
  { route: "/admin/products", label: "المنتجات", icon: "cube-outline" },
  { route: "/admin/offers", label: "العروض والإعلانات", icon: "pricetag-outline" },
  { route: "/admin/events", label: "الفعاليات", icon: "calendar-outline" },
  { route: "/admin/services", label: "الخدمات", icon: "construct-outline" },
  { route: "/admin/categories", label: "فئات الأماكن", icon: "grid-outline" },
  { route: "/admin/product-categories", label: "فئات المتجر", icon: "pricetags-outline" },
  { route: "/admin/bookings", label: "الحجوزات", icon: "receipt-outline" },
];
