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
  ivory: "https://e-dawatnama.com/assets/noor-nikkah-hero.jpg",
  "royal-grace": "https://e-dawatnama.com/assets/royal-grace-welcome-bg.jpg",
  grace: "https://e-dawatnama.com/assets/royal-grace-welcome-bg.jpg"
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

        const ev = data.events || {};
        const hasMehndi = ev.mehndi && (ev.mehndi.displayDate || ev.mehndi.dateTime);
        const hasBarat = ev.baraat && (ev.baraat.displayDate || ev.baraat.dateTime);
        const hasWalima = ev.walima && (ev.walima.displayDate || ev.walima.dateTime);

        let eventTypeTitle = "Wedding Invitation";
        if (hasMehndi && hasBarat && !hasWalima) {
          eventTypeTitle = isBride ? "Baraat & Mehndi Invitation" : "Mehndi & Baraat Invitation";
        } else if (hasBarat && !hasMehndi && !hasWalima) {
          eventTypeTitle = "Baraat & Rukhsati Invitation";
        } else if (hasWalima && !hasBarat && !hasMehndi) {
          eventTypeTitle = "Walima Reception";
        }

        return {
          title: `${couple} — ${eventTypeTitle}`,
          desc: `With the grace of Allah Almighty, you are cordially invited to celebrate the ${eventTypeTitle} of ${couple}.`,
          image: THEME_IMAGES[cardTheme] || THEME_IMAGES.burgundy || THEME_IMAGES.emerald
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

  // 3a. Royal Grace Theme (Sage Garden Serenity & Pearl Drapes Nikkah)
  if (
    pathLower.includes("royal-grace") ||
    pathLower.includes("grace") ||
    pathLower.includes("royal-grace.html") ||
    themeParam === "royal-grace" ||
    themeParam === "grace"
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
    pathLower.includes("zayan") ||
    pathLower.includes("rania") ||
    themeParam === "ivory" ||
    themeParam === "nikkah"
  ) {
    return {
      title: "Zayan & Rania — Noor-e-Nikkah & Walima Celebration",
      desc: "With the blessings of Allah Almighty, you are cordially invited to celebrate the sacred Nikkah and Walima ceremonies of Zayan & Rania.",
      image: THEME_IMAGES.ivory
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
  // e.g. /Hamza-and-Fatima-wedding-invitation, /Zain-with-Amina-wedding-invitation, /Ali-and-Sara
  const segments = pathDecoded.split("/").filter(Boolean);
  if (segments.length > 0) {
    const slug = segments[segments.length - 1]
      .replace(/\.(html|php)$/i, "")
      .replace(/-wedding-invitation$/i, "");

    let couple = "";
    if (slug.includes("-and-")) {
      const parts = slug.split("-and-");
      couple = `${formatName(parts[0])} & ${formatName(parts[1])}`;
    } else if (slug.includes("-with-")) {
      const parts = slug.split("-with-");
      couple = `${formatName(parts[0])} with ${formatName(parts[1])}`;
    } else if (slug.includes("-&-")) {
      const parts = slug.split("-&-");
      couple = `${formatName(parts[0])} & ${formatName(parts[1])}`;
    }

    if (couple) {
      return {
        title: `${couple} — Wedding Invitation`,
        desc: `With the grace of Allah Almighty, you are cordially invited to celebrate the wedding ceremonies of ${couple}.`,
        image: themeImg
      };
    }
  }

  // 9. Root Homepage (e-dawatnama.com / e-dawatnama.com/)
  return DEFAULT_BRAND;
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

      // 1b. Direct asset fetch for standalone themes
      if (lower === "/royal-grace" || lower === "/demo-royal-grace" || lower === "/demo-grace" || lower === "/grace" || lower === "/royal-grace.html" || lower === "/nikkah-royal-grace" || lower === "/zayan-and-rania-nikkah" || lower === "/zayan-&-rania-nikkah") {
        const assetUrl = new URL(request.url);
        assetUrl.pathname = "/royal-grace.html";
        return env.ASSETS.fetch(new Request(assetUrl.toString(), request));
      }
      if (lower === "/burgundy-romance" || lower === "/burgundy" || lower === "/demo-burgundy" || lower === "/velvet-romance" || lower === "/burgundy-romance.html" || lower === "/theme/burgundy-romance" || lower === "/theme/burgundy") {
        const assetUrl = new URL(request.url);
        assetUrl.pathname = "/burgundy-romance.html";
        return env.ASSETS.fetch(new Request(assetUrl.toString(), request));
      }
      if (lower === "/noor-e-nikkah" || lower === "/noor-nikkah" || lower === "/ivory-gold" || lower === "/ivory" || lower === "/noor-e-nikkah.html") {
        const assetUrl = new URL(request.url);
        assetUrl.pathname = "/noor-e-nikkah.html";
        return env.ASSETS.fetch(new Request(assetUrl.toString(), request));
      }
      if (lower === "/shahi-farman" || lower === "/farman" || lower === "/shahi-farman.html") {
        const assetUrl = new URL(request.url);
        assetUrl.pathname = "/shahi-farman.html";
        return env.ASSETS.fetch(new Request(assetUrl.toString(), request));
      }
      if (lower === "/demos" || lower === "/samples" || lower === "/templates" || lower === "/demos.html") {
        const assetUrl = new URL(request.url);
        assetUrl.pathname = "/demos.html";
        return env.ASSETS.fetch(new Request(assetUrl.toString(), request));
      }
      if (lower === "/about" || lower === "/about.html") {
        const assetUrl = new URL(request.url);
        assetUrl.pathname = "/about.html";
        return env.ASSETS.fetch(new Request(assetUrl.toString(), request));
      }
      if (lower === "/order" || lower === "/form" || lower === "/order.html") {
        const assetUrl = new URL(request.url);
        assetUrl.pathname = "/order.html";
        return env.ASSETS.fetch(new Request(assetUrl.toString(), request));
      }
      if (lower === "/admin" || lower === "/admin.html") {
        const assetUrl = new URL(request.url);
        assetUrl.pathname = "/admin.html";
        return env.ASSETS.fetch(new Request(assetUrl.toString(), request));
      }

      // 2. Fetch base response from ASSETS
      const response = await env.ASSETS.fetch(request);

      // If not HTML response, return as-is
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("text/html")) {
        return response;
      }

      // 3. Resolve dynamic metadata for social crawlers
      const meta = resolveMetadata(url) || DEFAULT_BRAND;
      const title = meta.title || DEFAULT_BRAND.title;
      const desc = meta.desc || DEFAULT_BRAND.desc;
      const image = meta.image || DEFAULT_BRAND.image;

      // 4. Transform HTML stream using Cloudflare HTMLRewriter
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
        .on('meta[property="og:url"]', new MetaSetter(url.href));

      return rewriter.transform(response);
    } catch (err) {
      return env.ASSETS.fetch(request);
    }
  }
};