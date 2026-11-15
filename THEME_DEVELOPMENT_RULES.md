# E-DawatNama Theme Development & System Architecture Rules
**Standard Specification for Designing, Implementing, and QA of Digital Wedding Themes**
*Version: 2.0 | Last Updated: November 2026*

---

## 1. Core Philosophy & Theme Identity

E-DawatNama creates bespoke, high-luxury interactive digital wedding invitations designed specifically for Pakistani and South Asian weddings worldwide. Every theme must maintain royal elegance, cultural authenticity, effortless mobile responsiveness, and technical excellence.

### Standard Theme Checklist:
- [ ] Mobile-first responsive layout (optimized for 360px–430px modern smartphone screens and up to 4K desktop displays).
- [ ] Dual-language support (**English** & **Urdu Nastaliq**).
- [ ] Family perspective toggle (**Groom's Side / لڑکے والے** vs **Bride's Side / لڑکی والے**).
- [ ] Dynamic Multi-Event support (1-Day, 2-Day, 3-Day, or Custom Sub-events).
- [ ] Clean URL and guest-segmentation routing (`e-dawatnama.com/{couple}/{event}`).
- [ ] Cloudflare Pages Open Graph crawler compatibility.
- [ ] Strict background audio management (stops on tab switch/blur).
- [ ] Mandatory Google Map buttons for all venues.
- [ ] Royal footer credit: `✦ Crafted by E-dawatnama.com ✦`.

---

## 2. URL & Guest Segmentation Architecture

Every theme must respect the unified URL convention matching the flagship Mughal standard:

```
https://e-dawatnama.com/{couple-slug}/{event-variant}?[params]
```

### 2.1 URL Routing & Variants
| Route Variant | Guest Audience | Events Visible in Theme |
| :--- | :--- | :--- |
| `/{couple}/all` or `/{couple}` | VIP / Close Family | Complete Wedding (all selected days: Mehndi, Barat, Walima) |
| `/{couple}/mehndi-barat` | Mehndi + Barat Guests | Only Mehndi & Barat schedules, countdown, venues, & RSVP |
| `/{couple}/barat-walima` | Barat + Walima Guests | Only Barat & Walima |
| `/{couple}/mehndi-walima` | Mehndi + Walima Guests | Only Mehndi & Walima |
| `/{couple}/barat` | Barat-Only Guests | Only Barat Ceremony & Rukhsati |
| `/{couple}/walima` | Walima-Only Guests | Only Walima Reception |
| `/{couple}/mehndi` | Mehndi-Only Guests | Only Mehndi Ceremony |

### 2.2 Theme Event Filtering Rule
When a theme loads:
1. Parse the current URL pathname:
   ```javascript
   const segments = window.location.pathname.split("/").filter(Boolean);
   const eventVariant = segments[1] || new URLSearchParams(window.location.search).get("card") || "all";
   ```
2. Filter the active events list (`activeNormalizedEvents` / `activeList`):
   - If `eventVariant === "walima"`, exclude Mehndi and Barat.
   - If `eventVariant === "barat"`, exclude Mehndi and Walima.
   - If `eventVariant === "mehndi"`, exclude Barat and Walima.
   - If `eventVariant === "mehndi-walima"`, exclude Barat.
   - If `eventVariant === "all"` or unspecified, display all events placed in the order.
3. Automatically adapt:
   - **Hero Date & Heading**: Display the exact date/event for the invited day.
   - **Countdown Clock**: Target the first date of the guest's invited events.
   - **Timeline / Schedule**: Render rows only for the invited ceremonies.
   - **Venue Details**: Render only the venue(s) for the invited ceremonies.
   - **RSVP Checkboxes**: Show only the ceremonies the guest is invited to.

---

## 3. Bilingual Support & Urdu Typography

### 3.1 Font Stack
Urdu text must use authentic Nastaliq calligraphy:
```css
font-family: 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif;
direction: rtl;
```
For English, use high-end serif typography (`Ovo`, `Playfair Display`, `Cinzel`, `Cinzel Decorative`, `Cormorant Garamond`) paired with clean sans-serif for functional data.

