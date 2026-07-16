import assert from "node:assert/strict";
import test from "node:test";

import { findShortcutTranslation } from "./shortcut.js";

test("translates common Twitch short messages without a model", () => {
  assert.deepEqual(findShortcutTranslation("hello"), {
    language: "en",
    translation: "こんにちは",
  });
  assert.deepEqual(findShortcutTranslation("HI!"), {
    language: "en",
    translation: "こんにちは",
  });
  assert.deepEqual(findShortcutTranslation("gg"), {
    language: "en",
    translation: "グッドゲーム！",
  });
  assert.deepEqual(findShortcutTranslation("lol"), {
    language: "en",
    translation: "笑",
  });
  assert.deepEqual(findShortcutTranslation("lmao..."), {
    language: "en",
    translation: "笑",
  });
});

test("does not match longer chat messages", () => {
  assert.equal(findShortcutTranslation("hello everyone"), undefined);
});
