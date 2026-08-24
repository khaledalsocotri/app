"""
Demo/seed content for Socotra Explorer.
This data is for development only and is fully replaceable via a future admin dashboard.
All content is data-driven — the mobile app never hardcodes it.
"""
import uuid


def _id(prefix: str) -> str:
    return f"{prefix}{uuid.uuid4().hex[:16]}"


# --- Image pool (remote, optimized on the client via expo-image) ---
IMG = {
    "beach1": "https://images.pexels.com/photos/33562466/pexels-photo-33562466.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "dragon": "https://images.unsplash.com/photo-1642425150068-422fef94a8ea?q=85&w=1200",
    "sunset": "https://images.unsplash.com/photo-1642425146676-992ad3f73e26?q=85&w=1200",
    "handicraft": "https://images.unsplash.com/photo-1629218091978-f70a20a43aab?q=85&w=1200",
    "lagoon": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=85&w=1200",
    "cave": "https://images.unsplash.com/photo-1520962880247-cfaf541c8724?q=85&w=1200",
    "dunes": "https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=85&w=1200",
    "mountains": "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=85&w=1200",
    "snorkel": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=85&w=1200",
    "camp": "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=85&w=1200",
    "village": "https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=85&w=1200",
    "honey": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=85&w=1200",
    "frankincense": "https://images.unsplash.com/photo-1602928321679-560bb453f190?q=85&w=1200",
    "resin": "https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?q=85&w=1200",
    "aloe": "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?q=85&w=1200",
    "pottery": "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=85&w=1200",
    "basket": "https://images.unsplash.com/photo-1595408076683-5d0c643e4f96?q=85&w=1200",
    "dinner": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=85&w=1200",
    "music": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=85&w=1200",
    "farm": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=85&w=1200",
    "boat": "https://images.unsplash.com/photo-1533130061792-64b345e4a833?q=85&w=1200",
    "coast": "https://images.unsplash.com/photo-1519046904884-53103b34b206?q=85&w=1200",
}


