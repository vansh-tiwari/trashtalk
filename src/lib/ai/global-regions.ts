export interface GlobalRegionInfo {
  countryCode: string;
  languageCode: string;
  languageName: string;
  toggleLabel: string;
  isEnglishDefault: boolean;
  culturalPromptGuidance: string;
}

export const DEFAULT_GLOBAL_REGION: GlobalRegionInfo = {
  countryCode: "US",
  languageCode: "en",
  languageName: "English",
  toggleLabel: "ENGLISH",
  isEnglishDefault: true,
  culturalPromptGuidance:
    "Razor-sharp Sarcastic Senior Dev English. Biting, dry wit, cynical senior engineer targeting vanity metrics, 0-star repos, Two-Sum memorization, commit padding, and Div 2 speedrunners.",
};

export function resolveGlobalRegion(
  headers?: Headers | Record<string, string | string[] | undefined> | null,
  overrideLang?: string | null,
  clientTimezone?: string | null,
  clientLang?: string | null
): GlobalRegionInfo {
  if (overrideLang) {
    const norm = overrideLang.toLowerCase().trim();
    if (norm === "es" || norm === "spanish" || norm === "mexico") {
      return {
        countryCode: "MX",
        languageCode: "es",
        languageName: "Español",
        toggleLabel: "ESPAÑOL",
        isEnglishDefault: false,
        culturalPromptGuidance:
          "Informal Mexican & Latin American developer slang (Español Latinoamericano). Use terms like 'taquero programador', 'push directo a main en viernes', '400 Two Sum y no sabe qué es un puntero', 'código atado con alambre', 'consultora fantasma'. Sarcastic, funny, authentic Latin tech culture.",
      };
    }
    if (norm === "fr" || norm === "french") {
      return {
        countryCode: "FR",
        languageCode: "fr",
        languageName: "Français",
        toggleLabel: "FRANÇAIS",
        isEnglishDefault: false,
        culturalPromptGuidance:
          "Informal French tech cynicism (Français). Use developer idioms like 'pisseur de code', 'usine à gaz', 'push sauvage en prod le vendredi à 18h', 'développeur junior payé en tickets resto', 'TLE sur le prétest 2'. Biting, witty Parisian/French tech sarcasm.",
      };
    }
    if (norm === "de" || norm === "german") {
      return {
        countryCode: "DE",
        languageCode: "de",
        languageName: "Deutsch",
        toggleLabel: "DEUTSCH",
        isEnglishDefault: false,
        culturalPromptGuidance:
          "Informal German developer sarcasm (Deutsch). Use terms like 'Spaghetti-Code', 'Over-Engineering des Todes', '25 Klassen für ein Hello World', 'verschlimmbessert', 'TLE wegen Ineffizienz'. Dry, deadpan German engineering perfectionism mocking bad code.",
      };
    }
    if (norm === "pt" || norm === "portuguese" || norm === "brazil") {
      return {
        countryCode: "BR",
        languageCode: "pt",
        languageName: "Português",
        toggleLabel: "PORTUGUÊS",
        isEnglishDefault: false,
        culturalPromptGuidance:
          "Informal Brazilian Portuguese developer slang (Português BR). Use terms like 'gambiarra nível master', 'commit direto na master sem teste', 'pastel de código', 'júnior jurando que é sênior com 6 meses de curso', 'estagiário derrubando a prod'. Sarcastic, lively Brazilian dev banter.",
      };
    }
    if (norm === "ru" || norm === "russian") {
      return {
        countryCode: "RU",
        languageCode: "ru",
        languageName: "Русский",
        toggleLabel: "РУССКИЙ",
        isEnglishDefault: false,
        culturalPromptGuidance:
          "Codeforces-native Russian competitive programming slang (Русский). Use terms like 'слил рейтинг в ноль', 'взлом на претестах', '150 строк кода ради задачи на четность', 'брутфорс вместо ДП', 'стыд перед кафедрой'. Cold, mathematical, ruthless Codeforces humor.",
      };
    }
    if (norm === "te" || norm === "telugu" || norm === "teluglish") {
      return {
        countryCode: "IN",
        languageCode: "te",
        languageName: "Teluglish",
        toggleLabel: "TELUGLISH",
        isEnglishDefault: false,
        culturalPromptGuidance:
          "Conversational Teluglish (Telugu + English in Latin script). Authentic Hyderabad/AP tech culture: Ameerpet 45-day course myths, Hitec City Cyber Towers chai breaks, US MS/H-1B grind, Two-Sum copy-paste with Question 3 freeze.",
      };
    }
    if (norm === "ta" || norm === "tamil" || norm === "tanglish") {
      return {
        countryCode: "IN",
        languageCode: "ta",
        languageName: "Tanglish",
        toggleLabel: "TANGLISH",
        isEnglishDefault: false,
        culturalPromptGuidance:
          "Conversational Tanglish (Tamil + English in Latin script). Chennai OMR/Tidel Park tech culture: 9-hour AC room grind, Vadivelu meme despair, Anna University backlogs vs FAANG dreams, cutting chai, TLE on pretest 2.",
      };
    }
    if (norm === "hi" || norm === "hinglish") {
      return {
        countryCode: "IN",
        languageCode: "hi",
        languageName: "Hinglish",
        toggleLabel: "HINGLISH",
        isEnglishDefault: false,
        culturalPromptGuidance:
          "Conversational Hinglish (Hindi + English in Latin script). Indian tech culture: 3 LPA package with 50 LPA ego, cloned Netflix repos, mummy ke account se star, TCS Ninja form vs Div 2 Problem B panic.",
      };
    }
  }

  // Extract from Headers
  let country = "";
  let region = "";
  let acceptLanguage = "";

  if (headers) {
    if (typeof (headers as Headers).get === "function") {
      const h = headers as Headers;
      country = h.get("x-vercel-ip-country") || "";
      region = h.get("x-vercel-ip-country-region") || "";
      acceptLanguage = h.get("accept-language") || "";
    } else {
      const rec = headers as Record<string, string | string[] | undefined>;
      const getVal = (k: string) => {
        const v = rec[k] || rec[k.toLowerCase()];
        return Array.isArray(v) ? v[0] : v || "";
      };
      country = getVal("x-vercel-ip-country");
      region = getVal("x-vercel-ip-country-region");
      acceptLanguage = getVal("accept-language");
    }
  }

  if (!country && clientTimezone) {
    const tz = clientTimezone.toLowerCase();
    if (tz.includes("kolkata") || tz.includes("calcutta")) {
      country = "IN";
    } else if (tz.includes("mexico") || tz.includes("cancun") || tz.includes("monterrey")) {
      country = "MX";
    } else if (tz.includes("paris")) {
      country = "FR";
    } else if (tz.includes("berlin")) {
      country = "DE";
    } else if (tz.includes("sao_paulo")) {
      country = "BR";
    } else if (tz.includes("moscow")) {
      country = "RU";
    }
  }

  if (clientLang) {
    acceptLanguage = acceptLanguage ? `${clientLang},${acceptLanguage}` : clientLang;
  }

  const cUpper = country.toUpperCase().trim();
  const rUpper = region.toUpperCase().trim();
  const lLower = acceptLanguage.toLowerCase();

  // 1. Mexico & Latin America
  if (
    cUpper === "MX" ||
    cUpper === "CO" ||
    cUpper === "AR" ||
    cUpper === "CL" ||
    cUpper === "PE" ||
    lLower.startsWith("es-mx") ||
    lLower.startsWith("es-co") ||
    lLower.startsWith("es-ar") ||
    (cUpper === "" && lLower.startsWith("es"))
  ) {
    return {
      countryCode: cUpper || "MX",
      languageCode: "es",
      languageName: "Español",
      toggleLabel: "ESPAÑOL",
      isEnglishDefault: false,
      culturalPromptGuidance:
        "Informal Mexican & Latin American developer slang (Español Latinoamericano). Use terms like 'taquero programador', 'push directo a main en viernes', '400 Two Sum y no sabe qué es un puntero', 'código atado con alambre', 'consultora fantasma'. Sarcastic, funny, authentic Latin tech culture.",
    };
  }

  // 2. Spain
  if (cUpper === "ES") {
    return {
      countryCode: "ES",
      languageCode: "es",
      languageName: "Español",
      toggleLabel: "ESPAÑOL",
      isEnglishDefault: false,
      culturalPromptGuidance:
        "Informal Spanish developer sarcasm (Español de España). Use terms like 'chapuza de código', 'vaya pifia en producción', 'meterlo a pelo', 'picacodigo sin sentido'. Funny, sharp tech banter.",
    };
  }

  // 3. France & Francophone
  if (cUpper === "FR" || (cUpper === "" && lLower.startsWith("fr"))) {
    return {
      countryCode: cUpper || "FR",
      languageCode: "fr",
      languageName: "Français",
      toggleLabel: "FRANÇAIS",
      isEnglishDefault: false,
      culturalPromptGuidance:
        "Informal French tech cynicism (Français). Use developer idioms like 'pisseur de code', 'usine à gaz', 'push sauvage en prod le vendredi à 18h', 'développeur junior payé en tickets resto', 'TLE sur le prétest 2'. Biting, witty Parisian/French tech sarcasm.",
    };
  }

  // 4. Germany & DACH
  if (cUpper === "DE" || cUpper === "AT" || (cUpper === "" && lLower.startsWith("de"))) {
    return {
      countryCode: cUpper || "DE",
      languageCode: "de",
      languageName: "Deutsch",
      toggleLabel: "DEUTSCH",
      isEnglishDefault: false,
      culturalPromptGuidance:
        "Informal German developer sarcasm (Deutsch). Use terms like 'Spaghetti-Code', 'Over-Engineering des Todes', '25 Klassen für ein Hello World', 'verschlimmbessert', 'TLE wegen Ineffizienz'. Dry, deadpan German engineering perfectionism mocking bad code.",
    };
  }

  // 5. Brazil & Lusophone
  if (cUpper === "BR" || (cUpper === "" && lLower.startsWith("pt"))) {
    return {
      countryCode: cUpper || "BR",
      languageCode: "pt",
      languageName: "Português",
      toggleLabel: "PORTUGUÊS",
      isEnglishDefault: false,
      culturalPromptGuidance:
        "Informal Brazilian Portuguese developer slang (Português BR). Use terms like 'gambiarra nível master', 'commit direto na master sem teste', 'pastel de código', 'júnior jurando que é sênior com 6 meses de curso', 'estagiário derrubando a prod'. Sarcastic, lively Brazilian dev banter.",
    };
  }

  // 6. Eastern Europe & Russia
  if (
    cUpper === "RU" ||
    cUpper === "UA" ||
    cUpper === "KZ" ||
    cUpper === "BY" ||
    (cUpper === "" && lLower.startsWith("ru"))
  ) {
    return {
      countryCode: cUpper || "RU",
      languageCode: "ru",
      languageName: "Русский",
      toggleLabel: "РУССКИЙ",
      isEnglishDefault: false,
      culturalPromptGuidance:
        "Codeforces-native Russian competitive programming slang (Русский). Use terms like 'слил рейтинг в ноль', 'взлом на претестах', '150 строк кода ради задачи на четность', 'брутфорс вместо ДП', 'стыд перед кафедрой'. Cold, mathematical, ruthless Codeforces humor.",
    };
  }

  // 7. India (Region-sensitive or en-IN / hi-IN browser language or Asia/Kolkata timezone)
  if (cUpper === "IN" || lLower.includes("en-in") || lLower.includes("hi-in") || lLower.startsWith("hi")) {
    // Telangana / Andhra Pradesh
    if (rUpper === "TG" || rUpper === "AP" || lLower.includes("te")) {
      return {
        countryCode: "IN",
        languageCode: "te",
        languageName: "Teluglish",
        toggleLabel: "TELUGLISH",
        isEnglishDefault: false,
        culturalPromptGuidance:
          "Conversational Teluglish (Telugu + English in Latin script). Authentic Hyderabad/AP tech culture: Ameerpet 45-day course myths, Hitec City Cyber Towers chai breaks, US MS/H-1B grind, Two-Sum copy-paste with Question 3 freeze.",
      };
    }
    // Tamil Nadu
    if (rUpper === "TN" || lLower.includes("ta")) {
      return {
        countryCode: "IN",
        languageCode: "ta",
        languageName: "Tanglish",
        toggleLabel: "TANGLISH",
        isEnglishDefault: false,
        culturalPromptGuidance:
          "Conversational Tanglish (Tamil + English in Latin script). Chennai OMR/Tidel Park tech culture: 9-hour AC room grind, Vadivelu meme despair, Anna University backlogs vs FAANG dreams, cutting chai, TLE on pretest 2.",
      };
    }
    // Default Pan-India (Hinglish)
    return {
      countryCode: "IN",
      languageCode: "hi",
      languageName: "Hinglish",
      toggleLabel: "HINGLISH",
      isEnglishDefault: false,
      culturalPromptGuidance:
        "Conversational Hinglish (Hindi + English in Latin script). Indian tech culture: 3 LPA package with 50 LPA ego, cloned Netflix repos, mummy ke account se star, TCS Ninja form vs Div 2 Problem B panic.",
    };
  }

  // Default Global English
  return DEFAULT_GLOBAL_REGION;
}
