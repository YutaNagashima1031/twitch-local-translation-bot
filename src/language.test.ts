import assert from "node:assert/strict";
import test from "node:test";

import { detectLanguage } from "./language.js";

test("detects Japanese script without an external API", () => {
  assert.deepEqual(detectLanguage("こんにちは、配信楽しいです！"), {
    code: "ja",
    iso6393: "jpn",
  });
});

test("detects longer English and Spanish messages locally", () => {
  assert.equal(
    detectLanguage("Hello everyone, this stream is amazing today.").code,
    "en",
  );
  assert.equal(
    detectLanguage("Hola a todos, esta transmisión está genial hoy.").code,
    "es",
  );
});

test("detects common short Twitch chat messages before using trigram detection", () => {
  assert.equal(detectLanguage("hello").code, "en");
  assert.equal(detectLanguage("hello, how are you?").code, "en");
  assert.equal(detectLanguage("hola").code, "es");
});