def build_seed() -> dict:
    dest_categories = [
        {"id": _id("dc_"), "key": "nature", "name_ar": "طبيعة", "name_en": "Nature", "icon": "leaf", "color": "#2D7A5D", "order": 1},
        {"id": _id("dc_"), "key": "beaches", "name_ar": "شواطئ", "name_en": "Beaches", "icon": "water", "color": "#158C9B", "order": 2},
        {"id": _id("dc_"), "key": "activities", "name_ar": "أنشطة", "name_en": "Activities", "icon": "bicycle", "color": "#C39158", "order": 3},
        {"id": _id("dc_"), "key": "accommodation", "name_ar": "إقامة", "name_en": "Accommodation", "icon": "bed", "color": "#4A6E8C", "order": 4},
        {"id": _id("dc_"), "key": "services", "name_ar": "خدمات", "name_en": "Services", "icon": "construct", "color": "#8A7A5C", "order": 5},
        {"id": _id("dc_"), "key": "cultural", "name_ar": "أماكن ثقافية", "name_en": "Cultural", "icon": "book", "color": "#B87F28", "order": 6},
        {"id": _id("dc_"), "key": "experiences", "name_ar": "تجارب محلية", "name_en": "Local Experiences", "icon": "sparkles", "color": "#0F6B76", "order": 7},
    ]

    def dest(name_ar, name_en, cat, loc_ar, loc_en, lat, lng, desc_ar, imgs, rating, featured=False, popular=False, **extra):
        base = {
            "id": _id("dest_"),
            "name_ar": name_ar, "name_en": name_en,
            "category": cat,
            "location_ar": loc_ar, "location_en": loc_en,
            "latitude": lat, "longitude": lng,
            "cover_image": imgs[0],
            "images": imgs,
            "description_ar": desc_ar,
            "description_en": "A breathtaking natural site on Socotra Island, offering unique landscapes and unforgettable views.",
            "rating": rating,
            "reviews_count": extra.get("reviews_count", 0),
            "best_time_ar": extra.get("best_time_ar", "أكتوبر – أبريل"),
            "duration_ar": extra.get("duration_ar", "2 – 3 ساعات"),
            "difficulty_ar": extra.get("difficulty_ar", "سهل"),
            "how_to_get_ar": extra.get("how_to_get_ar", "الوصول عبر سيارة دفع رباعي من مدينة حديبو."),
            "vehicle_ar": extra.get("vehicle_ar", "دفع رباعي 4x4"),
            "internet_ar": extra.get("internet_ar", "ضعيف / غير متوفر"),
            "nearby_services": extra.get("nearby_services", ["مواقف سيارات", "مرشد محلي"]),
            "activities": extra.get("activities", ["تصوير", "مشي"]),
            "tags": extra.get("tags", []),
            "featured": featured,
            "popular": popular,
        }
        return base

    destinations = [
        dest("بحيرة ديتوة", "Ditwah Lagoon", "beaches", "قلنسية", "Qalansiyah", 12.6889, 53.4692,
             "بحيرة ساحلية خلابة بمياه فيروزية صافية تفصلها كثبان رملية عن البحر، من أجمل المواقع الطبيعية في سقطرى.",
             [IMG["beach1"], IMG["lagoon"], IMG["coast"]], 4.9, featured=True, popular=True,
             reviews_count=248, activities=["سباحة", "تصوير", "مشي على الرمال"], tags=["بحيرة", "شاطئ", "عائلي"],
             difficulty_ar="سهل"),
        dest("غابة دم الأخوين", "Dragon Blood Forest", "nature", "فرمهين", "Firmihin", 12.5106, 54.0206,
             "غابة أشجار دم الأخوين النادرة ذات الشكل المظلي المميز، رمز جزيرة سقطرى وأحد عجائب الطبيعة.",
             [IMG["dragon"], IMG["mountains"], IMG["sunset"]], 5.0, featured=True, popular=True,
             reviews_count=312, activities=["تصوير", "مشي جبلي"], tags=["أشجار نادرة", "جبال", "أيقوني"],
             difficulty_ar="متوسط", duration_ar="نصف يوم"),
        dest("شاطئ قلنسية", "Qalansiyah Beach", "beaches", "قلنسية", "Qalansiyah", 12.6833, 53.4833,
             "شاطئ رملي أبيض ممتد بمياه هادئة، مثالي للاسترخاء ومشاهدة غروب الشمس.",
             [IMG["coast"], IMG["beach1"], IMG["boat"]], 4.7, popular=True,
             reviews_count=156, activities=["سباحة", "قوارب", "غروب"], tags=["شاطئ", "استرخاء"]),
        dest("كثبان عرهر الرملية", "Arher Sand Dunes", "nature", "عرهر", "Arher", 12.5722, 54.4739,
             "كثبان رملية ذهبية شاهقة تلتقي بمياه البحر الفيروزية عند سفح الجبال، مشهد فريد لا يُنسى.",
             [IMG["dunes"], IMG["coast"], IMG["beach1"]], 4.8, featured=True,
             reviews_count=189, activities=["تسلق الكثبان", "تخييم", "سباحة"], tags=["كثبان", "بحر", "تخييم"],
             difficulty_ar="متوسط"),
        dest("كهف هوق", "Hoq Cave", "activities", "حديبو", "Hadibo", 12.5872, 54.3494,
             "كهف كلسي ضخم بطول ثلاثة كيلومترات يضم تشكيلات صخرية مذهلة ونقوشاً أثرية قديمة.",
             [IMG["cave"], IMG["mountains"]], 4.6,
             reviews_count=98, activities=["استكشاف الكهوف", "مشي"], tags=["كهف", "مغامرة"],
             difficulty_ar="صعب", duration_ar="4 – 5 ساعات", vehicle_ar="دفع رباعي + مشي"),
        dest("محمية حومهيل", "Homhil Protected Area", "nature", "حومهيل", "Homhil", 12.5744, 54.3053,
             "محمية طبيعية جبلية تضم أشجار اللبان ودم الأخوين وبِركة طبيعية بإطلالة بانورامية على الساحل.",
             [IMG["mountains"], IMG["dragon"], IMG["village"]], 4.8, popular=True,
             reviews_count=134, activities=["مشي جبلي", "سباحة في البركة", "تصوير"], tags=["محمية", "جبال", "لبان"],
             difficulty_ar="متوسط", duration_ar="نصف يوم"),
        dest("محمية ديحمري البحرية", "Dihamri Marine Reserve", "activities", "ديحمري", "Dihamri", 12.4783, 54.1806,
             "محمية بحرية غنية بالشعاب المرجانية والأسماك الملونة، وجهة مثالية للغطس والسنوركل.",
             [IMG["snorkel"], IMG["coast"], IMG["boat"]], 4.7,
             reviews_count=112, activities=["سنوركل", "غطس", "تصوير تحت الماء"], tags=["شعاب مرجانية", "غطس"]),
        dest("منتجع عرهر البيئي", "Arher Eco Camp", "accommodation", "عرهر", "Arher", 12.5700, 54.4700,
             "مخيم بيئي بسيط على شاطئ عرهر يوفر خياماً مريحة ووجبات محلية بإطلالة على الكثبان والبحر.",
             [IMG["camp"], IMG["dunes"]], 4.5,
             reviews_count=76, activities=["تخييم", "شواء", "نجوم"], tags=["إقامة", "مخيم"],
             internet_ar="غير متوفر", nearby_services=["مطعم", "دورات مياه", "مرشد"]),
        dest("مدينة حديبو", "Hadibo Town", "services", "حديبو", "Hadibo", 12.6517, 54.0225,
             "العاصمة والمركز الرئيسي للجزيرة، تضم الأسواق والمطاعم وخدمات المسافرين ونقاط الانطلاق للرحلات.",
             [IMG["village"], IMG["coast"]], 4.2, popular=True,
             reviews_count=54, activities=["تسوق", "مطاعم"], tags=["مدينة", "خدمات"],
             internet_ar="متوفر", vehicle_ar="أي مركبة",
             nearby_services=["بنوك", "صيدليات", "مطاعم", "محطات وقود"]),
        dest("قرية شعب", "Shoab Village & Beach", "cultural", "رأس شعب", "Ras Shoab", 12.6167, 53.3833,
             "شاطئ منعزل نقي يُوصل إليه بالقارب، مأهول بالدلافين ومشاهد بحرية ساحرة وقرية صيد تقليدية.",
             [IMG["boat"], IMG["coast"], IMG["beach1"]], 4.9, featured=True,
             reviews_count=203, activities=["رحلة قارب", "مشاهدة الدلافين", "سباحة"], tags=["قارب", "دلافين", "منعزل"],
             how_to_get_ar="عبر قارب من قلنسية (حوالي 45 دقيقة)."),
        dest("وادي ديرهور", "Wadi Dirhur Canyon", "nature", "ديكسم", "Diksam", 12.4869, 54.0089,
             "وادٍ عميق محاط بهضاب ديكسم وأشجار دم الأخوين، مع بِرك مياه عذبة صالحة للسباحة.",
             [IMG["mountains"], IMG["dragon"]], 4.7, popular=True,
             reviews_count=88, activities=["سباحة", "مشي", "تصوير"], tags=["وادٍ", "مياه عذبة"],
             difficulty_ar="متوسط"),
        dest("هضبة ديكسم", "Diksam Plateau", "cultural", "ديكسم", "Diksam", 12.4950, 54.0100,
             "هضبة مرتفعة توفر إطلالات بانورامية على غابات دم الأخوين والوديان، ومهد للثقافة السقطرية الأصيلة.",
             [IMG["sunset"], IMG["mountains"], IMG["dragon"]], 4.8,
             reviews_count=67, activities=["تصوير", "مشاهدة الغروب"], tags=["هضبة", "إطلالة"],
             difficulty_ar="سهل"),
    ]

    def exp(name_ar, name_en, desc_ar, price, dur_ar, loc_ar, provider_ar, imgs, rating, **extra):
        return {
            "id": _id("exp_"),
            "name_ar": name_ar, "name_en": name_en,
            "description_ar": desc_ar,
            "description_en": "Authentic Socotri cultural experience led by local hosts.",
            "price": price, "currency": "USD",
            "duration_ar": dur_ar,
            "location_ar": loc_ar,
            "provider_ar": provider_ar,
            "cover_image": imgs[0], "images": imgs,
            "rating": rating, "reviews_count": extra.get("reviews_count", 0),
            "availability_ar": extra.get("availability_ar", "متاح يومياً"),
            "category": extra.get("category", "experiences"),
            "included": extra.get("included", ["مرشد محلي", "مشروبات"]),
        }

    experiences = [
        exp("عشاء سقطري تقليدي", "Traditional Socotri Dinner",
            "استمتع بوجبة عشاء تقليدية مع عائلة سقطرية تشمل السمك الطازج والأرز والتمور بأجواء أصيلة.",
            25, "ساعتان", "حديبو", "عائلة آل سالم", [IMG["dinner"], IMG["village"]], 4.9, reviews_count=64),
        exp("تجربة استخراج العسل", "Honey Harvesting Experience",
            "رافق مربي النحل المحليين في جبال سقطرى لاستخراج العسل البري النادر وتذوقه طازجاً.",
            40, "3 ساعات", "حومهيل", "تعاونية العسل الجبلي", [IMG["honey"], IMG["farm"]], 4.8, reviews_count=41),
        exp("تجربة استخراج دم الأخوين", "Dragon Blood Resin Experience",
            "تعلّم كيف يُستخرج صمغ دم الأخوين الأحمر النادر من الأشجار المعمرة واستخداماته التقليدية.",
            35, "ساعتان", "فرمهين", "مرشدو ديكسم", [IMG["resin"], IMG["dragon"]], 4.9, reviews_count=52),
        exp("تجربة اللبان العطري", "Frankincense Experience",
            "اكتشف أشجار اللبان وطريقة جمع الصمغ العطري وتقطيره في تجربة حسية فريدة.",
            30, "ساعتان", "حومهيل", "مزارعو اللبان", [IMG["frankincense"], IMG["mountains"]], 4.7, reviews_count=33),
        exp("أمسية موسيقى تقليدية", "Traditional Music Evening",
            "ليلة من الغناء والرقص السقطري التقليدي حول النار تحت سماء مليئة بالنجوم.",
            20, "ساعتان", "عرهر", "فرقة التراث السقطري", [IMG["music"], IMG["camp"]], 4.8, reviews_count=48),
        exp("تجربة الزراعة المحلية", "Local Farming Experience",
            "شارك المزارعين المحليين في زراعة النخيل والصبار وتعلّم أساليب الري التقليدية.",
            22, "3 ساعات", "قلنسية", "مزرعة الواحة", [IMG["farm"], IMG["aloe"]], 4.6, reviews_count=27),
        exp("جلسة معرفة ثقافية", "Cultural Knowledge Session",
            "جلسة مع كبار السن للتعرف على اللغة السقطرية والطب التقليدي والحكايات الشعبية.",
            15, "ساعة ونصف", "ديكسم", "مجلس القرية", [IMG["village"], IMG["sunset"]], 4.7, reviews_count=19),
    ]

    product_categories = [
        {"id": _id("pc_"), "key": "crafts", "name_ar": "الحرف والمنتجات", "name_en": "Crafts & Goods", "icon": "hammer", "order": 1},
        {"id": _id("pc_"), "key": "culture", "name_ar": "الثقافة والفنون", "name_en": "Culture & Arts", "icon": "color-palette", "order": 2},
        {"id": _id("pc_"), "key": "food", "name_ar": "المأكولات والمشروبات", "name_en": "Food & Drinks", "icon": "restaurant", "order": 3},
        {"id": _id("pc_"), "key": "nature", "name_ar": "الطبيعة والزراعة", "name_en": "Nature & Farming", "icon": "leaf", "order": 4},
        {"id": _id("pc_"), "key": "services", "name_ar": "الخدمات المحلية", "name_en": "Local Services", "icon": "briefcase", "order": 5},
        {"id": _id("pc_"), "key": "experiences", "name_ar": "التجارب المحلية", "name_en": "Local Experiences", "icon": "sparkles", "order": 6},
        {"id": _id("pc_"), "key": "offers", "name_ar": "العروض والفعاليات", "name_en": "Offers & Events", "icon": "pricetag", "order": 7},
    ]

    def prod(name_ar, name_en, cat, price, seller_ar, imgs, desc_ar, **extra):
        return {
            "id": _id("prod_"),
            "name_ar": name_ar, "name_en": name_en,
            "category": cat,
            "price": price, "currency": "USD",
            "seller_ar": seller_ar,
            "cover_image": imgs[0], "images": imgs,
            "description_ar": desc_ar,
            "description_en": "Authentic local product from Socotra Island.",
            "availability_ar": extra.get("availability_ar", "متوفر"),
            "in_stock": extra.get("in_stock", True),
            "rating": extra.get("rating", 4.7),
        }

    products = [
        prod("عسل سقطري بري", "Socotri Wild Honey", "food", 45, "تعاونية العسل الجبلي",
             [IMG["honey"], IMG["farm"]], "عسل بري نقي من نحل جبال سقطرى، غني بالنكهة والفوائد الصحية.", rating=4.9),
        prod("لبان سقطري أصلي", "Socotri Frankincense", "food", 18, "مزارعو اللبان",
             [IMG["frankincense"]], "صمغ اللبان العطري الأصيل يُستخدم للبخور والاستخدامات العلاجية التقليدية.", rating=4.8),
        prod("صمغ دم الأخوين", "Dragon Blood Resin", "nature", 30, "مرشدو ديكسم",
             [IMG["resin"], IMG["dragon"]], "الصمغ الأحمر النادر من أشجار دم الأخوين، يُستخدم في الصباغة والطب التقليدي.", rating=4.9),
        prod("صبار سقطري", "Socotra Aloe", "nature", 12, "مزرعة الواحة",
             [IMG["aloe"]], "منتجات الصبار السقطري الطبيعية للعناية بالبشرة والصحة.", rating=4.6),
        prod("سلة مصنوعة يدوياً", "Handwoven Basket", "crafts", 22, "حرفيات قلنسية",
             [IMG["basket"], IMG["handicraft"]], "سلة تقليدية منسوجة يدوياً من سعف النخيل بألوان طبيعية.", rating=4.7),
        prod("فخار سقطري", "Socotri Pottery", "crafts", 28, "ورشة حديبو",
             [IMG["pottery"], IMG["handicraft"]], "أواني فخارية مصنوعة يدوياً بأساليب تقليدية موروثة.", rating=4.5),
        prod("منحوتة خشبية", "Wooden Carving", "culture", 35, "فنانو ديكسم",
             [IMG["handicraft"]], "منحوتات خشبية فنية تحكي رموز الثقافة السقطرية الأصيلة.", rating=4.6),
        prod("زيت اللبان العطري", "Frankincense Essential Oil", "food", 26, "مزارعو اللبان",
             [IMG["frankincense"], IMG["aloe"]], "زيت عطري مقطّر من صمغ اللبان السقطري النقي.", rating=4.8),
    ]

    events = [
        {"id": _id("ev_"), "name_ar": "مهرجان سقطرى للتراث", "name_en": "Socotra Heritage Festival",
         "description_ar": "احتفال سنوي بالثقافة والموسيقى والحرف السقطرية في مدينة حديبو.",
         "cover_image": IMG["music"], "date_ar": "15 – 18 نوفمبر", "location_ar": "حديبو", "price": 0},
        {"id": _id("ev_"), "name_ar": "أسبوع الطبيعة البحرية", "name_en": "Marine Nature Week",
         "description_ar": "فعاليات غطس وتوعية بيئية في محمية ديحمري البحرية.",
         "cover_image": IMG["snorkel"], "date_ar": "1 – 7 ديسمبر", "location_ar": "ديحمري", "price": 0},
        {"id": _id("ev_"), "name_ar": "سوق الحرفيين المحلي", "name_en": "Local Artisans Market",
         "description_ar": "معرض أسبوعي للحرف اليدوية والمنتجات المحلية.",
         "cover_image": IMG["handicraft"], "date_ar": "كل جمعة", "location_ar": "قلنسية", "price": 0},
    ]

    offers = [
        {"id": _id("of_"), "name_ar": "خصم 20% على رحلة 5 أيام", "name_en": "20% off 5-day trip",
         "description_ar": "عرض خاص لمدة محدودة على باقة استكشاف سقطرى الكاملة.",
         "cover_image": IMG["dragon"], "discount": 20, "valid_until_ar": "حتى نهاية الشهر"},
        {"id": _id("of_"), "name_ar": "باقة العائلة", "name_en": "Family Package",
         "description_ar": "خصومات على الحجوزات العائلية للتجارب المحلية.",
         "cover_image": IMG["beach1"], "discount": 15, "valid_until_ar": "طوال الموسم"},
    ]

    def trip(name_ar, name_en, days, price, seats, imgs, desc_ar, itinerary, **extra):
        return {
            "id": _id("trip_"),
            "name_ar": name_ar, "name_en": name_en,
            "duration_days": days,
            "price": price, "currency": "USD",
            "available_seats": seats,
            "cover_image": imgs[0], "images": imgs,
            "description_ar": desc_ar,
            "description_en": "A curated multi-day tour of Socotra's finest landscapes and experiences.",
            "rating": extra.get("rating", 4.8),
            "reviews_count": extra.get("reviews_count", 0),
            "dates_ar": extra.get("dates_ar", ["1 نوفمبر", "15 نوفمبر", "1 ديسمبر"]),
            "included": extra.get("included", ["إقامة", "مواصلات داخلية", "وجبات", "مرشد سياحي", "رسوم الدخول"]),
            "excluded": extra.get("excluded", ["تذاكر الطيران الدولية", "التأمين", "المصاريف الشخصية"]),
            "accommodation_ar": extra.get("accommodation_ar", "مخيمات بيئية ونُزل محلية"),
            "transportation_ar": extra.get("transportation_ar", "سيارات دفع رباعي وقوارب"),
            "activities": extra.get("activities", ["مشي", "سباحة", "تصوير", "تخييم"]),
            "itinerary": itinerary,
        }

    trips = [
        trip("استكشاف سقطرى الكامل", "Complete Socotra Explorer", 7, 1200, 8,
             [IMG["dragon"], IMG["beach1"], IMG["dunes"], IMG["cave"]],
             "رحلة شاملة لسبعة أيام تغطي أبرز معالم الجزيرة من الغابات إلى الشواطئ والكهوف والكثبان.",
             [
                 {"day": 1, "title_ar": "الوصول وحديبو", "desc_ar": "استقبال من المطار واستراحة في حديبو."},
                 {"day": 2, "title_ar": "غابة دم الأخوين وديكسم", "desc_ar": "زيارة الغابة الأيقونية وهضبة ديكسم."},
                 {"day": 3, "title_ar": "وادي ديرهور", "desc_ar": "سباحة في البِرك العذبة ومشي في الوادي."},
                 {"day": 4, "title_ar": "كثبان عرهر", "desc_ar": "تسلق الكثبان وتخييم على الشاطئ."},
                 {"day": 5, "title_ar": "كهف هوق", "desc_ar": "استكشاف الكهف الكلسي الضخم."},
                 {"day": 6, "title_ar": "بحيرة ديتوة وشعب", "desc_ar": "رحلة قارب ومشاهدة الدلافين."},
                 {"day": 7, "title_ar": "المغادرة", "desc_ar": "تسوق وتوصيل إلى المطار."},
             ], rating=4.9, reviews_count=87),
        trip("رحلة الطبيعة القصيرة", "Nature Short Escape", 4, 700, 10,
             [IMG["mountains"], IMG["dragon"], IMG["coast"]],
             "رحلة مركّزة لأربعة أيام تناسب من يملك وقتاً محدوداً لاكتشاف جمال سقطرى الطبيعي.",
             [
                 {"day": 1, "title_ar": "الوصول", "desc_ar": "الوصول والإقامة في حديبو."},
                 {"day": 2, "title_ar": "الغابة والهضبة", "desc_ar": "دم الأخوين وديكسم."},
                 {"day": 3, "title_ar": "الشاطئ", "desc_ar": "قلنسية وبحيرة ديتوة."},
                 {"day": 4, "title_ar": "المغادرة", "desc_ar": "التوصيل إلى المطار."},
             ], rating=4.7, reviews_count=44),
        trip("مغامرة الشواطئ والبحر", "Beaches & Sea Adventure", 5, 900, 6,
             [IMG["beach1"], IMG["snorkel"], IMG["boat"], IMG["dunes"]],
             "رحلة لمحبي البحر تشمل الغطس ورحلات القوارب والتخييم على أجمل شواطئ الجزيرة.",
             [
                 {"day": 1, "title_ar": "الوصول", "desc_ar": "الوصول والإقامة."},
                 {"day": 2, "title_ar": "ديحمري", "desc_ar": "غطس وسنوركل في المحمية البحرية."},
                 {"day": 3, "title_ar": "عرهر", "desc_ar": "الكثبان والتخييم."},
                 {"day": 4, "title_ar": "شعب", "desc_ar": "رحلة قارب ومشاهدة الدلافين."},
                 {"day": 5, "title_ar": "المغادرة", "desc_ar": "التوصيل إلى المطار."},
             ], rating=4.8, reviews_count=61),
    ]

    return {
        "destination_categories": dest_categories,
        "destinations": destinations,
        "experiences": experiences,
        "product_categories": product_categories,
        "products": products,
        "events": events,
        "offers": offers,
        "trips": trips,
    }
