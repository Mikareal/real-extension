export const id = "locatorDot";

export function readProfile(document, pathname) {
  if (!/^\/profile\/[^/]+\/?$/.test(pathname)) return null;
  const heading = document.querySelector("h1");
  const username = heading?.textContent.trim();
  if (!username || !/^[a-z0-9_]{1,16}$/i.test(username)) return null;

  for (const header of document.querySelectorAll(".card-header")) {
    if (header.textContent.trim() !== "Locator Bar Color") continue;
    const value = header.parentElement.querySelector("[data-clipboard-text]");
    const color = value?.getAttribute("data-clipboard-text");
    if (/^#[0-9a-f]{6}$/i.test(color || "")) return { heading, username, color };
  }
  return null;
}

export function start() {
  const imageURL = chrome.runtime.getURL("modules/namemc/assets/locator-bar-dot.png");
  const dot = document.createElement("span");
  dot.setAttribute("role", "img");
  dot.style.cssText = "display:inline-block;width:0.6em;height:0.6em;margin-left:0.15em;vertical-align:0.1em;image-rendering:pixelated;";
  dot.style.backgroundImage = `url("${imageURL}")`;
  dot.style.backgroundSize = "100% 100%";
  dot.style.backgroundRepeat = "no-repeat";
  dot.style.backgroundBlendMode = "multiply";
  dot.style.maskImage = `url("${imageURL}")`;
  dot.style.maskSize = "100% 100%";
  dot.style.maskRepeat = "no-repeat";
  dot.dataset.realLocatorDot = "";
  let frame;
  let stopped = false;

  function update() {
    frame = undefined;
    if (stopped) return;
    const profile = readProfile(document, location.pathname);
    if (!profile) {
      dot.remove();
      return;
    }
    dot.style.backgroundColor = profile.color;
    const description = `${profile.username}: Locator Bar Color ${profile.color}`;
    dot.setAttribute("aria-label", description);
    dot.setAttribute("title", description);
    if (dot.parentElement !== profile.heading) profile.heading.append(dot);
  }

  function scheduleUpdate() {
    if (!stopped && frame === undefined) frame = requestAnimationFrame(update);
  }

  const observer = new MutationObserver(scheduleUpdate);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["data-clipboard-text"]
  });
  scheduleUpdate();

  return () => {
    stopped = true;
    observer.disconnect();
    if (frame !== undefined) cancelAnimationFrame(frame);
    dot.remove();
  };
}
