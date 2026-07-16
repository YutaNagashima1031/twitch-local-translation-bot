import { loadTwitchConfig } from "./config.js";
import { startTwitchChatListener } from "./twitch.js";

try {
  startTwitchChatListener(loadTwitchConfig());
} catch (error) {
  console.error("Unable to start the Twitch translation bot.", error);
  process.exitCode = 1;
}
