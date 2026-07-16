import assert from "node:assert/strict";
import test from "node:test";

import {
  formatTranslationReply,
  getNllbSourceLanguageCode,
  isTranslatableLanguage,
  NLLB_TARGET_LANGUAGE,
  QUANTIZED_MODEL_OPTIONS,
} from "./translator.js";

test("formats a translation reply with a language flag", () => {
  assert.equal(
    formatTranslationReply("es", "viewer", "こんにちは、みなさん！"),
    "[🇪🇸] @viewer: こんにちは、みなさん！",
  );
});

test("accepts supported source languages and excludes unsupported ones", () => {
  assert.equal(isTranslatableLanguage("en"), true);
  assert.equal(isTranslatableLanguage("es"), true);
  assert.equal(isTranslatableLanguage("unknown"), false);
  assert.equal(isTranslatableLanguage("ja"), false);
});

test("maps detected language codes to NLLB language tags", () => {
  assert.equal(getNllbSourceLanguageCode("en"), "eng_Latn");
  assert.equal(getNllbSourceLanguageCode("es"), "spa_Latn");
  assert.equal(NLLB_TARGET_LANGUAGE, "jpn_Jpan");
});

test("uses an explicitly quantized 4-bit model configuration", () => {
  assert.deepEqual(QUANTIZED_MODEL_OPTIONS, {
    dtype: "q4",
    quantized: true,
  });
});