### 3.2 Side Selection (لڑکے والے vs لڑکی والے)
- **Groom's Side (`groom`)**:
  - Invitation text: *"cordially request the honour of your gracious presence to celebrate the wedding ceremonies of their beloved son..."*
  - Urdu: *"اپنے لختِ جگر کی شادی خانہ آبادی کے پرمسرت موقع پر..."*
  - Primary focus includes Barat Arrival and Walima Reception.
- **Bride's Side (`bride`)**:
  - Invitation text: *"cordially request the honour of your gracious presence to celebrate the auspicious wedding ceremonies and Rukhsati of their beloved daughter..."*
  - Urdu: *"اپنی نورِ نظر / لختِ جگر کی تقریبِ بارات و رخصتی کے پروقار موقع پر..."*
  - Primary focus includes Arrival of Barat, Sacred Nikkah, and Rukhsati. Walima is usually omitted unless specifically hosted by the bride's side.

---

## 4. Couple Credentials, Professions & Secondary Parents Rules

Pakistani digital invitations frequently feature professional credentials and respectful lineage identifiers for both the groom and bride.

### 4.1 Fields Specification
1. **Groom Profession / Title (`groomOccupation`)**:
   - Optional credential displayed beneath the Groom's name (e.g., *"Software Architect & Entrepreneur"*, *"Doctor of Medicine"*, *"Civil Engineer"*, *"Businessman"*).
2. **Bride Profession / Title (`brideOccupation`)**:
   - Optional credential displayed beneath the Bride's name (e.g., *"Doctor of Medicine (M.D)"*, *"Lecturer"*, *"Graphic Designer"*).
3. **Secondary Parents / In-Laws (`otherParents` / `brideParents` / `groomParents`)**:
   - **For Groom's Card**: Bride's Parents line (e.g., *"Mr. & Mrs. Kamran Akhtar"*). Displayed under the Bride's name as:
     - English: `"Daughter of Mr. & Mrs. Kamran Akhtar"`
     - Urdu: `"دختر جناب و محترمہ کامران اختر"`
   - **For Bride's Card**: Groom's Parents line (e.g., *"Mr. & Mrs. Tariq Mahmood"*). Displayed under the Groom's name as:
     - English: `"Son of Mr. & Mrs. Tariq Mahmood"`
     - Urdu: `"فرزند جناب و محترمہ طارق محمود"`

### 4.2 Mandatory "Remove (✕)" and Restore Capability
- In the Order Form (`order.html`), all 3 credential fields are **strictly optional** and must provide an inline `[✕ Remove]` button.
- If a client or family prefers privacy or a minimal layout, clicking `✕ Remove` hides the input and clears its value.
- An intuitive `+ Add ...` restore pill (`btnAddGroomOcc`, `btnAddBrideOcc`, `btnAddOtherParents`) must be rendered so the client can restore the field anytime if desired.
- In themes, if any credential field is empty or removed, the theme **must cleanly omit the line** without rendering blank vertical spaces, broken line breaks, or duplicate parent lines.

---

## 5. Sub-Schedules, Meal Types & Timing Rules

Pakistani weddings feature specific ceremonies with strict timing workflows. All themes and order forms must adhere to the following rules:

### 4.1 Chronological Order
All sub-events inside an event schedule must be chronologically sorted by time:
- For example on Barat:
  1. **Sehra Bandi** (سہرا بندی)
  2. **Departure of Barat** (روانگیِ بارات)
  3. **Arrival of Barat & Reception** (آمدِ بارات و استقبال)
  4. **Sacred Nikkah** (مسنون نکاح)
  5. **Dinner / Lunch** (پرتکلف عشائیہ / ظہرانہ)
  6. **Rukhsati** (دعاؤں کے سائے میں رخصتی)
  7. **Dua & Concluding Blessings** (اختتامی دعا)

### 4.2 Meal Type & Time Hierarchy
- **Meal Type Selection** (`Dinner` vs `Lunch` vs `Hi-Tea` vs `None`) must be placed at the **top** of the meal section.
- **Meal Time** must always be placed **above Rukhsati** (Dinner/Lunch always happens before Rukhsati).
- **Time Suggestions Auto-Fill**:
  - If **Lunch** is selected: Suggest times between **1:00 PM and 4:00 PM** (e.g., Arrival: 1:30 PM, Nikkah: 2:00 PM, Lunch: 2:30 PM, Rukhsati: 4:00 PM).
  - If **Dinner** is selected: Suggest times between **6:00 PM and 10:30 PM** (e.g., Arrival: 7:30 PM, Nikkah: 8:15 PM, Dinner: 9:00 PM, Rukhsati: 10:30 PM).

