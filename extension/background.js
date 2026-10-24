import { checkHytaleName } from "./modules/namemc/api/hytale.js";
import { loadCraftyHistory, loadAmplitudesHistory } from "./modules/namemc/api/name-history.js";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "loadNameHistory" && ["crafty", "amplitudes"].includes(message.source)) {
    const load = message.source === "crafty" ? loadCraftyHistory : loadAmplitudesHistory;
    const label = message.source === "crafty" ? "Crafty" : "Amplitudes";
    load(message.username, message.uuid)
      .then(sendResponse)
      .catch(() => sendResponse({ error: `Could not load ${label} history. Try selecting ${label} again.` }));
    return true;
  }
  if (message?.type !== "checkHytaleName") return;
  checkHytaleName(message.username)
    .then(sendResponse)
    .catch(() => sendResponse({ status: "unknown" }));
  return true;
});
