export const id = "nameHistory";

export function start() {
  let current;
  let frame;
  let stopped = false;

  function attach(card, uuid, username) {
    const original = card.querySelector(".card-body");
    const header = card.querySelector(".card-header");
    if (!original || !header) return null;
    const select = document.createElement("select");
    select.setAttribute("aria-label", "Name History source");
    select.style.marginLeft = "8px";
    for (const [value, label] of [["namemc", "NameMC"], ["crafty", "Crafty"], ["amplitudes", "Amplitudes"]]) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      select.append(option);
    }
    const alternate = original.cloneNode(false);
    alternate.removeAttribute("id");
    alternate.dataset.realNameHistory = "";
    alternate.hidden = true;
    header.append(select);
    original.after(alternate);
    const wasHidden = original.hidden;
    const cached = new Map();
    let request = 0;
    let removed = false;

    function render(history, sourceLabel) {
      const table = document.createElement("table");
      table.className = "table table-borderless mb-0";
      const body = document.createElement("tbody");
      for (const [index, entry] of history.entries()) {
        const row = document.createElement("tr");
        const number = document.createElement("td");
        number.className = "text-center fw-bold";
        number.textContent = history.length - index;
        const name = document.createElement("td");
        const link = document.createElement("a");
        link.href = `/search?q=${encodeURIComponent(entry.name)}`;
        link.textContent = entry.name;
        name.append(link);
        const date = document.createElement("td");
        date.className = "text-end text-nowrap";
        const parsed = new Date(entry.changedAt);
        date.textContent = !entry.changedAt ? "—" : /^\d{4}$/.test(entry.changedAt) ? entry.changedAt :
          Number.isNaN(parsed.getTime()) ? "—" : parsed.toLocaleDateString();
        row.append(number, name, date);
        body.append(row);
      }
      table.append(body);
      alternate.replaceChildren(table);
      if (!history.length) alternate.textContent = `No public name history found on ${sourceLabel}.`;
    }

    async function changeSource() {
      const revision = ++request;
      const source = select.value;
      const sourceLabel = source === "amplitudes" ? "Amplitudes" : "Crafty";
      const useNameMC = select.value === "namemc";
      original.hidden = useNameMC ? wasHidden : true;
      alternate.hidden = useNameMC;
      if (useNameMC) return;
      if (cached.has(source)) { render(cached.get(source), sourceLabel); return; }
      alternate.textContent = `Loading ${sourceLabel} history…`;
      try {
        const result = await chrome.runtime.sendMessage({ type: "loadNameHistory", source, uuid, username });
        if (removed || revision !== request) return;
        if (result?.error || !Array.isArray(result?.entries)) throw new Error(result?.error || `Could not load ${sourceLabel} history.`);
        cached.set(source, result.entries);
        render(result.entries, sourceLabel);
      } catch (error) {
        if (!removed && revision === request) alternate.textContent = error.message || `Could not load ${sourceLabel} history.`;
      }
    }
    select.addEventListener("change", changeSource);
    return { card, uuid, username, original, select, cleanup() {
      removed = true;
      request++;
      select.removeEventListener("change", changeSource);
      original.hidden = wasHidden;
      select.remove();
      alternate.remove();
    } };
  }

  function update() {
    frame = undefined;
    if (stopped) return;
    const card = document.querySelector('table a[translate="no"][href^="/search?q="]')?.closest(".card");
    const uuid = document.querySelector('#uuid-select option[value="standard"]')?.textContent.trim();
    const username = document.querySelector("h1")?.textContent.trim().match(/^[a-z0-9_]{1,16}(?=\s|$)/i)?.[0];
    if (current?.card === card && current?.uuid === uuid && current?.username === username && card?.isConnected && current.original.isConnected && current.select.isConnected) return;
    current?.cleanup();
    current = card && username && /^[0-9a-f-]{36}$/i.test(uuid || "") ? attach(card, uuid, username) : null;
  }
  function scheduleUpdate() {
    if (!stopped && frame === undefined) frame = requestAnimationFrame(update);
  }
  const observer = new MutationObserver(scheduleUpdate);
  observer.observe(document.body, { childList: true, subtree: true });
  scheduleUpdate();
  return () => {
    stopped = true;
    observer.disconnect();
    if (frame !== undefined) cancelAnimationFrame(frame);
    current?.cleanup();
  };
}
