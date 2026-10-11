export const id = "externalSites";

export function profileLinks(username) {
  const name = encodeURIComponent(username);
  return [
    ["capes.me", `https://capes.me/capes?user=${name}`],
    ["LABY", `https://laby.net/@${name}`],
    ["Livz", `https://livzmc.net/user/${name}`],
    ["25Karma", `https://25karma.xyz/player/${name}`],
    ["Crafty", `https://crafty.gg/@${name}`],
    ["mcindex", `https://mcindex.gg/player/${name}`],
    ["Badlion", `https://www.badlion.net/profile/minecraft/${name}`],
    ["SkinMC", `https://skinmc.net/profile/${name}`],
    ["mcprofiles", `https://mcprofiles.me/player/${name}`],
    ["MinecraftUUID", `https://minecraftuuid.com/player/${name}`],
    ["Plancke", `https://plancke.io/hypixel/player/stats/${name}`],
    ["minecraft-statistic", `https://minecraft-statistic.net/en/player/${name}.html`]
  ];
}

export function start() {
  const row = document.createElement("div");
  row.className = "row g-0";
  row.dataset.realExternalLinks = "";
  const label = document.createElement("div");
  label.className = "col col-lg-3";
  const title = document.createElement("strong");
  title.textContent = "Links";
  label.append(title);
  const links = document.createElement("div");
  links.className = "col";
  row.append(label, links);
  let lastUsername;
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
      return;
    }
    if (username !== lastUsername) {
      links.replaceChildren();
      for (const [label, url] of profileLinks(username)) {
        if (links.childNodes.length) links.append(", ");
        const link = document.createElement("a");
        link.textContent = label;
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        links.append(link);
      }
      lastUsername = username;
    }
    const rank = card.querySelector(".namemc-rank")?.closest(".row");
    if (rank) {
      if (rank.nextElementSibling !== row) rank.after(row);
    } else {
      const divider = body.querySelector("[data-real-hytale-name]") || body.querySelector("hr");
      if (divider) {
        if (divider.previousElementSibling !== row) divider.before(row);
      } else if (body.lastElementChild !== row) {
        body.append(row);
      }
    }
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