### 4.3 Mandatory Google Maps Links
- Physical venue addresses must always include a verified Google Maps URL.
- The theme must provide a prominent, styled `📍 View in Google Maps / گوگل میپ میں دیکھیں` button with `target="_blank"` and `rel="noopener noreferrer"`.

---

## 5. Wedding Taglines & Badges

All themes must render optional wedding taglines prominently on the event cards or hero section.

### 5.1 Standard Tagline Suggestions
- **Groom's Side**:
  - `"دل والے دلہنیا لے جا رہے ہیں"` (*Dil Walay Dulhania Le Ja Rahay Hain*)
  - `"شہزادے کی بارات"` (*Shehzaday Ki Baraat*)
- **Bride's Side**:
  - `"دعاؤں کے سائے میں رخصتی"` (*Duaon Kay Saaye Mein Rukhsati*)
  - `"بابا کی لاڈلی، دعاؤں کی چھاؤں میں"` (*Baba Ki Laadli, Duaon Ki Chhaon Mein*)
  - `"آنگن کی رونق، دعاؤں کے ساتھ رخصت"` (*Aangan Ki Raunaq*)
- **Universal / Both Sides**:
  - `"ایک نئی زندگی کا بابرکت آغاز"` (*A Blessed Beginning of a New Life*)
  - `"دو دل، ایک نئی شروعات"` (*Do Dil, Aik Nayi Shuruat*)
  - `"محبت اور دعاؤں کا حسیں سفر"` (*A Journey of Love & Prayers*)
  - `"دو دلوں کا ملن، نئے سفر کا آغاز"` (*Two Hearts, One Sacred Journey*)

### 5.2 Theme Styling Standard
Tagline badges must be styled as an ornate pill with:
- Subdued thematic background gradient (gold/amber tint or theme accent).
- Dashed or hairline border.
- Centered calligraphy in Urdu (`font-size: 15–16px`) and italic serif in English (`font-size: 13–14px`).

---

## 6. Audio & Media QA Rules

### 6.1 Music Playback & Page Visibility
- Audio must only play upon direct user gesture (e.g. tapping "Open Invitation", tapping the wax seal, or clicking the music toggle).
- **CRITICAL**: When the user switches tabs, minimizes the browser, or leaves the website, the audio **MUST STOP OR PAUSE IMMEDIATELY**:
  ```javascript
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && window.bgAudio && !window.bgAudio.paused) {
      window.bgAudio.pause();
      window.wasPlayingBeforeHidden = true;
    } else if (!document.hidden && window.wasPlayingBeforeHidden) {
      window.bgAudio.play().catch(() => {});
      window.wasPlayingBeforeHidden = false;
    }
  });

  window.addEventListener("pagehide", () => {
    if (window.bgAudio) window.bgAudio.pause();
  });
  ```

### 6.2 Video and Seal Synchronization
- Interactive seals (wax seal breaking, envelope flaps opening) must use CSS hardware-accelerated transforms (`translate3d`, `scale3d`) or preloaded canvas frames.
- Background video loops must have `playsinline`, `muted` (for initial load if autoplay is required by iOS), and graceful poster fallbacks.

---

## 7. Data Contract Specification

Dynamic invitations encode wedding details into a Base64 URL parameter (`?invite=...` or `?d=...`). All themes must adhere to this unified JSON structure:

