# E-DawatNama Theme Development & System Architecture Rules
**Standard Specification for Designing, Implementing, and QA of Digital Wedding Themes**
*Version: 2.5 | Last Updated: November 2026*

---

## 1. Core Philosophy & Theme Identity

E-DawatNama creates bespoke, high-luxury interactive digital wedding invitations designed specifically for Pakistani and South Asian weddings worldwide. Every theme must maintain royal elegance, cultural authenticity, effortless mobile responsiveness, and technical excellence.

### Standard Theme Checklist:
- [ ] Mobile-first responsive layout (pixel-perfect on 360px–430px modern smartphone screens and up to 4K desktop displays).
- [ ] Dual-language support (**English** & **Urdu Nastaliq**) with seamless toggle.
- [ ] Family perspective support (**Groom's Side / لڑکے والے** vs **Bride's Side / لڑکی والے**).
- [ ] Dynamic Multi-Event support (1-Day, 2-Day, 3-Day, or Custom Sub-events) adhering to client presets.
- [ ] Clean URL and guest-segmentation routing (`e-dawatnama.com/{couple}/{event}`).
- [ ] Resilient payload decoding (Base64 UTF-8, URL-encoded JSON, and direct JSON).
- [ ] Bidirectional event normalization (`eventsList` array $\leftrightarrow$ `events` dictionary).
- [ ] 3-Tier Split Host Typography layout in English & Urdu.
- [ ] Groom & Bride professional credentials and secondary parentage badges with clean omission when empty.
- [ ] Cloudflare Pages Open Graph crawler compatibility.
- [ ] Strict background audio management (auto-pause on `visibilitychange` hidden, `pagehide`, and `blur`).
- [ ] Interactive envelope/wax seal cover with tap hint and instant unseal for deep links.
- [ ] Mandatory Google Map buttons for all venues.
- [ ] Royal footer credit: `✦ Crafted by E-dawatnama.com ✦`.

---

## 2. 3-Tier Split Host Header Typography Rule

To ensure royal elegance and traditional respect, the host invitation block must **NEVER** be rendered as a single flat string. All themes must implement the **3-Tier Split Host Layout**:

### 2.1 Layout Architecture
```
┌────────────────────────────────────────────────────────┐
│  Tier 1: Prefix / Honorific (Small, letter-spaced)    │
│          "MR. & MRS." / "جناب و محترمہ"                │
├────────────────────────────────────────────────────────┤
│  Tier 2: Host / Parents Names (Prominent, Bold Serif)  │
│          "Tariq Mahmood" / "طارق محمود"                 │
├────────────────────────────────────────────────────────┤
│  Tier 3: Cordial Invitation Line (Italic / Calligraphy) │
│          "cordially invite you to celebrate..."        │
│          "پرمسرت موقع پر شرکت کی پرخلوص درخواست..."   │
└────────────────────────────────────────────────────────┘
```

### 2.2 Standard Implementation (English & Urdu)
```html
<div class="host-invitation-container">
  <div class="host-prefix-line" id="tHostPrefix">
    <!-- English: "MR. & MRS." | Urdu: "جناب و محترمہ" -->
  </div>
  <h2 class="host-name-line" id="tHostNames">
    <!-- English: "Tariq Mahmood" | Urdu: "طارق محمود" (Bold display font) -->
  </h2>
  <p class="host-invite-desc" id="tHostIntro">
    <!-- English: "Cordially invite you to celebrate the wedding ceremony of their beloved son" -->
    <!-- Urdu: "اپنے لختِ جگر کی شادی خانہ آبادی کے پرمسرت موقع پر آپ کی شرکت کے متمنی ہیں" -->
  </p>
</div>
```

### 2.3 Automated Prefix Parser
If the incoming data passes a combined host string like `"Mr. & Mrs. Tariq Mahmood"`, themes must split and normalize the prefix automatically:
```javascript
function parseHostHeader(hostStr, isUrdu) {
  if (!hostStr) return { prefix: isUrdu ? "جناب و محترمہ" : "MR. & MRS.", name: "" };
  const raw = hostStr.trim();
  
  // English matchers
  const enMatch = raw.match(/^(Mr\.\s*&\s*Mrs\.?|Mr\s*&\s*Mrs\.?|Mr\.?|Mrs\.?)\s*(.*)$/i);
  if (enMatch && !isUrdu) {
    return { prefix: enMatch[1].toUpperCase(), name: enMatch[2].trim() };
  }
  
  // Urdu matchers
  const urMatch = raw.match(/^(جناب\s*و\s*محترمہ|جناب|محترمہ)\s*(.*)$/);
  if (urMatch && isUrdu) {
    return { prefix: urMatch[1], name: urMatch[2].trim() };
  }
  
  return { prefix: isUrdu ? "جناب و محترمہ" : "MR. & MRS.", name: raw };
}
```

