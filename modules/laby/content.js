import(chrome.runtime.getURL("modules/laby/page.js"))
  .then(({ startLaby }) => startLaby())
  .catch(error => console.error("Could not start Laby module:", error));
