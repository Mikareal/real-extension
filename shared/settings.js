export const moduleFeatures = {
  namemc: ["locatorDot", "externalSites", "hytaleName", "nameHistory", "betterSkinViewer"],
  riot2fa: ["ticketTextFix"],
  labymod: ["elytraCapeFix"]
};

export function normalizeSettings(saved = {}) {
  const settings = { modules: {}, features: {} };
  for (const [module, features] of Object.entries(moduleFeatures)) {
    settings.modules[module] = saved.modules?.[module] === true;
    settings.features[module] = {};
    for (const feature of features) {
      settings.features[module][feature] = saved.features?.[module]?.[feature] !== false;
    }
  }
  return settings;
}

export function isFeatureEnabled(settings, module, feature) {
  return settings.modules[module] === true && settings.features[module]?.[feature] === true;
}

export async function loadSettings() {
  return normalizeSettings(await chrome.storage.local.get(["modules", "features"]));
}

export async function saveSettings(settings) {
  await chrome.storage.local.set(normalizeSettings(settings));
}

export function watchSettings(onSettings) {
  let active = true;
  let revision = 0;

  async function refresh() {
    const current = ++revision;
    try {
      const settings = await loadSettings();
      if (active && current === revision) onSettings(settings);
    } catch (error) {
      if (active) console.error("Could not load extension settings:", error);
    }
  }

  function onChanged(changes, area) {
    if (area === "local" && (changes.modules || changes.features)) refresh();
  }

  chrome.storage.onChanged.addListener(onChanged);
  refresh();
  return () => {
    active = false;
    chrome.storage.onChanged.removeListener(onChanged);
  };
}
