import assert from "node:assert/strict";
import test from "node:test";

import { filterChatMessage } from "./filter.js";

test("filters commands, short messages, URLs, emotes, and symbols", () => {
  assert.deepEqual(filterChatMessage("!help"), {
    shouldSkip: true,
    reason: "command",
  });
  assert.deepEqual(filterChatMessage("hey"), {
    shouldSkip: true,
    reason: "too-short",
  });
  assert.deepEqual(filterChatMessage("Visit https://example.com"), {
    shouldSkip: true,
    reason: "url",
  });
  assert.deepEqual(filterChatMessage("PogChamp"), {
    shouldSkip: true,
    reason: "emote",
  });
  assert.deepEqual(filterChatMessage("??? ✨"), {
    shouldSkip: true,
    reason: "symbol-only",
  });
});

test("allows a meaningful chat message", () => {
  assert.deepEqual(filterChatMessage("Hello everyone!"), { shouldSkip: false });
});