---

## 3. URL & Guest Segmentation Architecture

Every theme must respect the unified URL convention matching the flagship Mughal standard:

```
https://e-dawatnama.com/{couple-slug}/{event-variant}?[params]
```

### 3.1 URL Routing & Variants
| Route Variant | Guest Audience | Events Visible in Theme |
| :--- | :--- | :--- |
| `/{couple}/all` or `/{couple}` | VIP / Close Family | Complete Wedding (all selected days: Mehndi, Barat, Walima) |
| `/{couple}/mehndi-barat` | Mehndi + Barat Guests | Only Mehndi & Barat schedules, countdown, venues, & RSVP |
| `/{couple}/barat-walima` | Barat + Walima Guests | Only Barat & Walima |
| `/{couple}/mehndi-walima` | Mehndi + Walima Guests | Only Mehndi & Walima |
| `/{couple}/barat` | Barat-Only Guests | Only Barat Ceremony & Rukhsati |
| `/{couple}/walima` | Walima-Only Guests | Only Walima Reception |
| `/{couple}/mehndi` | Mehndi-Only Guests | Only Mehndi Ceremony |

### 3.2 Order Presets & Link Generator Workflow
In the Order Form (`order.html`) and Studio (`admin.html`), client orders are categorized into presets:
1. **3-Day Wedding**: Generates links for `all`, `mehndi-barat`, `barat-walima`, `mehndi`, `barat`, and `walima`.
2. **2-Day Wedding (Barat + Walima)**: Generates links for `all` (Barat + Walima), `barat`, and `walima`.
3. **2-Day Wedding (Mehndi + Barat)**: Generates links for `all` (Mehndi + Barat), `mehndi`, and `barat`.
4. **1-Day Single Event**: Generates dedicated single-event link (e.g. `barat` or `walima`).

### 3.3 Theme Event Filtering Rule
When a theme loads:
1. Parse the current URL pathname or query parameter:
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
   ```
2. Filter active events list strictly:
   - If variant is `walima`, completely omit Mehndi and Barat.
   - If variant is `barat`, completely omit Mehndi and Walima.
   - If variant is `mehndi`, completely omit Barat and Walima.
   - If variant is `mehndi-walima`, completely omit Barat.
   - If variant is `all`, display all events included in the order.
3. Automatically adapt:
   - **Hero Date & Heading**: Display the exact date and ceremony title of the invited day.
   - **Countdown Clock**: Target the first date of the guest's invited events.
   - **Timeline / Schedule**: Render rows exclusively for the invited ceremonies.
   - **Venue Details**: Render only the venue(s) for the invited ceremonies.
   - **RSVP Form**: Show checkboxes/options only for the ceremonies the guest is invited to.

---

## 4. Couple Credentials, Professions & Parentage Rules

Pakistani digital invitations frequently feature professional credentials and respectful lineage identifiers for both the groom and bride.

### 4.1 Fields Specification & Data Keys
1. **Groom Profession / Title (`groomOccupation`, `groomOccupationUrdu`)**:
   - Optional credential displayed beneath the Groom's name (e.g., *"Software Architect & Entrepreneur"*, *"Doctor of Medicine"*, *"Civil Engineer"*).
2. **Bride Profession / Title (`brideOccupation`, `brideOccupationUrdu`)**:
   - Optional credential displayed beneath the Bride's name (e.g., *"Doctor of Medicine (M.D)"*, *"Lecturer"*, *"Graphic Designer"*).
3. **Secondary Parents / In-Laws (`otherParents` / `brideParents` / `groomParents`)**:
   - **For Groom's Card**: Bride's Parents line (e.g., *"Mr. & Mrs. Kamran Akhtar"*). Displayed under the Bride's name as:
     - English: `"Daughter of Mr. & Mrs. Kamran Akhtar"`
     - Urdu: `"دختر جناب و محترمہ کامران اختر"`
   - **For Bride's Card**: Groom's Parents line (e.g., *"Mr. & Mrs. Tariq Mahmood"*). Displayed under the Groom's name as:
     - English: `"Son of Mr. & Mrs. Tariq Mahmood"`
     - Urdu: `"فرزند جناب و محترمہ طارق محمود"`

### 4.2 Mandatory "Remove (✕)" and Restore in Order Form
- In `order.html`, all 3 credential fields (`#c_other_parents`, `#c_groom_occupation`, `#c_bride_occupation`) must provide an inline `[✕ Remove]` button (`#btnRemoveOtherParents`, `#btnRemoveGroomOcc`, `#btnRemoveBrideOcc`).
- Clicking `✕ Remove` hides the input and clears its value.
- An intuitive `+ Add ...` restore button must be displayed when a field is removed.
- **Theme Rendering Rule**: If any credential field is empty or undefined, the theme **must cleanly omit the badge/line** without rendering empty boxes, broken borders, or duplicate parent rows.

