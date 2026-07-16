import { franc } from "franc";

export type LanguageCode =
  "de" | "en" | "es" | "fr" | "it" | "ja" | "ko" | "pt" | "ru" | "unknown";

export type DetectedLanguage = {
  code: LanguageCode;
  iso6393: string;
};

const ISO_639_3_TO_LANGUAGE: Record<string, LanguageCode> = {
  deu: "de",
  eng: "en",
  fra: "fr",
  ita: "it",
  jpn: "ja",
  kor: "ko",
  por: "pt",
  rus: "ru",
  spa: "es",
};

const JAPANESE_SCRIPT_PATTERN = /[\p{Script=Hiragana}\p{Script=Katakana}]/u;
const LANGUAGE_CANDIDATES = [
  "deu",
  "eng",
  "fra",
  "ita",
  "jpn",
  "kor",
  "por",
  "rus",
  "spa",
];

const CHAT_LANGUAGE_MARKERS: Partial<
  Record<LanguageCode, ReadonlySet<string>>
> = {
  de: new Set(["bitte", "danke", "hallo", "und"]),
  en: new Set([
    "hello",
    "hey",
    "hi",
    "how",
    "are",
    "you",
    "thanks",
    "thank",
    "please",
    "good",
    "great",
    "game",
    "stream",
  ]),
  es: new Set([
    "hola",
    "gracias",
    "como",
    "cómo",
    "que",
    "qué",
    "por",
    "favor",
  ]),
  fr: new Set(["bonjour", "merci", "comment", "vous"]),
  it: new Set(["ciao", "grazie", "come", "sei"]),
  pt: new Set(["olá", "ola", "obrigado", "obrigada", "como", "você"]),
};

export function detectLanguage(message: string): DetectedLanguage {
  if (JAPANESE_SCRIPT_PATTERN.test(message)) {
    return { code: "ja", iso6393: "jpn" };
  }

  const markedLanguage = detectChatLanguageMarker(message);
  if (markedLanguage) {
    return {
      code: markedLanguage,
      iso6393: languageToIso6393(markedLanguage),
    };
  }

  const iso6393 = franc(message, {
    minLength: 3,
    only: LANGUAGE_CANDIDATES,
  });

  return {
    code: ISO_639_3_TO_LANGUAGE[iso6393] ?? "unknown",
    iso6393,
  };
}

function detectChatLanguageMarker(message: string): LanguageCode | undefined {
  const words = message.toLowerCase().match(/\p{L}+/gu) ?? [];

  for (const [language, markers] of Object.entries(CHAT_LANGUAGE_MARKERS)) {
    if (markers?.size && words.some((word) => markers.has(word))) {
      return language as LanguageCode;
    }
  }

  return undefined;
}

function languageToIso6393(language: LanguageCode): string {
  return (
    Object.entries(ISO_639_3_TO_LANGUAGE).find(
      ([, languageCode]) => languageCode === language,
    )?.[0] ?? "und"
  );
}
