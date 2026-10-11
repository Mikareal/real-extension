import(chrome.runtime.getURL("modules/namemc/page.js"))
  .then(({ startNameMC }) => startNameMC())
  .catch(error => console.error("Could not start NameMC module:", error));
