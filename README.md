# Royal Mughal Wedding Invitation

A digital wedding invitation website crafted for the celebration of **Syed Usama Irshad** & **Dr. Bissal Khan**, hosted by **Irshad Ali**.

Designed in a **Royal Mughal** aesthetic with deep emerald green, antique gold filigree, warm ivory parchment, and authentic bilingual (English & Urdu Nastaliq) support.

---

## ✦ Table of Contents

1. [Features](#features)
2. [Project Structure](#project-structure)
3. [Invitation Variants & Deep Links](#invitation-variants--deep-links)
4. [Editing Wedding Details](#editing-wedding-details)
5. [Adding Background Music](#adding-background-music)
6. [Local Testing](#local-testing)
7. [Netlify Deployment](#netlify-deployment)
8. [Details Required from Owner](#details-required-from-owner)

---

## ✦ Features

- **Royal Envelope Opening**: Interactive 3D wax-seal envelope stamped with the couple's **UI** monogram. Clicking or tapping the seal smoothly opens the envelope flap and presents the invitation.
- **Bilingual Interface**: One-click toggle between **English** and **Urdu**. In Urdu mode, the entire interface renders in authentic right-to-left (RTL) **Noto Nastaliq Urdu** calligraphy.
- **Three Shareable Card Variants**: Filter visible ceremonies based on who you are inviting using clean URL query parameters (`?card=...`).
- **Event Deep Linking & Browser History**: Direct URLs (e.g. `?card=all&event=baraat`), browser back/forward navigation, and page refreshes work seamlessly.
- **Pakistan Timezone-Aware Countdowns**: Live countdowns calculated against Pakistan Standard Time (`Asia/Karachi`, `UTC+05:00`). Missing dates, invalid values, and completed events are handled gracefully without `NaN`.
- **Zero Fabrication**: All unconfirmed event dates, timings, venues, maps, and contacts are maintained as clean placeholders until supplied by the family.
- **Safe Audio Player**: Optional music player is OFF by default (never autoplays). If the audio file hasn't been added yet, it informs the user politely.
- **Mobile-First & Accessible**: Tested across mobile, tablet, and desktop viewports. Respects `prefers-reduced-motion` and keyboard accessibility.

---

## ✦ Project Structure

```text
usama-wedding-invitation/
├── index.html          # Self-contained invitation (HTML, Royal Mughal CSS, Vanilla JS)
├── README.md           # Documentation & instructions
└── assets/
    ├── favicon.svg     # Royal "UI" monogram badge favicon
    └── wedding-music.mp3 # (Optional) background instrumental audio
```

---

## ✦ Invitation Variants & Deep Links

Send customized invitation links to guests depending on which ceremonies they are invited to attend:

| Guest Group | Link | Visible Ceremonies |
| :--- | :--- | :--- |
| **Walima Only** | `https://your-domain.netlify.app/?card=walima` | Walima (`دعوتِ ولیمہ`) |
| **Mehndi + Walima** | `https://your-domain.netlify.app/?card=mehndi-walima` | Mehndi (`تقریبِ مہندی`), Walima (`دعوتِ ولیمہ`) |
| **All Events (Default)** | `https://your-domain.netlify.app/?card=all` | Mehndi, Baraat (`تقریبِ بارات`), Walima |

### Direct Ceremony Deep Links:
Guests can be sent straight to a specific ceremony's itinerary and countdown:
- `?card=all&event=mehndi`
- `?card=all&event=baraat`
- `?card=all&event=walima`
- `?card=mehndi-walima&event=mehndi`
- `?card=mehndi-walima&event=walima`
- `?card=walima&event=walima`

> If a visitor attempts to access a ceremony not included in their card variant (for example, `?card=walima&event=baraat`), the site shows a polite notice and directs them to their invited ceremonies.

---

## ✦ Editing Wedding Details

All configuration is located in `index.html` inside the `WEDDING` object:

```javascript
const WEDDING = {
  groom: "Syed Usama Irshad",
  groomUrdu: "سید اسامہ ارشاد",
  bride: "Dr. Bissal Khan",
  host: "Irshad Ali",
  hostUrdu: "ارشاد علی",
  events: {
    mehndi: {
      dateTime: "2027-01-15T19:00:00+05:00", // ISO 8601 with +05:00 Pakistan offset
      displayDate: "Friday, 15th January 2027",
      displayDateUrdu: "جمعۃ المبارک، ۱۵ جنوری ۲۰۲۷ء",
      displayTime: "7:00 PM Onwards",
      displayTimeUrdu: "شام ۷:۰۰ بجے",
      venue: "Grand Marquee",
      venueUrdu: "دی گرینڈ مارکی",
      address: "Main Boulevard, Lahore",
      addressUrdu: "مین بلیوارڈ، لاہور",
      mapUrl: "https://maps.google.com/?q=...",
      rsvpPhone: "+923001234567"
    },
    baraat: {
      dateTime: "2027-01-16T20:00:00+05:00",
      displayDate: "Saturday, 16th January 2027",
      displayDateUrdu: "ہفتہ، ۱۶ جنوری ۲۰۲۷ء",
      displayTime: "8:00 PM Onwards",
      displayTimeUrdu: "رات ۸:۰۰ بجے",
      venue: "Royal Palm Hall",
      venueUrdu: "رائل پام ہال",
      address: "Canal Road, Lahore",
      addressUrdu: "کینال روڈ، لاہور",
      mapUrl: "https://maps.google.com/?q=...",
      rsvpPhone: "+923001234567"
    },
    walima: {
      dateTime: "2027-01-18T19:30:00+05:00",
      displayDate: "Monday, 18th January 2027",
      displayDateUrdu: "پیر، ۱۸ جنوری ۲۰۲۷ء",
      displayTime: "7:30 PM to 10:30 PM",
      displayTimeUrdu: "شام ۷:۳۰ تا رات ۱۰:۳۰ بجے",
      venue: "PC Hotel Crystal Ballroom",
      venueUrdu: "پی سی ہوٹل، کرسٹل بال روم",
      address: "Mall Road, Lahore",
      addressUrdu: "مال روڈ، لاہور",
      mapUrl: "https://maps.google.com/?q=...",
      rsvpPhone: "+923001234567"
    }
  }
};
```

### Timezone Guidelines:
- Always use the explicit `+05:00` offset in `dateTime` (e.g. `2027-01-15T19:00:00+05:00`).
- This ensures guests opening the invitation from the UK, US, UAE, or Saudi Arabia see the exact countdown remaining until the event in Pakistan time.

---

## ✦ Adding Background Music

To add an ambient shehnai, sitar, or acoustic track:
1. Place your licensed or royalty-free MP3 file inside the `assets/` folder.
2. Name it `wedding-music.mp3` (or update the `<audio src="...">` tag in `index.html`).
3. Commit and push to GitHub. Netlify will deploy automatically.

---

## ✦ Local Testing

1. **Direct file open**: Double-click `index.html` in Chrome, Firefox, Safari, or Edge.
2. **Or run with Python**:
   ```bash
   python -m http.server 8000
   ```
   Open `http://localhost:8000/?card=all` in your browser.

### Test Matrix:
- Open `?card=walima` &rarr; verify only Walima is shown after opening the envelope.
- Open `?card=mehndi-walima` &rarr; verify Mehndi and Walima are visible.
- Open `?card=all` &rarr; verify all three ceremonies (Mehndi, Baraat, Walima) are visible.
- Open `?card=all&event=baraat` &rarr; verify Baraat ceremony details and countdown load immediately.
- Click "اردو / English" toggle on any screen &rarr; verify text and RTL layout update seamlessly without losing position.
- Click "Share Invitation" &rarr; verify link is copied or shared via native dialog.

---

## ✦ Netlify Deployment

The repository is hosted on GitHub:
👉 `https://github.com/UsamaIrshad66666/usama-wedding-invitation`

To deploy with continuous integration:
1. Sign in to [Netlify](https://app.netlify.com/) (using your GitHub account `UsamaIrshad66666`).
2. Click **"Add new site"** &rarr; **"Import an existing project"**.
3. Select **GitHub** and authorize access to `UsamaIrshad66666/usama-wedding-invitation`.
4. Deployment settings:
   - **Branch to deploy**: `main`
   - **Base directory**: *(leave empty)*
   - **Build command**: *(leave empty)*
   - **Publish directory**: `.`
5. Click **"Deploy site"**.
6. Any future commits pushed to the `main` branch will trigger automatic redeployments in seconds.

---

## ✦ Details Required from Owner

The invitation is complete and ready. Once the family finalizes the event particulars, provide the following details to update the placeholders:

| Detail | Mehndi | Baraat | Walima |
| :--- | :--- | :--- | :--- |
| **Event Date** | *TBD* | *TBD* | *TBD* |
| **Start Time / Schedule** | *TBD* | *TBD* | *TBD* |
| **Venue Name** | *TBD* | *TBD* | *TBD* |
| **Full Address** | *TBD* | *TBD* | *TBD* |
| **Google Maps Pin Link** | *TBD* | *TBD* | *TBD* |
| **RSVP WhatsApp Number** | *TBD* | *TBD* | *TBD* |

Also confirm:
- Bride's preferred Urdu spelling if desired (currently preserved in English as **Dr. Bissal Khan**).
- Audio track preference (provide an MP3 file to place in `assets/wedding-music.mp3`).
