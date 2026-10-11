import { isFeatureEnabled } from "./settings.js";

// Each feature provides start(), which returns a function to undo its changes.
export function createModuleRunner(module, features) {
  const running = new Map();

  function update(settings) {
    for (const feature of features) {
      const enabled = isFeatureEnabled(settings, module, feature.id);
      if (enabled && !running.has(feature.id)) {
        running.set(feature.id, feature.start());
      } else if (!enabled && running.has(feature.id)) {
        running.get(feature.id)();
        running.delete(feature.id);
      }
    }
  }

  function stop() {
    for (const cleanup of running.values()) cleanup();
    running.clear();
  }

  return { update, stop };
}