```json
{
  "cardSide": "groom",
  "theme": "burgundy",
  "groom": "Syed Usama",
  "groomUrdu": "سید اسامہ",
  "groomOccupation": "Software Architect & Entrepreneur",
  "bride": "Dr. Bissal Khan",
  "brideUrdu": "ڈاکٹر بسل خان",
  "brideOccupation": "Doctor of Medicine (M.D)",
  "otherParents": "Mr. & Mrs. Kamran Akhtar",
  "otherParentsUrdu": "جناب و محترمہ کامران اختر",
  "brideParents": "Mr. & Mrs. Kamran Akhtar",
  "tagline": "دل والے دلہنیا لے جا رہے ہیں",
  "taglineUrdu": "دل والے دلہنیا لے جا رہے ہیں",
  "taglineRoman": "Dil Walay Dulhania Le Ja Rahay Hain",
  "hosts": "Mr. & Mrs. Irshad Ali",
  "hostsUrdu": "جناب و محترمہ ارشاد علی",
  "welcoming": [
    { "name": "Hamza Irshad", "phone": "+923001234567" }
  ],
  "eventsList": [
    {
      "type": "mehndi",
      "title": "Mehndi Ceremony",
      "titleUrdu": "تقریبِ مہندی",
      "date": "2026-10-15",
      "displayDate": "Thursday, October 15, 2026",
      "displayDateUrdu": "جمعرات، ۱۵ اکتوبر ۲۰۲۶",
      "time": "07:30 PM",
      "venue": "Haveli Hall, Pearl Continental",
      "venueUrdu": "حویلی ہال، پرل کانٹینینٹل",
      "address": "Mall Road, Lahore",
      "addressUrdu": "مال روڈ، لاہور",
      "mapUrl": "https://maps.google.com/?q=PC+Lahore",
      "mealType": "dinner",
      "subSchedule": [
        { "title": "Guest Arrival", "time": "07:30 PM", "subtitle": "Welcome drinks" },
        { "title": "Rasm-e-Hina", "time": "08:30 PM", "subtitle": "Henna celebrations" },
        { "title": "Dinner", "time": "09:30 PM", "subtitle": "Traditional feast" }
      ]
    },
    {
      "type": "barat",
      "title": "Baraat & Nikkah",
      "titleUrdu": "بارات اور نکاح",
      "date": "2026-10-16",
      "displayDate": "Friday, October 16, 2026",
      "displayDateUrdu": "جمعہ، ۱۶ اکتوبر ۲۰۲۶",
      "time": "08:00 PM",
      "sehraTime": "06:30 PM",
      "departureTime": "07:00 PM",
      "arrivalTime": "08:00 PM",
      "nikkahTime": "08:45 PM",
      "mealType": "dinner",
      "mealTime": "09:30 PM",
      "rukhsatiTime": "11:00 PM",
      "venue": "Royal Palm Golf & Country Club",
      "venueUrdu": "رائل پام گالف اینڈ کنٹری کلب",
      "address": "Canal Bank Road, Lahore",
      "addressUrdu": "کینال بینک روڈ، لاہور",
      "mapUrl": "https://maps.google.com/?q=Royal+Palm+Lahore"
    },
    {
      "type": "walima",
      "title": "Walima Reception",
      "titleUrdu": "دعوتِ ولیمہ",
      "date": "2026-10-18",
      "displayDate": "Sunday, October 18, 2026",
      "displayDateUrdu": "اتوار، ۱۸ اکتوبر ۲۰۲۶",
      "time": "08:00 PM",
      "arrivalTime": "08:00 PM",
      "mealType": "dinner",
      "mealTime": "09:00 PM",
      "venue": "Mughal Palace Marquee",
      "venueUrdu": "مغل پیلس مارکی",
      "address": "Gulberg III, Lahore",
      "addressUrdu": "گلبرگ III، لاہور",
      "mapUrl": "https://maps.google.com/?q=Mughal+Palace+Lahore"
    }
  ]
}
```

---

## 8. Multi-Event Link Architecture & Edge Routing

All themes and invitation links adhere to the unified Mughal-style URL convention:
```
https://e-dawatnama.com/{couple-slug}/{event-variant}?invite={payload}&theme={theme}
```

### 8.1 URL Path & Variant Standards
- **Couple Slug**:
  - Groom's family card: `${slugify(groom)}-and-${slugify(bride)}` (e.g. `zayan-and-rania`)
  - Bride's family card: `${slugify(bride)}-with-${slugify(groom)}` (e.g. `rania-with-zayan`)
