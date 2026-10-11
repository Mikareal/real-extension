import { checkHytaleName } from "./shared/hytale-check.js";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "checkHytaleName") return;
  checkHytaleName(message.username)
    .then(sendResponse)
    .catch(() => sendResponse({ status: "unknown" }));
  return true;
});
