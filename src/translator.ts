import {
  env,
  pipeline,
  type TranslationPipeline,
} from "@huggingface/transformers";

import type { LanguageCode } from "./language.js";

const TRANSLATION_MODEL = "Xenova/nllb-200-distilled-600M";
export const NLLB_TARGET_LANGUAGE = "jpn_Jpan";

const NLLB_SOURCE_LANGUAGE_CODES = {
  de: "deu_Latn",
  en: "eng_Latn",
  es: "spa_Latn",
  fr: "fra_Latn",
  it: "ita_Latn",
  ko: "kor_Hang",
  pt: "por_Latn",
  ru: "rus_Cyrl",
} as const;

type TranslatableLanguage = keyof typeof NLLB_SOURCE_LANGUAGE_CODES;

const LANGUAGE_FLAGS: Partial<Record<LanguageCode, string>> = {
  de: "🇩🇪",
  en: "🇺🇸",
  es: "🇪🇸",
  fr: "🇫🇷",
  it: "🇮🇹",
  ko: "🇰🇷",
  pt: "🇵🇹",
  ru: "🇷🇺",
};

// `quantized` keeps compatibility with earlier Transformers.js releases.
// `dtype: "q4"` selects the current library's 4-bit ONNX files explicitly.
export const QUANTIZED_MODEL_OPTIONS = {
  dtype: "q4",
  quantized: true,
} as const;

export function isTranslatableLanguage(
  language: LanguageCode,
): language is TranslatableLanguage {
  return language in NLLB_SOURCE_LANGUAGE_CODES;
}

export function getNllbSourceLanguageCode(
  language: TranslatableLanguage,
): string {
  return NLLB_SOURCE_LANGUAGE_CODES[language];
}

export function formatTranslationReply(
  language: TranslatableLanguage,
  username: string,
  translation: string,
): string {
  const flag = LANGUAGE_FLAGS[language] ?? "🌐";
  const prefix = `[${flag}] @${username}: `;
  const availableLength = 500 - Array.from(prefix).length;
  const text = Array.from(translation.trim())
    .slice(0, availableLength)
    .join("");

  return `${prefix}${text}`;
}

export class LocalTranslator {
  private translatorPromise: Promise<TranslationPipeline> | undefined;

  constructor(localModelsOnly = false) {
    env.cacheDir = "./models";
    env.allowRemoteModels = !localModelsOnly;
  }

  async translate(
    message: string,
    sourceLanguage: TranslatableLanguage,
  ): Promise<string> {
    const srcLang = getNllbSourceLanguageCode(sourceLanguage);
    console.info(
      `NLLB translation language pair: ${srcLang} -> ${NLLB_TARGET_LANGUAGE}`,
    );
    const translator = await this.getTranslator();
    const output = await translator(message, {
      src_lang: srcLang,
      tgt_lang: NLLB_TARGET_LANGUAGE,
    } as never);
    const firstResult = Array.isArray(output[0]) ? output[0][0] : output[0];
    const translation = firstResult?.translation_text?.trim();

    if (!translation) {
      throw new Error("The local translation model returned an empty result.");
    }

    return translation;
  }

  private getTranslator(): Promise<TranslationPipeline> {
    this.translatorPromise ??= this.loadTranslator();
    return this.translatorPromise;
  }

  private async loadTranslator(): Promise<TranslationPipeline> {
    console.info(`Loading 4-bit local translation model: ${TRANSLATION_MODEL}`);
    return pipeline(
      "translation",
      TRANSLATION_MODEL,
      QUANTIZED_MODEL_OPTIONS as never,
    ) as unknown as Promise<TranslationPipeline>;
  }
}
