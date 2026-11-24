/**
 * E-Dawatnama Cloudflare Pages Worker (Advanced Mode)
 * Dynamically rewrites Open Graph (OG) metadata, Twitter card tags, and page title
 * for social crawlers (Instagram, WhatsApp, Facebook, iMessage, Twitter/X)
 * so each shared link displays the exact couple names, theme graphics, or branding!
 */

const THEME_IMAGES = {
  emerald: "https://e-dawatnama.com/assets/baraat-scene.jpg",
  ruby: "https://e-dawatnama.com/assets/romantic-baraat.jpg",
  sapphire: "https://e-dawatnama.com/assets/celestial-baraat.jpg",
  plum: "https://e-dawatnama.com/assets/blossom-baraat.jpg",
  obsidian: "https://e-dawatnama.com/assets/obsidian-baraat.jpg",
  marble: "https://e-dawatnama.com/assets/marble-baraat.jpg",
  lilac: "https://e-dawatnama.com/assets/lilac-baraat.jpg",
  farman: "https://e-dawatnama.com/assets/obsidian-baraat.jpg",
  burgundy: "https://e-dawatnama.com/assets/burgundy-arch-swans.jpg",
  maroon: "https://e-dawatnama.com/assets/maroon-hero-poster.jpg",
  "maroon-romance": "https://e-dawatnama.com/assets/maroon-hero-poster.jpg",
  ivory: "https://e-dawatnama.com/assets/noor-nikkah-hero.jpg",
  "royal-grace": "https://e-dawatnama.com/assets/royal-grace-welcome-bg.jpg",
  grace: "https://e-dawatnama.com/assets/royal-grace-welcome-bg.jpg",
  gulistan: "https://e-dawatnama.com/assets/gulistan/beyond.webp",
  "rose-garden": "https://e-dawatnama.com/assets/gulistan/beyond.webp"
};

const DEFAULT_BRAND = {
  title: "E-Dawatnama — Royal Digital Wedding Invitations",
  desc: "Pakistan's Premier Interactive Digital Wedding Invitations by Elitara. Bespoke Mughal & modern royal themes with animated scenes, countdowns, venue map & dynamic RSVP.",
  image: "https://e-dawatnama.com/assets/baraat-scene.jpg"
};

function capitalizeWord(w) {
  if (!w) return "";
  return w.charAt(0).toUpperCase() + w.slice(1);
}

