/* ==========================================================
   MENU DATA — edit this file to change your menu.
   Prices are in rupees (numbers only, no ₹ sign).
   Dish names come from your printed menu. PRICES ARE PLACEHOLDERS: set the
   real dineInPrice and takeawayPrice for every dish. The dish photos in
   images/ are cropped from your printed menu: replace them with real photos
   whenever you like. Dishes without a photo (the noodles) show an emoji.
   ========================================================== */

window.SITE_CONFIG = {
  brand: "Flavours of FriedRice",
  tagline: "Wok Tossed. Flavour Packed. Always Fresh.",

  // WhatsApp ordering. Leave "" to keep ordering OFF.
  // Format: country code + number, digits only. Example: "91XXXXXXXXXX"
  whatsappNumber: "",

  // Optional footer details. Leave "" to hide a line.
  location: "",
  hours: "",
  phone: ""
};

/*
  category : "Fried Rice", "Noodles" or "Others"   (a category with no dishes is hidden automatically)
  vegetarian : true / false  -> decides the Veg / Non-Veg filters
  subtitle : optional small line under the name, e.g. "(Chicken 65 Pieces)"
  tag : optional badge. Use exactly one of: "Chef's Choice", "Popular", "Special" (or leave "").
        If tag is empty and bestseller is true, the "★ Bestseller" badge shows instead.
  description : keep it short (2 lines show on the card)
  image : file inside the images/ folder. If the file is missing, an emoji placeholder shows.
  keywords : extra words customers can search for
*/
window.MENU = [
  /* ---------------- NON-VEG FRIED RICE ---------------- */
  { id: 1,  name: "Egg Loaded Fried Rice", subtitle: "(Double Egg Tossed)", category: "Fried Rice", vegetarian: false, bestseller: false, tag: "",
    description: "Wok-tossed rice loaded with fluffy scrambled egg.",
    image: "images/egg-loaded.jpg", dineInPrice: 100, takeawayPrice: 120, available: true, keywords: "egg anda rice" },

  { id: 2,  name: "Classic Chicken Fried Rice", subtitle: "(Chicken 65 Pieces)", category: "Fried Rice", vegetarian: false, bestseller: true, tag: "",
    description: "Fried rice topped with crispy Chicken 65 pieces.",
    image: "images/classic-chicken.jpg", dineInPrice: 100, takeawayPrice: 120, available: true, keywords: "chicken 65 rice" },

  { id: 3,  name: "Boneless Chicken Fry Bit Fried Rice", subtitle: "", category: "Fried Rice", vegetarian: false, bestseller: false, tag: "Chef's Choice",
    description: "Fried rice with boneless chicken fry bits on the side.",
    image: "images/boneless-fry-bit.jpg", dineInPrice: 120, takeawayPrice: 140, available: true, keywords: "boneless chicken fry bit rice" },

  { id: 4,  name: "Chicken Kebab Fried Rice", subtitle: "", category: "Fried Rice", vegetarian: false, bestseller: false, tag: "Popular",
    description: "Smoky grilled chicken kebab over wok-fried rice.",
    image: "images/chicken-kebab.jpg", dineInPrice: 100, takeawayPrice: 120, available: true, keywords: "chicken kebab leg piece rice" },

  { id: 5,  name: "Special Chicken Fried Rice", subtitle: "(Boneless Gravy)", category: "Fried Rice", vegetarian: false, bestseller: false, tag: "Special",
    description: "Fried rice served with rich boneless chicken gravy.",
    image: "images/special-chicken-gravy.jpg", dineInPrice: 130, takeawayPrice: 160, available: true, keywords: "special chicken boneless gravy rice" },

  { id: 6,  name: "Special Kebab Fried Rice", subtitle: "(Kebab Gravy)", category: "Fried Rice", vegetarian: false, bestseller: false, tag: "Special",
    description: "Fried rice served with chicken kebab in spicy gravy.",
    image: "images/special-kebab-gravy.jpg", dineInPrice: 130, takeawayPrice: 160, available: true, keywords: "special kebab gravy chicken rice" },

  /* ---------------- VEG FRIED RICE ---------------- */
  { id: 7,  name: "Classic Veg Fried Rice", subtitle: "", category: "Fried Rice", vegetarian: true, bestseller: false, tag: "",
    description: "Fresh vegetables tossed with rice on a roaring flame.",
    image: "images/classic-veg.jpg", dineInPrice: 100, takeawayPrice: 100, available: true, keywords: "vegetable veg rice" },

  { id: 8,  name: "Special Paneer Fried Rice", subtitle: "", category: "Fried Rice", vegetarian: true, bestseller: false, tag: "Popular",
    description: "Fried rice served with spicy paneer gravy.",
    image: "images/special-paneer.jpg", dineInPrice: 120, takeawayPrice: 160, available: true, keywords: "paneer cottage cheese rice" },

  { id: 9,  name: "Special Mushroom Fried Rice", subtitle: "", category: "Fried Rice", vegetarian: true, bestseller: false, tag: "",
    description: "Fried rice served with creamy mushroom gravy.",
    image: "images/special-mushroom.jpg", dineInPrice: 120, takeawayPrice: 160, available: true, keywords: "mushroom rice" },

  { id: 10, name: "Special Kaju Fried Rice", subtitle: "", category: "Fried Rice", vegetarian: true, bestseller: false, tag: "",
    description: "Fried rice with crunchy cashews and kaju gravy.",
    image: "images/special-kaju.jpg", dineInPrice: 120, takeawayPrice: 160, available: true, keywords: "kaju cashew rice" },

  { id: 11, name: "Special Kaju Mushroom Fried Rice", subtitle: "", category: "Fried Rice", vegetarian: true, bestseller: false, tag: "Chef's Choice",
    description: "Cashews and mushrooms with fried rice and gravy.",
    image: "images/special-kaju-mushroom.jpg", dineInPrice: 140, takeawayPrice: 160, available: true, keywords: "kaju cashew mushroom rice" },

  { id: 12, name: "Special Kaju Paneer Fried Rice", subtitle: "", category: "Fried Rice", vegetarian: true, bestseller: true, tag: "",
    description: "Cashews and paneer with fried rice and rich gravy.",
    image: "images/special-kaju-paneer.jpg", dineInPrice: 140, takeawayPrice: 160, available: true, keywords: "kaju cashew paneer rice" },

  /* ---------------- NOODLES ---------------- */
  { id: 13, name: "Veg Noodles", subtitle: "", category: "Noodles", vegetarian: true, bestseller: false, tag: "",
    description: "Street-style noodles tossed with crisp vegetables.",
    image: "images/veg-noodles.png", dineInPrice: 80, takeawayPrice: 90, available: true, keywords: "noodles hakka vegetable veg" },

  { id: 14, name: "Egg Noodles", subtitle: "", category: "Noodles", vegetarian: false, bestseller: false, tag: "",
    description: "Smoky wok noodles with egg and spring onion.",
    image: "images/egg-noodles.png", dineInPrice: 90, takeawayPrice: 100, available: true, keywords: "noodles egg anda" },

  { id: 15, name: "Chicken Noodles", subtitle: "", category: "Noodles", vegetarian: false, bestseller: true, tag: "",
    description: "Juicy chicken pieces with wok-fired noodles.",
    image: "images/chicken-noodles.png", dineInPrice: 110, takeawayPrice: 120, available: true, keywords: "noodles chicken" }
];
