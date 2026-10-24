(() => {
  let enabled = false;
  let current;

  function getViewer(event) {
    const canvas = event.target;
    if (!canvas?.matches?.("canvas.skin-3d, canvas#skin_container")) return;
    const extras = window.skinViewer;
    const native = typeof skin3d !== "undefined" ? skin3d : window.skin3d;
    const viewer = extras?.canvas === canvas ? extras : native?.canvas === canvas ? native : null;
    if (!viewer?.camera) return;
    if (current?.viewer !== viewer) {
      current = {
        viewer, canvas, extras: viewer === extras,
        zoom: viewer.camera.zoom,
        position: viewer.camera.position.clone(),
        target: viewer.controls?.target.clone(),
        rotation: viewer.playerWrapper?.rotation.clone(),
        theta: Number(canvas.getAttribute("data-theta") || 30),
        phi: Number(canvas.getAttribute("data-phi") || 21)
      };
    }
    return current;
  }

  function draw(state) {
    state.viewer.camera.updateProjectionMatrix();
    if (state.extras) state.viewer.render();
    else renderSkin();
  }

  function zoom(event) {
    if (event.ctrlKey || !event.deltaY) return;
    const state = getViewer(event);
    if (!state) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? state.canvas.clientHeight : 1);
    const camera = state.viewer.camera;
    camera.zoom = Math.max(state.zoom * 0.5, Math.min(state.zoom * 3, camera.zoom * Math.exp(-Math.max(-200, Math.min(200, delta)) * 0.002)));
    draw(state);
  }

  function reset(event) {
    const state = getViewer(event);
    if (!state) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const viewer = state.viewer;
    viewer.camera.zoom = state.zoom;
    if (state.extras) {
      viewer.camera.position.copy(state.position);
      viewer.controls.target.copy(state.target);
      viewer.playerWrapper.rotation.copy(state.rotation);
      viewer.controls.update();
    } else {
      viewer.theta = state.theta;
      viewer.phi = state.phi;
      viewer.dragState = {};
      state.canvas.setAttribute("data-theta", String(state.theta));
      state.canvas.setAttribute("data-phi", String(state.phi));
    }
    draw(state);
  }

  function remember(event) { getViewer(event); }

  window.addEventListener("real-extension:namemc-viewer", event => {
    if ((event.detail === true) === enabled) return;
    enabled = event.detail === true;
    if (enabled) {
      window.addEventListener("pointerdown", remember, true);
      window.addEventListener("wheel", zoom, { capture: true, passive: false });
      window.addEventListener("dblclick", reset, true);
    } else {
      window.removeEventListener("pointerdown", remember, true);
      window.removeEventListener("wheel", zoom, true);
      window.removeEventListener("dblclick", reset, true);
      if (current) {
        current.viewer.camera.zoom = current.zoom;
        draw(current);
      }
      current = undefined;
    }
  });
})();
