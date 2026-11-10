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
  image: "https://e-dawatnama.com/assets/offer_post_portrait.png"
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

  // 1. Explicit /about route
  if (pathLower === "/about" || pathLower === "/about/") {
    return {
      title: "About E-Dawatnama — Royal Digital Wedding Invitations",
      desc: "Experience bespoke digital luxury. Interactive wedding invitations designed with royal Mughal aesthetics, music, and interactive RSVP.",
      image: "https://e-dawatnama.com/assets/offer_post_portrait.png"
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
      image: "https://e-dawatnama.com/assets/offer_post_portrait.png"
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

  // 3c. Burgundy Romance Theme
  if (
    pathLower.includes("burgundy") ||
    pathLower.includes("rohan") ||
    pathLower.includes("daniyal") ||
    themeParam === "burgundy"
  ) {
    return {
      title: "Rohan & Zara — Burgundy Romance & Walima Reception",
      desc: "Tap to open the royal velvet wax-seal wedding invitation for the Walima Reception of Rohan & Zara.",
      image: THEME_IMAGES.burgundy
    };
  }

  // 3d. Royal Grace Theme (Sage Garden Serenity & Pearl Drapes Nikkah)
  if (
    pathLower.includes("royal-grace") ||
    pathLower.includes("grace") ||
    pathLower.includes("zayan-and-rania-nikkah") ||
    themeParam === "royal-grace" ||
    themeParam === "grace"
  ) {
    return {
      title: "Zayan & Rania — Royal Grace Nikkah & Walima Ceremony",
      desc: "With the grace and blessings of Allah Almighty, you are cordially invited to celebrate the sacred Nikkah and Walima ceremonies of Zayan & Rania.",
      image: THEME_IMAGES["royal-grace"]
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

  // 7. Check for ?invite= Base64 data payload
  const invitePayload = url.searchParams.get("invite");
  if (invitePayload) {
    try {
      const decodedStr = atob(invitePayload);
      const data = JSON.parse(decodedStr);
      if (data && (data.groom || data.bride)) {
        const g = (data.groom || "").trim();
        const b = (data.bride || "").trim();
        const couple = data.cardSide === "bride" && b ? `${b} with ${g}` : `${g} with ${b}`;
        const cardTheme = (themeParam || data.theme || "").toLowerCase();
        return {
          title: `${couple} — Wedding Invitation`,
          desc: `With the grace of Allah Almighty, you are cordially invited to celebrate the wedding ceremonies of ${couple}.`,
          image: THEME_IMAGES[cardTheme] || THEME_IMAGES.emerald
        };
      }
    } catch (e) {
      // Ignore parse failure, fall through
    }
  }

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
    const url = new URL(request.url);
    const path = url.pathname;

    // 1. Bypass assets directly to static storage
    const isStaticAsset = /\.(jpg|jpeg|png|gif|svg|ico|webp|css|js|woff2?|ttf|eot|json|map|txt|xml)$/i.test(path);
    if (isStaticAsset) {
      return env.ASSETS.fetch(request);
    }

    // 2. Fetch base response from ASSETS
    const response = await env.ASSETS.fetch(request);

    // If not HTML response, return as-is
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return response;
    }

    // 3. Resolve dynamic metadata for this specific request
    const meta = resolveMetadata(url);

    // 4. Transform HTML stream using Cloudflare HTMLRewriter
    class MetaSetter {
      constructor(content) {
        this.content = content;
      }
      element(el) {
        el.setAttribute("content", this.content);
      }
    }

    class TitleSetter {
      constructor(text) {
        this.text = text;
      }
      element(el) {
        el.setInnerContent(this.text);
      }
    }

    const rewriter = new HTMLRewriter()
      .on("title", new TitleSetter(meta.title))
      .on('meta[property="og:title"]', new MetaSetter(meta.title))
      .on('meta[name="twitter:title"]', new MetaSetter(meta.title))
      .on('meta[property="og:description"]', new MetaSetter(meta.desc))
      .on('meta[name="twitter:description"]', new MetaSetter(meta.desc))
      .on('meta[property="og:image"]', new MetaSetter(meta.image))
      .on('meta[name="twitter:image"]', new MetaSetter(meta.image))
      .on('meta[property="og:url"]', new MetaSetter(url.href));

    return rewriter.transform(response);
  }
};
