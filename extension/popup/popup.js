import { normalizeSettings, loadSettings, saveSettings } from "../shared/settings.js";

const moduleToggles = document.querySelectorAll(".module > input");
const featureToggles = document.querySelectorAll("[data-feature]");
const settingsForm = document.getElementById("settings");
const message = document.getElementById("message");
let settings = normalizeSettings();

function renderSettings() {
  for (const module of moduleToggles) {
    module.checked = settings.modules[module.id];
  }
  for (const feature of featureToggles) {
    feature.checked = settings.features[feature.dataset.module][feature.dataset.feature];
    feature.disabled = !settings.modules[feature.dataset.module];
  }
}

loadSettings().then(saved => {
  settings = saved;
  renderSettings();
  settingsForm.disabled = false;
}).catch(() => {
  message.textContent = "Could not load settings. Reopen the popup to try again.";
});

function saveChanges() {
  for (const module of moduleToggles) {
    settings.modules[module.id] = module.checked;
  }
  for (const feature of featureToggles) {
    settings.features[feature.dataset.module][feature.dataset.feature] = feature.checked;
  }
  renderSettings();
  saveSettings(settings).then(() => {
    message.textContent = "";
  }).catch(() => {
    message.textContent = "Could not save settings. Try again.";
  });
}

for (const toggle of [...moduleToggles, ...featureToggles]) {
  toggle.addEventListener("change", saveChanges);
}

document.getElementById("reset").addEventListener("click", () => {
  settings = normalizeSettings();
  renderSettings();
  saveChanges();
});
