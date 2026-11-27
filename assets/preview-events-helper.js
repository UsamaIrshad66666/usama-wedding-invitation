/* ==========================================================================
   E-DawatNama Live Preview Event Adapter (assets/preview-events-helper.js)
   Reads ?events=...&customEvent=...&side=... when exploring demo themes from
   /order so every theme displays ONLY the user's selected event(s) and
   event-accurate invitation wording in English & Urdu.
   ========================================================================== */
(function (global) {
  function getPreviewEventsConfig() {
    var params = new URLSearchParams(window.location.search);
    // Never override a real client invitation payload (?invite= or ?d=)
    if (params.get("invite") || params.get("d")) return null;

    var raw = (params.get("events") || "").trim();
    if (!raw || raw.toLowerCase() === "all") return null;

    var side = (params.get("side") || "").toLowerCase() === "bride" ? "bride" : "groom";
    var isBride = side === "bride";
    var customName = (params.get("customEvent") || "").trim();

    var types = raw
      .split(",")
      .map(function (t) { return t.trim().toLowerCase(); })
      .filter(Boolean);

    if (!types.length) return null;

    var CATALOG = {
      nikkah: {
        key: "nikkah",
        type: "nikkah",
        titleEn: "Nikkah",
        fullTitleEn: "Nikkah Ceremony",
        titleUr: "تقریبِ نکاح",
        shortUr: "نکاح",
        date: "2026-12-04",
        displayDate: "Friday, 4 December 2026",
        displayDateUrdu: "جمعہ، ۴ دسمبر ۲۰۲۶",
        dayEn: "Friday",
        dateNum: "4",
        monthEn: "December",
        time: "3:00 pm",
        timeUr: "دوپہر ۳:۰۰ بجے",
        venue: "Royal Botanical Courtyard",
        venueUrdu: "رائل بوٹینیکل کورٹ یارڈ",
        address: "Gulberg III, Lahore",
        mapUrl: "https://maps.google.com/?q=Gulberg+III+Lahore",
        subSchedule: [
          { title: "Arrival of Guests", time: "2:30 PM" },
          { title: "Nikkah & Dua-e-Khair", time: "3:00 PM" },
          { title: "Dinner & Refreshments", time: "4:30 PM" }
        ]
      },
      engagement: {
        key: "engagement",
        type: "engagement",
        titleEn: "Engagement",
        fullTitleEn: "Engagement Ceremony",
        titleUr: "تقریبِ منگنی",
        shortUr: "منگنی",
        date: "2026-12-05",
        displayDate: "Saturday, 5 December 2026",
        displayDateUrdu: "ہفتہ، ۵ دسمبر ۲۰۲۶",
        dayEn: "Saturday",
        dateNum: "5",
        monthEn: "December",
        time: "7:00 pm",
        timeUr: "شام ۷:۰۰ بجے",
        venue: "The Nishat Grand Ballroom",
        venueUrdu: "دی نشاط گرینڈ بال روم",
        address: "Gulberg, Lahore",
        mapUrl: "https://maps.google.com/?q=The+Nishat+Hotel+Gulberg+Lahore",
        subSchedule: [
          { title: "Welcome & Reception", time: "7:00 PM" },
          { title: "Ring Ceremony", time: "8:00 PM" },
          { title: "Dinner", time: "9:00 PM" }
        ]
      },
      mehndi: {
        key: "mehndi",
        type: "mehndi",
        titleEn: "Mehndi",
        fullTitleEn: "Mehndi Ceremony",
        titleUr: "تقریبِ مہندی",
        shortUr: "مہندی",
        date: "2026-12-04",
        displayDate: "Friday, 4 December 2026",
        displayDateUrdu: "جمعہ، ۴ دسمبر ۲۰۲۶",
        dayEn: "Friday",
        dateNum: "4",
        monthEn: "December",
        time: "7:00 pm",
        timeUr: "شام ۷:۰۰ بجے",
        venue: "Royal Palm Golf & Country Club",
        venueUrdu: "رائل پام گالف اینڈ کنٹری کلب",
        address: "52 Canal Bank Road, Lahore",
        mapUrl: "https://maps.google.com/?q=Royal+Palm+Golf+Country+Club+Lahore",
        subSchedule: [
          { title: "Rasm-e-Hina", time: "7:30 PM" },
          { title: "Dinner", time: "9:00 PM" }
        ]
      },
      barat: {
        key: "barat",
        type: "barat",
        titleEn: isBride ? "Baraat & Rukhsati" : "Baraat",
        fullTitleEn: isBride ? "Baraat & Rukhsati" : "Baraat Ceremony",
        titleUr: isBride ? "تقریبِ بارات و رخصتی" : "تقریبِ بارات",
        shortUr: isBride ? "بارات و رخصتی" : "بارات",
        date: "2026-12-05",
        displayDate: "Saturday, 5 December 2026",
        displayDateUrdu: "ہفتہ، ۵ دسمبر ۲۰۲۶",
        dayEn: "Saturday",
        dateNum: "5",
        monthEn: "December",
        time: "7:30 pm",
        timeUr: "شام ۷:۳۰ بجے",
        venue: "Pearl Continental Grand Ballroom",
        venueUrdu: "پرل کانٹینینٹل گرینڈ بال روم",
        address: "Shahrah-e-Quaid-e-Azam, Lahore",
        mapUrl: "https://maps.google.com/?q=Pearl+Continental+Lahore",
        subSchedule: isBride
          ? [
              { title: "Reception of Baraat", time: "7:30 PM" },
              { title: "Dinner", time: "8:30 PM" },
              { title: "Rukhsati", time: "10:00 PM" }
            ]
          : [
              { title: "Sehra Bandi", time: "6:30 PM" },
              { title: "Departure of Baraat", time: "7:30 PM" },
              { title: "Dinner", time: "8:30 PM" }
            ]
      },
      walima: {
        key: "walima",
        type: "walima",
        titleEn: "Walima",
        fullTitleEn: "Walima Reception",
        titleUr: "تقریبِ ولیمہ",
        shortUr: "ولیمہ",
        date: "2026-12-06",
        displayDate: "Sunday, 6 December 2026",
        displayDateUrdu: "اتوار، ۶ دسمبر ۲۰۲۶",
        dayEn: "Sunday",
        dateNum: "6",
        monthEn: "December",
        time: "7:00 pm",
        timeUr: "شام ۷:۰۰ بجے",
        venue: "Faletti's Heritage Lawn",
        venueUrdu: "فلیٹیز ہیریٹیج لان",
        address: "Egerton Road, Lahore",
        mapUrl: "https://maps.google.com/?q=Falettis+Hotel+Lahore",
        subSchedule: [
          { title: "Reception of Guests", time: "7:00 PM" },
          { title: "Dinner", time: "8:30 PM" }
        ]
      }
    };

    var eventsList = types.map(function (t) {
      var norm = t === "baraat" ? "barat" : (t === "nikah" ? "nikkah" : t);
      var base;
      if (CATALOG[norm]) {
        base = Object.assign({}, CATALOG[norm]);
      } else {
        var label = customName || (t === "custom" ? "Special Celebration" : t.charAt(0).toUpperCase() + t.slice(1));
        base = {
          key: "custom",
          type: "custom",
          titleEn: label,
          fullTitleEn: label,
          titleUr: label,
          shortUr: label,
          date: "2026-12-05",
          displayDate: "Saturday, 5 December 2026",
          displayDateUrdu: "ہفتہ، ۵ دسمبر ۲۰۲۶",
          dayEn: "Saturday",
          dateNum: "5",
          monthEn: "December",
          time: "7:30 pm",
          timeUr: "شام ۷:۳۰ بجے",
          venue: "Serena Heritage Gardens",
          venueUrdu: "سرینا ہیریٹیج گارڈنز",
          address: "Gulberg, Lahore",
          mapUrl: "https://maps.google.com/?q=Gulberg+Lahore",
          subSchedule: [
            { title: "Arrival of Guests", time: "7:30 PM" },
            { title: "Dinner", time: "8:30 PM" }
          ]
        };
      }
      base.title = base.fullTitleEn || base.titleEn;
      base.titleUrdu = base.titleUr;
      base.name = base.title;
      base.nameUrdu = base.titleUr;
      base.displayTime = base.time;
      return base;
    });

    // Build event-accurate English & Urdu wording
    var relationEn = isBride ? "their beloved daughter" : "their beloved son";
    var relationUr = isBride ? "اپنی نورِ نظر" : "اپنے لختِ جگر";

    var eventPhraseEn = "the wedding ceremonies";
    var eventShortEn = "Wedding";
    var eventPhraseUr = "تقریبِ شادی";
    var heroLineEn = "invite you to celebrate their wedding";
    var heroLineUr = "شادی خانہ آبادی کی تقریب میں شرکت کی دعوت دیتے ہیں";

    if (eventsList.length === 1) {
      var only = eventsList[0];
      if (only.type === "nikkah") {
        eventPhraseEn = "the Nikkah ceremony";
        eventShortEn = "Nikkah Ceremony";
        eventPhraseUr = "تقریبِ نکاح";
        heroLineEn = "invite you to celebrate their Nikkah";
        heroLineUr = "نکاح کی بابرکت تقریب میں شرکت کی دعوت دیتے ہیں";
      } else if (only.type === "engagement") {
        eventPhraseEn = "the Engagement ceremony";
        eventShortEn = "Engagement Ceremony";
        eventPhraseUr = "تقریبِ منگنی";
        heroLineEn = "invite you to celebrate their Engagement";
        heroLineUr = "منگنی کی پرمسرت تقریب میں شرکت کی دعوت دیتے ہیں";
      } else if (only.type === "walima") {
        eventPhraseEn = "the Walima reception";
        eventShortEn = "Walima Reception";
        eventPhraseUr = "تقریبِ ولیمہ";
        heroLineEn = "invite you to celebrate their Walima";
        heroLineUr = "تقریبِ ولیمہ میں شرکت کی دعوت دیتے ہیں";
      } else if (only.type === "mehndi") {
        eventPhraseEn = "the Mehndi celebration";
        eventShortEn = "Mehndi Ceremony";
        eventPhraseUr = "تقریبِ مہندی";
        heroLineEn = "invite you to celebrate their Mehndi";
        heroLineUr = "تقریبِ مہندی میں شرکت کی دعوت دیتے ہیں";
      } else if (only.type === "barat") {
        eventPhraseEn = isBride ? "the Baraat & Rukhsati ceremony" : "the Baraat ceremony";
        eventShortEn = isBride ? "Baraat & Rukhsati" : "Baraat Ceremony";
        eventPhraseUr = isBride ? "تقریبِ بارات و رخصتی" : "تقریبِ بارات";
        heroLineEn = isBride ? "invite you to their Baraat & Rukhsati" : "invite you to celebrate their Baraat";
        heroLineUr = isBride ? "تقریبِ بارات و رخصتی میں شرکت کی دعوت دیتے ہیں" : "تقریبِ بارات میں شرکت کی دعوت دیتے ہیں";
      } else {
        eventPhraseEn = "the " + only.titleEn;
        eventShortEn = only.titleEn;
        eventPhraseUr = only.titleUr;
        heroLineEn = "invite you to celebrate their " + only.titleEn;
        heroLineUr = only.titleUr + " کی تقریب میں شرکت کی دعوت دیتے ہیں";
      }
    } else if (eventsList.length === 2) {
      var joinedEn = eventsList[0].titleEn + " & " + eventsList[1].titleEn;
      var joinedUr = eventsList[0].shortUr + " و " + eventsList[1].shortUr;
      eventPhraseEn = "the " + joinedEn + " ceremonies";
      eventShortEn = joinedEn;
      eventPhraseUr = "تقاریبِ " + joinedUr;
      heroLineEn = "invite you to their " + joinedEn;
      heroLineUr = "تقاریبِ " + joinedUr + " میں شرکت کی دعوت دیتے ہیں";
    } else {
      eventPhraseEn = isBride ? "the wedding ceremonies & Rukhsati" : "the wedding ceremonies";
      eventShortEn = "Wedding Celebrations";
      eventPhraseUr = "تقاریبِ شادی";
      heroLineEn = "invite you to celebrate their wedding";
      heroLineUr = "شادی خانہ آبادی کی تقاریب میں شرکت کی دعوت دیتے ہیں";
    }

    return {
      side: side,
      isBride: isBride,
      types: types,
      eventsList: eventsList,
      eventShortEn: eventShortEn,
      eventPhraseEn: eventPhraseEn,
      eventPhraseUr: eventPhraseUr,
      heroLineEn: heroLineEn,
      heroLineUr: heroLineUr,
      hostLineEn: "invite you to " + eventPhraseEn + " of " + relationEn,
      hostLineUr: relationUr + " کی " + eventPhraseUr + " میں شرکت کی پرخلوص دعوت دیتے ہیں",
      cordialHostLineEn: "Cordially invite you to celebrate the blessed occasion of " + eventPhraseEn + " of " + relationEn,
      firstDateDisplay: eventsList[0].displayDate,
      firstDateIso: eventsList[0].date
    };
  }

  global.getEDawatPreviewEventsConfig = getPreviewEventsConfig;
})(window);