function formatName(str) {
  if (!str) return "";
  return str
    .split("-")
    .map(capitalizeWord)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function resolveMetadata(url) {
  const path = url.pathname;
  const pathDecoded = decodeURIComponent(path);
  const pathLower = pathDecoded.toLowerCase();
  const themeParam = (url.searchParams.get("theme") || "").toLowerCase().trim();
  const themeImg = THEME_IMAGES[themeParam] || THEME_IMAGES.emerald;

  // 0. PRIORITY CHECK: Dynamic Base64 Wedding Payload (?invite= or ?d=)
  const invitePayload = url.searchParams.get("invite") || url.searchParams.get("d");
  if (invitePayload) {
    try {
      const raw = atob(invitePayload);
      let data = null;
      try {
        data = JSON.parse(decodeURIComponent(raw));
      } catch (e1) {
        try {
          data = JSON.parse(raw);
        } catch (e2) {
          try {
            if (typeof unescape === "function") data = JSON.parse(unescape(raw));
          } catch (e3) {}
        }
      }

      if (data && (data.groom || data.bride)) {
        const isBride = data.cardSide === "bride" || url.searchParams.get("side") === "bride";
        const g = (data.groom || "").trim();
        const b = (data.bride || "").trim();
        const couple = isBride && b ? `${b} with ${g}` : `${g} with ${b}`;
        const cardTheme = (themeParam || data.theme || (pathLower.includes("burgundy") ? "burgundy" : "") || "").toLowerCase();

        const segments = pathDecoded.split("/").filter(Boolean);
        let eventVariant = (url.searchParams.get("card") || url.searchParams.get("event") || "").toLowerCase().trim();
        if (!eventVariant && segments.length >= 2) {
          eventVariant = segments[segments.length - 1].toLowerCase().replace(/\.(html|php)$/i, "");
        }

        let eventTypeTitle = "";
        if (eventVariant === "walima") {
          eventTypeTitle = "Walima Reception";
        } else if (eventVariant === "barat" || eventVariant === "baraat") {
          eventTypeTitle = isBride ? "Baraat & Rukhsati Ceremony" : "Baraat Ceremony";
        } else if (eventVariant === "mehndi") {
          eventTypeTitle = "Mehndi Ceremony";
        } else if (eventVariant === "mehndi-barat" || eventVariant === "mehndi-baraat") {
          eventTypeTitle = isBride ? "Baraat & Mehndi Celebrations" : "Mehndi & Baraat Celebrations";
        } else if (eventVariant === "barat-walima" || eventVariant === "baraat-walima") {
          eventTypeTitle = "Baraat & Walima Celebrations";
        } else if (eventVariant === "mehndi-walima") {
          eventTypeTitle = "Mehndi & Walima Celebrations";
        } else if (eventVariant === "all" || eventVariant === "mehndi-barat-walima") {
          eventTypeTitle = "Wedding Celebrations";
        }

        if (!eventTypeTitle) {
          const ev = data.events || {};
          const hasMehndi = ev.mehndi && (ev.mehndi.displayDate || ev.mehndi.dateTime);
          const hasBarat = (ev.baraat || ev.barat) && ((ev.baraat && (ev.baraat.displayDate || ev.baraat.dateTime)) || (ev.barat && (ev.barat.displayDate || ev.barat.dateTime)));
          const hasWalima = ev.walima && (ev.walima.displayDate || ev.walima.dateTime);

          eventTypeTitle = "Wedding Invitation";
          if (hasMehndi && hasBarat && !hasWalima) {
            eventTypeTitle = isBride ? "Baraat & Mehndi Invitation" : "Mehndi & Baraat Invitation";
          } else if (hasBarat && !hasMehndi && !hasWalima) {
            eventTypeTitle = "Baraat & Rukhsati Invitation";
          } else if (hasWalima && !hasBarat && !hasMehndi) {
            eventTypeTitle = "Walima Reception";
          }
        }

        return {
          title: `${couple} — ${eventTypeTitle}`,
          desc: `With the grace of Allah Almighty, you are cordially invited to celebrate the ${eventTypeTitle} of ${couple}.`,
          image: THEME_IMAGES[cardTheme] || THEME_IMAGES["royal-grace"] || THEME_IMAGES.burgundy || THEME_IMAGES.emerald
        };
      }
    } catch (e) {
      // Ignore parse failure, fall through
    }
  }

  // 1. Explicit /about route
  if (pathLower === "/about" || pathLower === "/about/") {
    return {
      title: "About E-Dawatnama — Royal Digital Wedding Invitations",
      desc: "Experience bespoke digital luxury. Interactive wedding invitations designed with royal Mughal aesthetics, music, and interactive RSVP.",
      image: "https://e-dawatnama.com/assets/baraat-scene.jpg"
    };
  }

  // 2. Admin Studio
  if (pathLower.startsWith("/admin")) {
    return {
      title: "Elitara Admin Studio — E-Dawatnama",
      desc: "Private administration studio for digital wedding invitations.",
      image: "https://e-dawatnama.com/assets/favicon.svg"
    };
  }

  // 3. Client Order Form
  if (pathLower.startsWith("/order") || pathLower.startsWith("/form")) {
    return {
      title: "Create Your Royal Wedding Invitation — E-Dawatnama",
      desc: "Fill out our simple form to design your customized royal digital wedding invitation.",
      image: "https://e-dawatnama.com/assets/baraat-scene.jpg"
    };
  }

  const themeNormalized = (url.searchParams.get("theme") || "").toLowerCase().trim().replace(/[_\s]+/g, "-");
  const templateNormalized = (url.searchParams.get("template") || "").toLowerCase().trim().replace(/[_\s]+/g, "-");
  const pathNormalized = pathLower.replace(/[_\s]+/g, "-");

  // 3a. Royal Grace Theme (Sage Garden Serenity & Pearl Drapes Nikkah)
  if (
    pathNormalized.includes("royal-grace") ||
    pathNormalized.includes("royalgrace") ||
    pathNormalized.includes("grace") ||
    pathNormalized.includes("zayan") ||
    pathNormalized.includes("rania") ||
    pathLower.includes("royal-grace.html") ||
    themeNormalized === "royal-grace" ||
    themeNormalized === "royalgrace" ||
    themeNormalized === "grace" ||
    themeNormalized.includes("royal") ||
    templateNormalized === "royal-grace" ||
    templateNormalized === "royalgrace" ||
    templateNormalized === "grace" ||
    templateNormalized.includes("royal")
  ) {
    return {
      title: "Zayan & Rania — Royal Grace Nikkah & Walima Ceremony",
      desc: "With the grace and blessings of Allah Almighty, you are cordially invited to celebrate the sacred Nikkah and Walima ceremonies of Zayan & Rania.",
      image: THEME_IMAGES["royal-grace"]
    };
  }

  // 3b. Noor-e-Nikkah (Pearl Ivory & Champagne Gold)
  if (
    pathLower.includes("noor-e-nikkah") ||
    pathLower.includes("noor-nikkah") ||
    pathLower.includes("ivory") ||
    themeNormalized === "ivory" ||
    themeNormalized === "nikkah" ||
    themeParam === "ivory" ||
    themeParam === "nikkah"
  ) {
    return {
      title: "Zayan & Rania — Noor-e-Nikkah & Walima Celebration",
      desc: "With the blessings of Allah Almighty, you are cordially invited to celebrate the sacred Nikkah and Walima ceremonies of Zayan & Rania.",
      image: THEME_IMAGES.ivory
    };
  }

  // 3g. Gulistan Theme Demo
  if (
    pathLower === "/gulistan" ||
    pathLower === "/gulistan.html" ||
    pathLower === "/demo-gulistan" ||
    pathLower === "/rose-garden" ||
    pathLower === "/theme/gulistan"
  ) {
    return {
      title: "Hamza & Zoya — Gulistan & Royal Rose Garden Wedding Invitation",
      desc: "Untie the royal silk ribbon to enter Gulistan — an enchanted rose garden digital wedding invitation with 3D flippable luggage tags, wax-sealed letter, and live countdown.",
      image: THEME_IMAGES.gulistan
    };
  }

  // 3e. Maroon Romance Theme Demo
  if (
    pathLower === "/maroon-romance" ||
    pathLower === "/maroon-romance.html" ||
    pathLower === "/maroon" ||
    pathLower === "/demo-maroon"
  ) {
    return {
      title: "Ahmed & Ayesha — Maroon Romance & Royal Wedding Invitation",
      desc: "Experience the bespoke Maroon Romance interactive wedding invitation by E-Dawatnama. Featuring cinematic golden light envelope unsealing, ivory floral archway, and live countdown.",
      image: THEME_IMAGES.maroon || "https://e-dawatnama.com/assets/maroon-hero-poster.jpg"
    };
  }

  // 3c. Burgundy Romance Theme Demo
  if (
    pathLower === "/burgundy-romance" ||
    pathLower === "/burgundy-romance.html" ||
    pathLower.includes("rohan") ||
    pathLower === "/burgundy" ||
    pathLower === "/demo-burgundy"
  ) {
    return {
      title: "Rohan & Zara — Burgundy Romance & Walima Reception",
      desc: "Tap to open the royal velvet wax-seal wedding invitation for the Walima Reception of Rohan & Zara.",
      image: THEME_IMAGES.burgundy
    };
  }



  // 4. Shahi Farman Scroll Invitation
  if (pathLower.includes("shahi-farman") || pathLower.includes("farman") || themeParam === "farman") {
    return {
      title: "Shahi Farman — Royal Mughal Scroll Invitation",
      desc: "Experience the grandeur of an imperial Mughal scroll digital wedding invitation with royal calligraphy, wax seal, and shehnai music.",
      image: THEME_IMAGES.obsidian
    };
  }

  // 5. Usama & Bissal's Original Wedding Invitation Routes
  if (
    pathLower.includes("usama") ||
    pathLower.includes("bissal") ||
    pathLower === "/mehndi-walima" ||
    pathLower === "/walima"
  ) {
    return {
      title: "Syed Usama Irshad with Dr. Bissal Khan — Wedding Invitation",
      desc: "Mr. & Mrs. Irshad Ali cordially request the honour of your gracious presence and prayers to celebrate the wedding ceremonies of their beloved son.",
      image: "https://e-dawatnama.com/assets/baraat-scene.jpg"
    };
  }

  // 6. Ahmed & Ayesha Demo Template
  if (pathLower.includes("ahmed") || pathLower.includes("ayesha") || pathLower === "/demo" || pathLower === "/demo/") {
    return {
      title: "Ahmed & Ayesha — Wedding Invitation",
      desc: "With the grace of Allah Almighty, you are cordially invited to celebrate the wedding ceremonies of Ahmed & Ayesha.",
      image: THEME_IMAGES[themeParam] || THEME_IMAGES.emerald
    };
  }

// 7. (Moved to Rule 0 for priority metadata resolution)

  // 8. Dynamic Couple Slug from URL Path:
  // e.g. /zayan-and-rania/walima, /Hamza-and-Fatima-wedding-invitation, /Ali-and-Sara/barat
  const segments = pathDecoded.split("/").filter(Boolean);
  if (segments.length > 0) {
    let coupleSlug = segments[0]
      .replace(/\.(html|php)$/i, "")
      .replace(/-wedding-invitation$/i, "");
    let eventVariant = segments.length >= 2 ? segments[1].toLowerCase().replace(/\.(html|php)$/i, "") : "";

    let couple = "";
    if (coupleSlug.includes("-and-")) {
      const parts = coupleSlug.split("-and-");
      couple = `${formatName(parts[0])} & ${formatName(parts[1])}`;
    } else if (coupleSlug.includes("-with-")) {
      const parts = coupleSlug.split("-with-");
      couple = `${formatName(parts[0])} with ${formatName(parts[1])}`;
    } else if (coupleSlug.includes("-&-")) {
      const parts = coupleSlug.split("-&-");
      couple = `${formatName(parts[0])} & ${formatName(parts[1])}`;
    }

    if (couple) {
      let eventTypeTitle = "Wedding Invitation";
      if (eventVariant === "walima") eventTypeTitle = "Walima Reception";
      else if (eventVariant === "barat" || eventVariant === "baraat") eventTypeTitle = "Baraat Ceremony";
      else if (eventVariant === "mehndi") eventTypeTitle = "Mehndi Ceremony";
      else if (eventVariant === "mehndi-barat" || eventVariant === "mehndi-baraat") eventTypeTitle = "Mehndi & Baraat Celebrations";
      else if (eventVariant === "barat-walima" || eventVariant === "baraat-walima") eventTypeTitle = "Baraat & Walima Celebrations";
      else if (eventVariant === "mehndi-walima") eventTypeTitle = "Mehndi & Walima Celebrations";
      else if (eventVariant === "all") eventTypeTitle = "Wedding Celebrations";

      return {
        title: `${couple} — ${eventTypeTitle}`,
        desc: `With the grace of Allah Almighty, you are cordially invited to celebrate the ${eventTypeTitle} of ${couple}.`,
        image: themeImg
      };
    }
  }

  // 9. Root Homepage (e-dawatnama.com / e-dawatnama.com/)
  return DEFAULT_BRAND;
}

const RESERVED_FIRST_SEGMENTS = new Set([
  "about", "admin", "mughal-card", "order", "form", "demos", "samples", "templates",
  "royal-grace", "demo-royal-grace", "demo-grace", "grace", "nikkah-royal-grace",
  "burgundy-romance", "burgundy", "demo-burgundy", "velvet-romance", "theme",
  "noor-e-nikkah", "noor-nikkah", "ivory-gold", "ivory",
  "shahi-farman", "farman", "gulistan", "demo-gulistan", "rose-garden", "assets", "api", "favicon.ico", "robots.txt", "sitemap.xml"
]);

function getThemeAssetPath(themeKey) {
  const t = (themeKey || "").toLowerCase().trim();
  if (t === "gulistan" || t === "rose-garden" || t === "garden") return "/gulistan";
  if (t === "royal-grace" || t === "grace") return "/royal-grace";
  if (t === "maroon" || t === "maroon-romance") return "/maroon-romance";
  if (t === "burgundy" || t === "burgundy-romance" || t === "velvet-romance") return "/burgundy-romance";
  if (t === "noor-e-nikkah" || t === "noor-nikkah" || t === "ivory" || t === "ivory-gold") return "/noor-e-nikkah";
  if (t === "shahi-farman" || t === "farman") return "/shahi-farman";
  return "/mughal-card";
}

function extractThemeFromRequest(url) {
  const queryTheme = (url.searchParams.get("theme") || "").toLowerCase().trim();
  if (queryTheme) return queryTheme;

  const payload = url.searchParams.get("invite") || url.searchParams.get("d");
  if (payload) {
    try {
      const raw = atob(payload);
      let data = null;
      try { data = JSON.parse(decodeURIComponent(raw)); }
      catch (e1) {
        try { data = JSON.parse(raw); }
        catch (e2) {}
      }
      if (data && data.theme) return (data.theme || "").toLowerCase().trim();
    } catch (e) {}
  }
  return "";
}

function applyMetaRewriter(response, meta, urlHref) {
  const title = (meta && meta.title) || DEFAULT_BRAND.title;
  const desc = (meta && meta.desc) || DEFAULT_BRAND.desc;
  const image = (meta && meta.image) || DEFAULT_BRAND.image;

  class MetaSetter {
    constructor(content) {
      this.content = content;
    }
    element(el) {
      if (this.content) el.setAttribute("content", this.content);
    }
  }

  class TitleSetter {
    constructor(text) {
      this.text = text;
    }
    element(el) {
      if (this.text) el.setInnerContent(this.text);
    }
  }

  const rewriter = new HTMLRewriter()
    .on("title", new TitleSetter(title))
    .on('meta[property="og:title"]', new MetaSetter(title))
    .on('meta[name="twitter:title"]', new MetaSetter(title))
    .on('meta[property="og:description"]', new MetaSetter(desc))
    .on('meta[name="twitter:description"]', new MetaSetter(desc))
    .on('meta[property="og:image"]', new MetaSetter(image))
    .on('meta[name="twitter:image"]', new MetaSetter(image))
    .on('meta[property="og:url"]', new MetaSetter(urlHref));

  return rewriter.transform(response);
}

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const path = url.pathname;
      const lower = path.toLowerCase().replace(/\/$/, "");

      // 1. Bypass static media and code assets directly to edge storage
      const isStaticAsset = /\.(jpg|jpeg|png|gif|svg|ico|webp|css|js|woff2?|ttf|eot|json|map|txt|xml|mp4|mp3)$/i.test(path);
      if (isStaticAsset) {
        return env.ASSETS.fetch(request);
      }

      // 1b. Direct asset fetch for standalone pages and theme aliases
      let targetAsset = "";
      if (lower === "/gulistan" || lower === "/demo-gulistan" || lower === "/rose-garden" || lower === "/theme/gulistan") {
        targetAsset = "/gulistan";
      } else if (lower === "/royal-grace" || lower === "/demo-royal-grace" || lower === "/demo-grace" || lower === "/grace" || lower === "/nikkah-royal-grace" || lower === "/zayan-and-rania-nikkah" || lower === "/zayan-&-rania-nikkah") {
        targetAsset = "/royal-grace";
      } else if (lower === "/maroon-romance" || lower === "/maroon" || lower === "/demo-maroon" || lower === "/theme/maroon-romance" || lower === "/theme/maroon") {
        targetAsset = "/maroon-romance";
      } else if (lower === "/burgundy-romance" || lower === "/burgundy" || lower === "/demo-burgundy" || lower === "/velvet-romance" || lower === "/theme/burgundy-romance" || lower === "/theme/burgundy") {
        targetAsset = "/burgundy-romance";
      } else if (lower === "/noor-e-nikkah" || lower === "/noor-nikkah" || lower === "/ivory-gold" || lower === "/ivory") {
        targetAsset = "/noor-e-nikkah";
      } else if (lower === "/shahi-farman" || lower === "/farman") {
        targetAsset = "/shahi-farman";
      } else if (
        lower.includes("usama") ||
        lower.includes("bissal") ||
        lower === "/mehndi-walima" ||
        lower === "/walima" ||
        lower === "/mehndi" ||
        lower === "/baraat"
      ) {
        targetAsset = "/usama-and-bissal";
      } else if (
        lower.includes("ahmed") ||
        lower === "/demo" ||
        lower === "/demo-template"
      ) {
        targetAsset = "/ahmed-and-ayesha";
      } else if (lower === "/demos" || lower === "/samples" || lower === "/templates") {
        targetAsset = "/demos";
      } else if (lower === "/about") {
        targetAsset = "/about";
      } else if (
        (lower === "" || lower === "/index" || lower === "/index.html") &&
        !url.searchParams.get("invite") &&
        !url.searchParams.get("d") &&
        !url.searchParams.get("theme") &&
        !url.searchParams.get("template") &&
        !url.searchParams.get("groom") &&
        !url.searchParams.get("bride") &&
        !url.searchParams.get("card") &&
        !url.searchParams.get("event")
      ) {
        targetAsset = "/about";
      } else if (lower === "/order" || lower === "/form") {
        targetAsset = "/order";
      } else if (lower === "/admin") {
        targetAsset = "/admin";
      } else {
        // 1c. Dynamic Multi-Event Couple Paths (e.g. /{couple}/{event} or /{couple})
        const pathSegments = decodeURIComponent(url.pathname).split("/").filter(Boolean);
        if (pathSegments.length >= 1 && !RESERVED_FIRST_SEGMENTS.has(pathSegments[0].toLowerCase())) {
          const themeKey = extractThemeFromRequest(url);
          targetAsset = getThemeAssetPath(themeKey);
        }
      }

      let response;
      if (targetAsset) {
        const assetUrl = new URL(request.url);
        assetUrl.pathname = targetAsset;
        response = await env.ASSETS.fetch(new Request(assetUrl.toString(), request));
      } else {
        response = await env.ASSETS.fetch(request);
      }

      // If not HTML response, return as-is
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("text/html")) {
        return response;
      }

      // 3. Resolve dynamic metadata for social crawlers
      const meta = resolveMetadata(url) || DEFAULT_BRAND;
      return applyMetaRewriter(response, meta, url.href);
    } catch (err) {
      return env.ASSETS.fetch(request);
    }
  }
};