---

## 5. Resilient Payload Decoding & Data Contract

Dynamic invitations encode wedding details into URL parameters (`?invite=...` or `?d=...`). 

### 5.1 Resilient Decoder Specification
All themes must implement dual-layer decoding to gracefully handle Base64, raw URL-encoded JSON, and direct JSON:
```javascript
function decodeWeddingData(rawInput) {
  if (!rawInput) return null;
  if (typeof rawInput === "object") return rawInput;
  const cleaned = rawInput.trim();

  // 1. Try URL-encoded JSON
  if (cleaned.startsWith("%7B") || cleaned.startsWith("{")) {
    try {
      return JSON.parse(decodeURIComponent(cleaned));
    } catch (e) {}
  }

  // 2. Try Base64 UTF-8 decoding
  try {
    const binary = atob(cleaned);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const decodedText = new TextDecoder("utf-8").decode(bytes);
    return JSON.parse(decodedText);
  } catch (e) {}

  // 3. Fallback standard JSON parse
  try {
    return JSON.parse(decodeURIComponent(escape(atob(cleaned))));
  } catch (e) {}

  return null;
}
```

### 5.2 Bidirectional Event Normalization
Pay payloads may provide events either as an `eventsList: [...]` array or as an `events: { mehndi, baraat, walima }` dictionary. Themes must normalize both formats upon config resolution:
```javascript
function normalizeEventsData(cfg) {
  if (!cfg) return;
  if (!cfg.events) cfg.events = {};

  if (Array.isArray(cfg.eventsList)) {
    cfg.eventsList.forEach(ev => {
      const k = (ev.type || ev.key || "").toLowerCase().replace("barat", "baraat");
      if (k && !cfg.events[k]) cfg.events[k] = ev;
    });
  }

  // Mirror barat <-> baraat keys
  if (cfg.events.barat && !cfg.events.baraat) cfg.events.baraat = cfg.events.barat;
  if (cfg.events.baraat && !cfg.events.barat) cfg.events.barat = cfg.events.baraat;

  // Safe navigation fallback in date formatters
  // getEventDateFormatted must never throw TypeError if a key is absent
}
```

---

## 6. Background Audio & Media Lifecycle Rules

Background music elevates luxury, but rogue audio creates severe user annoyance. All themes must adhere to strict audio lifecycle controls:

### 6.1 Audio DOM Element & Toggle Button
- Every theme must include a semantic `<audio id="bgAudio" preload="auto" loop>` element.
- Audio source paths must use relative URLs (e.g. `assets/music.mp3`, never absolute local paths).
- A high-contrast, accessible toggle button (`#musicToggle` / `#bgmToggle`) with `aria-label` must be positioned in the header/top navigation.

### 6.2 Gesture-Driven Playback
- Audio must only play on explicit user interaction:
  - Tapping the wax seal or unrolling the invitation.
  - Tapping "Open Invitation".
  - Clicking the music toggle button.

### 6.3 Mandatory Background Pause (Tab Switch / Blur)
When a guest leaves the tab, minimizes the browser, or switches apps, audio **must immediately pause**:
```javascript
let wasPlayingBeforeHidden = false;

document.addEventListener("visibilitychange", () => {
  const audio = document.querySelector("audio");
  if (!audio) return;
  if (document.hidden) {
    if (!audio.paused) {
      audio.pause();
      wasPlayingBeforeHidden = true;
    }
  } else {
    // Only resume if it was actively playing before leaving
    if (wasPlayingBeforeHidden) {
      audio.play().catch(() => {});
      wasPlayingBeforeHidden = false;
    }
  }
});

window.addEventListener("pagehide", () => {
  const audio = document.querySelector("audio");
  if (audio && !audio.paused) audio.pause();
});

window.addEventListener("blur", () => {
  const audio = document.querySelector("audio");
  if (audio && !audio.paused) {
    audio.pause();
    wasPlayingBeforeHidden = true;
  }
});
```

