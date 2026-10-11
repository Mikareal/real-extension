export const id = "hytaleName";

export function availabilityText(result) {
  if (result?.status === "available") return "Available";
  if (["taken", "reserved", "reserved_by_hytale", "prohibited_word", "invalid"].includes(result?.status)) return "Unavailable";
  return "Unknown";
}

export function start() {
  const row = document.createElement("div");
  row.className = "row g-0";
  row.dataset.realHytaleName = "";
  const label = document.createElement("div");
  label.className = "col col-lg-3";
  const title = document.createElement("strong");
  title.textContent = "Hytale";
  label.append(title);
  const value = document.createElement("div");
  value.className = "col";
  const status = document.createElement("span");
  status.setAttribute("role", "status");
  const link = document.createElement("a");
  link.textContent = "hytale.tools";
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  value.append(status, " ", link);
  row.append(label, value);
  let lastUsername;
  let version = 0;
  let frame;
  let stopped = false;

  function update() {
    frame = undefined;
    if (stopped) return;
    const username = document.querySelector("h1")?.textContent.trim().match(/^[a-z0-9_]{1,16}(?=\s|$)/i)?.[0];
    const card = document.querySelector("#uuid-select")?.closest(".card");
    const body = card?.querySelector(".card-body");
    if (!username || !body) {
      row.remove();
      lastUsername = undefined;
      version++;
      return;
    }
    const previous = body.querySelector("[data-real-external-links]") || card.querySelector(".namemc-rank")?.closest(".row");
    if (previous) {
      if (previous.nextElementSibling !== row) previous.after(row);
    } else {
      const divider = body.querySelector("hr");
      if (divider) {
        if (divider.previousElementSibling !== row) divider.before(row);
      } else if (body.lastElementChild !== row) body.append(row);
    }
    if (username === lastUsername) return;
    lastUsername = username;
    const request = ++version;
    link.href = `https://hytale.tools/profile/${encodeURIComponent(username)}`;
    status.textContent = "Checking…";
    chrome.runtime.sendMessage({ type: "checkHytaleName", username })
      .then(result => {
        if (!stopped && request === version) status.textContent = availabilityText(result);
      })
      .catch(() => {
        if (!stopped && request === version) status.textContent = "Unknown";
      });
  }

  function scheduleUpdate() {
    if (!stopped && frame === undefined) frame = requestAnimationFrame(update);
  }
  const observer = new MutationObserver(scheduleUpdate);
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  scheduleUpdate();
  return () => {
    stopped = true;
    observer.disconnect();
    if (frame !== undefined) cancelAnimationFrame(frame);
    row.remove();
  };
}
