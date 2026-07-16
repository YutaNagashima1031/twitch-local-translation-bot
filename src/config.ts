import "dotenv/config";

export type TwitchConfig = {
  botUsername: string;
  channel: string;
  debug: boolean;
  localModelsOnly: boolean;
  oauthToken: string;
  processOwnMessages: boolean;
};

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function loadTwitchConfig(): TwitchConfig {
  const channel = requiredEnv("TWITCH_CHANNEL").replace(/^#/, "");
  const oauthToken = requiredEnv("TWITCH_OAUTH_TOKEN");

  if (!oauthToken.startsWith("oauth:")) {
    throw new Error("TWITCH_OAUTH_TOKEN must start with 'oauth:'.");
  }

  return {
    botUsername: requiredEnv("TWITCH_BOT_USERNAME"),
    channel,
    debug: process.env.TWITCH_DEBUG?.toLowerCase() === "true",
    localModelsOnly: process.env.LOCAL_MODELS_ONLY?.toLowerCase() === "true",
    oauthToken,
    processOwnMessages:
      process.env.PROCESS_OWN_MESSAGES?.toLowerCase() !== "false",
  };
}
