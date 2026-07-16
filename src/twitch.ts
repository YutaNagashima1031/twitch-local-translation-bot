import tmi from "tmi.js";

import type { TwitchConfig } from "./config.js";
import { filterChatMessage } from "./filter.js";
import { detectLanguage } from "./language.js";
import { findShortcutTranslation } from "./shortcut.js";
import {
  formatTranslationReply,
  isTranslatableLanguage,
  LocalTranslator,
} from "./translator.js";

export function startTwitchChatListener(config: TwitchConfig): tmi.Client {
  const translator = new LocalTranslator(config.localModelsOnly);
  const client = new tmi.Client({
    connection: {
      reconnect: true,
      secure: true,
    },
    identity: {
      username: config.botUsername,
      password: config.oauthToken,
    },
    channels: [config.channel],
    options: {
      debug: config.debug,
    },
  });

  client.on("connected", (address, port) => {
    console.info(`Connected to Twitch chat via ${address}:${port}.`);
  });

  client.on("disconnected", (reason) => {
    console.error(`Disconnected from Twitch chat: ${reason}`);
  });

  client.on("message", (channel, userstate, message, self) => {
    void handleChatMessage({
      channel,
      client,
      message,
      processOwnMessages: config.processOwnMessages,
      self,
      translator,
      username: userstate["display-name"] ?? userstate.username ?? "unknown",
    });
  });

  void client.connect().catch((error: unknown) => {
    console.error("Failed to connect to Twitch chat.", error);
  });

  return client;
}

type ChatMessageParams = {
  channel: string;
  client: tmi.Client;
  message: string;
  processOwnMessages: boolean;
  self: boolean;
  translator: LocalTranslator;
  username: string;
};

async function handleChatMessage({
  channel,
  client,
  message,
  processOwnMessages,
  self,
  translator,
  username,
}: ChatMessageParams): Promise<void> {
  try {
    if (self && !processOwnMessages) {
      return;
    }

    const shortcut = findShortcutTranslation(message);
    if (shortcut) {
      console.info(
        `[${channel}] Sending shortcut translation for @${username}.`,
      );
      await client.say(
        channel,
        formatTranslationReply(
          shortcut.language,
          username,
          shortcut.translation,
        ),
      );
      return;
    }

    const filterResult = filterChatMessage(message);
    if (filterResult.shouldSkip) {
      return;
    }

    const detectedLanguage = detectLanguage(message);

    if (detectedLanguage.code === "ja") {
      console.info(`[${channel}] @${username}: Japanese message skipped.`);
      return;
    }

    if (!isTranslatableLanguage(detectedLanguage.code)) {
      console.info(
        `[${channel}] @${username}: Unsupported language (${detectedLanguage.iso6393}) skipped.`,
      );
      return;
    }

    console.info(
      `[${channel}] Translating @${username}'s ${detectedLanguage.code} message locally.`,
    );
    const translation = await translator.translate(
      message,
      detectedLanguage.code,
    );
    await client.say(
      channel,
      formatTranslationReply(detectedLanguage.code, username, translation),
    );
  } catch (error) {
    console.error("Failed to translate or send a Twitch chat message.", error);
  }
}
