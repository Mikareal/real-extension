import { watchSettings } from "../../shared/settings.js";
import { createNameMCModule } from "./index.js";

export function startNameMC() {
  const module = createNameMCModule();
  let stopWatching = watchSettings(settings => module.update(settings));

  window.addEventListener("pagehide", () => {
    stopWatching();
    module.stop();
  });
  window.addEventListener("pageshow", event => {
    if (event.persisted) {
      stopWatching = watchSettings(settings => module.update(settings));
    }
  });
}