- **Event Variant Slugs**:
  - `all` or `mehndi-barat-walima`: Complete wedding invitation with all active days.
  - `barat`: Single-day Barat & Rukhsati ceremony invitation.
  - `walima`: Single-day Walima Reception invitation.
  - `mehndi`: Single-day Mehndi ceremony invitation.
  - `mehndi-barat`: 2-day Mehndi + Barat combination.
  - `barat-walima`: 2-day Barat + Walima combination.
  - `mehndi-walima`: 2-day Mehndi + Walima combination.

### 8.2 Mandatory Theme Variant Resolver
Every theme must include the unified variant resolver and filtering engine:
```javascript
function resolveCardVariantFromUrl() {
  const p = new URLSearchParams(window.location.search);
  const queryVar = (p.get("card") || p.get("event") || "").toLowerCase().trim();
  if (queryVar) return queryVar;

  const pathSegments = decodeURIComponent(window.location.pathname || "").split("/").filter(Boolean);
  if (pathSegments.length >= 2) {
    const last = pathSegments[pathSegments.length - 1].toLowerCase().replace(/\.(html|php)$/i, "");
    const known = ["all", "walima", "barat", "baraat", "mehndi", "mehndi-barat", "mehndi-baraat", "barat-walima", "baraat-walima", "mehndi-walima", "mehndi-barat-walima", "nikkah"];
    if (known.includes(last)) return last;
  } else if (pathSegments.length === 1) {
    const single = pathSegments[0].toLowerCase().replace(/\.(html|php)$/i, "");
    const known = ["walima", "barat", "baraat", "mehndi", "mehndi-barat", "barat-walima", "mehndi-walima", "all"];
    if (known.includes(single)) return single;
  }
  return "all";
}

function filterEventsByVariant(list, variant) {
  if (!variant || variant === "all" || variant === "mehndi-barat-walima") return list;
  const norm = variant.toLowerCase().replace("baraat", "barat");
  let allowed = [];
  if (norm === "walima") allowed = ["walima"];
  else if (norm === "barat") allowed = ["barat", "baraat"];
  else if (norm === "mehndi") allowed = ["mehndi"];
  else if (norm === "mehndi-barat") allowed = ["mehndi", "barat", "baraat"];
  else if (norm === "barat-walima") allowed = ["barat", "baraat", "walima"];
  else if (norm === "mehndi-walima") allowed = ["mehndi", "walima"];
  else allowed = [norm];

  const filtered = list.filter(e => {
    const k = ((e.key || e.type || "") + "").toLowerCase().replace("baraat", "barat");
    return allowed.includes(k);
  });
  return filtered.length > 0 ? filtered : list;
}
```

### 8.3 Theme Component Adaptation Rules
When an event variant is active (e.g. Walima only):
1. **Hero & Date Badges**: Must target the date, time, and ceremony title of the invited ceremony (e.g. showing "Walima Reception — Sunday, October 18, 2026", not Baraat).
2. **Timeline / Itinerary**: Must render rows exclusively for the ceremonies included in that variant.
3. **Countdown Clock**: Must compute remaining time against the earliest ceremony of the filtered list.
4. **Venue & RSVP**: Must provide maps and RSVP buttons corresponding to the guest's invited events.

### 8.4 Cloudflare Edge Routing (`_worker.js`)
`_worker.js` intercepts requests to serve themes and customized Open Graph tags:
1. **Internal Rewrite**:
   Paths like `/{couple-slug}/{event-variant}` are mapped directly to the appropriate theme HTML file (`/royal-grace`, `/burgundy-romance`, `/shahi-farman`, `/noor-e-nikkah`, or `/index.html`) using internal `env.ASSETS.fetch` without redirecting the browser.
2. **Dynamic Social Crawler Previews**:
   - `og:title`: `${couple} — ${eventTitle}` (e.g. *Zayan & Rania — Walima Reception* or *Zayan & Rania — Baraat & Rukhsati Ceremony*).
   - `og:description`: Tailored to that specific ceremony.
   - `og:image`: High-resolution theme poster matching the chosen aesthetic.

---

## 9. Brand Integrity & Showcase Attribution

Every theme must include the official brand footer:
```html
<div class="brand-footer-credit">
  <a href="/about" target="_blank" rel="noopener">✦ Crafted by E-dawatnama.com ✦</a>
</div>
```
- Clicking this footer opens the E-DawatNama about/showcase page (`/about`).
- The link must never break the visual immersion of the wedding card.
