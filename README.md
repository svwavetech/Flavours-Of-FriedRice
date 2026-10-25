# Flavours of FriedRice – Digital Menu

## Files
- index.html – page structure
- styles.css – colours, fonts, layout (brand colours are at the top)
- menu-data.js – YOUR MENU + settings (edit this file)
- app.js – filters, search, views, dark mode, ordering
- images/ – put photos here

## Change the menu (menu-data.js)
1. Open menu-data.js.
2. Each dish is one block. Change name, description, dineInPrice, takeawayPrice.
3. Copy a block to add a dish. Give it a new unique id.
4. Set available: false to show "Currently unavailable".
5. category must be "Fried Rice", "Noodles" or "Others". vegetarian: true/false controls the Veg / Non-Veg filter.

## Badges
In menu-data.js set tag to "Chef's Choice", "Popular" or "Special" (or ""). With no tag, bestseller: true shows "Bestseller". Use subtitle for the small line under a name, e.g. "(Boneless Gravy)".

## Change photos
The 4 rice photos currently in images/ are PLACEHOLDERS cropped from your design mockup (low resolution). Replace them with real photos of your dishes (same file names, or change the image: path).
Your logo is images/logo.png (header and footer) and images/favicon.png (browser tab).
1. Copy your photo into images/ (JPG, about 800px wide, under 150 KB).
2. Set image: "images/your-file.jpg" for that dish.
3. Put your hero bowl photo at images/hero.jpg and your logo at images/logo.png (then swap the logo line in index.html).

## Turn on WhatsApp ordering
In menu-data.js set whatsappNumber: "91XXXXXXXXXX" (country code + number, digits only). Empty = ordering stays off.

## Views and dark mode
Top bar moon/sun = dark mode. Three buttons next to search = Double (2 columns), Single (1 column) and 3D (big cards that tilt as you scroll). Sort (top right of the list) orders by price or bestsellers. The heart saves favourites on that phone. Choices are remembered on the phone.

## Publish (free, HTTPS)
Netlify: go to app.netlify.com/drop, drag this whole folder in. You get an https link. Cloudflare Pages or GitHub Pages also work.

## QR code
1. Publish first and copy the final https link.
2. Make a QR at any QR generator (choose URL, download SVG or high-res PNG).
3. Print at least 3 cm x 3 cm, dark on light. Scan-test on 2-3 phones.

## Needs a backend later (not in this version)
Admin login and dashboard, photo upload, online payment, order confirmation back to the customer.


## Manage availability with PIN (added)
- Tap the floating “Manage Availability” button.
- Enter the default 6-digit PIN: `123456`.
- Search/filter dishes and tap AVAILABLE / UNAVAILABLE.
- Availability is saved in localStorage in the current browser and restored on refresh.
- Use “Lock admin panel” or close the panel when finished.

Security note: this is a frontend-only PIN gate, suitable only as a basic deterrent. The PIN is present in app.js and can be discovered by someone inspecting the site source. The saved status is local to one browser and will not synchronise to customers on other devices. For real protection and live QR-menu updates, implement server-side authentication plus a shared database/API.
