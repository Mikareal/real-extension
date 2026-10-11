export const id = "ticketTextFix";

export function start() {
  const fields = new Map();
  const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
  let frame;

  function grow(textarea) {
    if (!textarea.getBoundingClientRect().width) return;
    textarea.style.height = "auto";
    const style = getComputedStyle(textarea);
    textarea.style.height = `${textarea.scrollHeight + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth)}px`;
  }

  function enhance(input) {
    const textarea = document.createElement("textarea");
    for (const attribute of input.attributes) {
      if (!["type", "value", "name", "style"].includes(attribute.name)) textarea.setAttribute(attribute.name, attribute.value);
    }
    const originalStyle = input.getAttribute("style");
    const originalId = input.getAttribute("id");
    const required = input.required;
    const focused = document.activeElement === input;
    const height = input.getBoundingClientRect().height;
    textarea.value = input.value;
    textarea.rows = 1;
    if (!textarea.hasAttribute("aria-label")) textarea.setAttribute("aria-label", input.name === "subject" ? "Subject" : "Description");
    textarea.style.cssText = `width:100%;box-sizing:border-box;resize:none;overflow:hidden;white-space:pre-wrap;overflow-wrap:anywhere;min-height:${height}px;`;
    input.removeAttribute("id");
    input.required = false;
    input.style.display = "none";
    input.after(textarea);
    if (focused) textarea.focus();

    function onInput() {
      // Riot uses single-line inputs; keep the full text and normalize pasted newlines.
      setValue.call(input, textarea.value.replace(/[\r\n]+/g, " "));
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      textarea.value = input.value;
      grow(textarea);
    }
    textarea.addEventListener("input", onInput);
    const resize = new ResizeObserver(() => grow(textarea));
    resize.observe(textarea);
    const cleanup = () => {
      resize.disconnect();
      textarea.removeEventListener("input", onInput);
      if (originalStyle === null) input.removeAttribute("style");
      else input.setAttribute("style", originalStyle);
      if (originalId !== null) input.id = originalId;
      input.required = required;
      textarea.remove();
    };
    fields.set(input, { textarea, cleanup });
    grow(textarea);
  }

  function update() {
    frame = undefined;
    for (const [input, field] of fields) {
      if (!input.isConnected || !field.textarea.isConnected) {
        field.cleanup();
        fields.delete(input);
      } else {
        if (field.textarea.disabled !== input.disabled) field.textarea.disabled = input.disabled;
        if (field.textarea.readOnly !== input.readOnly) field.textarea.readOnly = input.readOnly;
        if (field.textarea.value !== input.value) field.textarea.value = input.value;
        grow(field.textarea);
      }
    }
    for (const input of document.querySelectorAll('input[name="subject"], input[name="description"]')) {
      if (!fields.has(input)) enhance(input);
    }
  }

  function scheduleUpdate() {
    if (frame === undefined) frame = requestAnimationFrame(update);
  }
  const observer = new MutationObserver(scheduleUpdate);
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["disabled", "readonly", "value"] });
  document.addEventListener("reset", scheduleUpdate, true);
  scheduleUpdate();
  return () => {
    observer.disconnect();
    document.removeEventListener("reset", scheduleUpdate, true);
    if (frame !== undefined) cancelAnimationFrame(frame);
    for (const field of fields.values()) field.cleanup();
    fields.clear();
  };
}
