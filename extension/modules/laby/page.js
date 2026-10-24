import { watchSettings, isFeatureEnabled } from "../../shared/settings.js";

export function startLaby() {
  function setEnabled(enabled) {
    window.dispatchEvent(new CustomEvent("real-extension:laby-cape", { detail: enabled }));
  }
  function watch() {
    return watchSettings(settings => setEnabled(isFeatureEnabled(settings, "labymod", "elytraCapeFix")));
  }
  let stopWatching = watch();
  window.addEventListener("pagehide", () => {
    stopWatching();
    setEnabled(false);
  });
  window.addEventListener("pageshow", event => {
    if (event.persisted) stopWatching = watch();
  });
}