---

## 7. Wax Seal, Cover & Deep Link UX Standards

Themes featuring interactive envelopes, wax seals, or velvet covers (e.g. *Burgundy Romance*, *Royal Grace*, *Mughal Theme*) must adhere to the following interaction rules:

1. **Animated Tap Hint**: The cover must feature an animated floating pulse/finger hint (`.tap-hint` / `.wei-tap-hint`) inviting the guest to open.
2. **Whole-Cover Interaction**: Tapping anywhere on the envelope cover or wax seal must unseal the invitation smoothly. Pointer events must never trap or block language toggles once unsealed.
3. **Instant Deep-Link Unseal**: If the URL contains an event parameter or deep link (e.g. `?card=walima` or `?event=baraat`), the theme must **bypass or automatically unseal** the envelope so the guest lands directly on the relevant ceremony information without redundant friction.

---

## 8. Sub-Schedules, Meal Types & Timing Rules

Pakistani weddings feature specific ceremonies with strict timing workflows. All themes and order forms must adhere to the following rules:

### 8.1 Chronological Order
All sub-events inside an event schedule must be chronologically sorted by time:
- For example on Barat:
  1. **Sehra Bandi** (سہرا بندی)
  2. **Departure of Barat** (روانگیِ بارات)
  3. **Arrival of Barat & Reception** (آمدِ بارات و استقبال)
  4. **Sacred Nikkah** (مسنون نکاح)
  5. **Dinner / Lunch** (پرتکلف عشائیہ / ظہرانہ)
  6. **Rukhsati** (دعاؤں کے سائے میں رخصتی)
  7. **Dua & Concluding Blessings** (اختتامی دعا)

### 8.2 Meal Type & Time Hierarchy
- **Meal Type Selection** (`Dinner` vs `Lunch` vs `Hi-Tea` vs `None`) must be placed at the **top** of the meal section.
- **Meal Time** must always be placed **above Rukhsati** (Dinner/Lunch always happens before Rukhsati).
- **Time Suggestions Auto-Fill**:
  - If **Lunch** is selected: Suggest times between **1:00 PM and 4:00 PM**.
  - If **Dinner** is selected: Suggest times between **6:00 PM and 10:30 PM**.

### 8.3 Mandatory Google Maps Links
- Physical venue addresses must always include a verified Google Maps URL.
- The theme must provide a prominent, styled `📍 View in Google Maps / گوگل میپ میں دیکھیں` button with `target="_blank"` and `rel="noopener noreferrer"`.

---

## 9. Wedding Taglines & Badges

All themes must render optional wedding taglines prominently on the event cards or hero section.

### 9.1 Standard Tagline Suggestions
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

### 9.2 Theme Styling Standard
Tagline badges must be styled as an ornate pill with:
- Subdued thematic background gradient (gold/amber tint or theme accent).
- Dashed or hairline border.
- Centered calligraphy in Urdu (`font-size: 15–16px`) and italic serif in English (`font-size: 13–14px`).

---

## 10. Cloudflare Edge Routing (`_worker.js`)

`_worker.js` intercepts requests to serve themes and customized Open Graph tags:
1. **Internal Rewrite**:
   Paths like `/{couple-slug}/{event-variant}` are mapped directly to the appropriate theme HTML file (`/royal-grace`, `/burgundy-romance`, `/shahi-farman`, `/noor-e-nikkah`, or `/index.html`) using internal `env.ASSETS.fetch` without redirecting the browser.
2. **Dynamic Social Crawler Previews**:
   - `og:title`: `${couple} — ${eventTitle}` (e.g. *Zayan & Rania — Walima Reception* or *Zayan & Rania — Baraat & Rukhsati Ceremony*).
   - `og:description`: Tailored to that specific ceremony.
   - `og:image`: High-resolution theme poster matching the chosen aesthetic.

---

## 11. Brand Integrity & Showcase Attribution

Every theme must include the official brand footer:
```html
<div class="brand-footer-credit">
  <a href="/about" target="_blank" rel="noopener">✦ Crafted by E-dawatnama.com ✦</a>
</div>
```
- Clicking this footer opens the E-DawatNama about/showcase page (`/about`).
- The link must never break the visual immersion of the wedding card.
