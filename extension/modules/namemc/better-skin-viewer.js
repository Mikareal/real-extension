export const id = "betterSkinViewer";

export function start() {
  window.dispatchEvent(new CustomEvent("real-extension:namemc-viewer", { detail: true }));
  return () => window.dispatchEvent(new CustomEvent("real-extension:namemc-viewer", { detail: false }));
}
