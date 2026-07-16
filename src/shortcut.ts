export type ShortcutTranslation = {
  language: "en";
  translation: string;
};

const SHORTCUT_TRANSLATIONS = new Map<string, ShortcutTranslation>([
  ["hello", { language: "en", translation: "こんにちは" }],
  ["hi", { language: "en", translation: "こんにちは" }],
  ["gg", { language: "en", translation: "グッドゲーム！" }],
  ["lol", { language: "en", translation: "笑" }],
  ["lmao", { language: "en", translation: "笑" }],
]);

const TRAILING_CHAT_PUNCTUATION = /[!?.。！？]+$/u;

export function findShortcutTranslation(
  message: string,
): ShortcutTranslation | undefined {
  const normalizedMessage = message
    .trim()
    .toLowerCase()
    .replace(TRAILING_CHAT_PUNCTUATION, "");

  return SHORTCUT_TRANSLATIONS.get(normalizedMessage);
}
