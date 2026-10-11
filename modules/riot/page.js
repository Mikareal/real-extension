import { watchSettings } from "../../shared/settings.js";
import { createModuleRunner } from "../../shared/module-runner.js";
import * as ticketText from "./ticket-text.js";

export function startRiot() {
  const module = createModuleRunner("riot2fa", [ticketText]);
  let stopWatching = watchSettings(settings => module.update(settings));
  window.addEventListener("pagehide", () => {
    stopWatching();
    module.stop();
  });
  window.addEventListener("pageshow", event => {
    if (event.persisted) stopWatching = watchSettings(settings => module.update(settings));
  });
}
