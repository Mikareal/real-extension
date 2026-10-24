// Run in the page's world so the fix can reach Laby's viewer objects.
(() => {
  const patched = new Map();
  let enabled = false;
  let observer;
  let frame;

  function patch(player) {
    if (!player || typeof player.addLayer !== "function" || typeof player.removeLayer !== "function" ||
        typeof player.getLayer !== "function" || patched.has(player)) return;
    const original = player.addLayer;
    const descriptor = Object.getOwnPropertyDescriptor(player, "addLayer");
    function addLayer(layer, ...args) {
      // Removal disposes the layer; Laby reuses it when switching Elytra off.
      if ((layer?.name === "cape" || layer?.name === "cloak") && layer.disposed === true) {
        layer.disposed = false;
      }
      return original.call(this, layer, ...args);
    }
    player.addLayer = addLayer;
    patched.set(player, { original, descriptor, addLayer });
  }

  function scan() {
    for (const canvas of document.querySelectorAll("canvas")) {
      const key = Object.keys(canvas).find(key => key.startsWith("__reactFiber$"));
      let fiber = key && canvas[key];
      // PlayerRenderer stores the viewer in a React ref above its canvas.
      for (let depth = 0; fiber && depth < 50; depth++, fiber = fiber.return) {
        patch(fiber.memoizedProps?.playerRef?.current);
        let hook = fiber.memoizedState;
        for (let index = 0; hook && index < 100; index++, hook = hook.next) {
          patch(hook.memoizedState?.current);
        }
      }
    }
  }

  function scheduleScan() {
    if (frame === undefined) frame = requestAnimationFrame(() => {
      frame = undefined;
      if (enabled) scan();
    });
  }

  window.addEventListener("real-extension:laby-cape", event => {
    const next = event.detail === true;
    if (next === enabled) return;
    enabled = next;
    if (enabled) {
      observer = new MutationObserver(scheduleScan);
      observer.observe(document.body, { childList: true, subtree: true });
      // Scan before mouse and keyboard controls use a newly loaded viewer.
      window.addEventListener("pointerdown", scan, true);
      window.addEventListener("keydown", scan, true);
      scheduleScan();
    } else {
      observer.disconnect();
      window.removeEventListener("pointerdown", scan, true);
      window.removeEventListener("keydown", scan, true);
      if (frame !== undefined) cancelAnimationFrame(frame);
      frame = undefined;
      for (const [player, entry] of patched) {
        if (player.addLayer !== entry.addLayer) continue;
        if (entry.descriptor) Object.defineProperty(player, "addLayer", entry.descriptor);
        else delete player.addLayer;
      }
      patched.clear();
    }
  });
})();
