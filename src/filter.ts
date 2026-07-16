export type FilterReason =
  "command" | "empty" | "emote" | "symbol-only" | "too-short" | "url";

export type FilterResult =
  { shouldSkip: false } | { reason: FilterReason; shouldSkip: true };

export const DEFAULT_TWITCH_EMOTES = new Set([
  "kappa",
  "kekw",
  "lul",
  "omegalul",
  "pogchamp",
]);

const URL_PATTERN = /(?:https?:\/\/|www\.)\S+/iu;
const SYMBOL_ONLY_PATTERN = /^[\p{P}\p{S}\s]+$/u;

export function filterChatMessage(
  message: string,
  emotes: ReadonlySet<string> = DEFAULT_TWITCH_EMOTES,
  minimumLength = 4,
): FilterResult {
  const trimmedMessage = message.trim();

  if (!trimmedMessage) {
    return { shouldSkip: true, reason: "empty" };
  }

  if (trimmedMessage.startsWith("!")) {
    return { shouldSkip: true, reason: "command" };
  }

  if (Array.from(trimmedMessage).length < minimumLength) {
    return { shouldSkip: true, reason: "too-short" };
  }

  if (URL_PATTERN.test(trimmedMessage)) {
    return { shouldSkip: true, reason: "url" };
  }

  if (SYMBOL_ONLY_PATTERN.test(trimmedMessage)) {
    return { shouldSkip: true, reason: "symbol-only" };
  }

  if (emotes.has(trimmedMessage.toLowerCase())) {
    return { shouldSkip: true, reason: "emote" };
  }

  return { shouldSkip: false };
}
