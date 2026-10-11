import(chrome.runtime.getURL("modules/riot/page.js"))
  .then(({ startRiot }) => startRiot())
  .catch(error => console.error("Could not start Riot module:", error));
