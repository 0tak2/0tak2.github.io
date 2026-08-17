const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function clampPosition({ x, y, width, height, viewportWidth, viewportHeight, margin = 12 }) {
  return {
    x: clamp(x, margin, Math.max(margin, viewportWidth - width - margin)),
    y: clamp(y, margin, Math.max(margin, viewportHeight - height - margin)),
  };
}

export function getDraggedPosition({ startCard, startPointer, pointer, width, height, viewportWidth, viewportHeight }) {
  return clampPosition({
    x: startCard.x + pointer.x - startPointer.x,
    y: startCard.y + pointer.y - startPointer.y,
    width,
    height,
    viewportWidth,
    viewportHeight,
  });
}

export function getKeyboardDelta(key, step = 12) {
  const deltas = {
    ArrowUp: { x: 0, y: -step },
    ArrowDown: { x: 0, y: step },
    ArrowLeft: { x: -step, y: 0 },
    ArrowRight: { x: step, y: 0 },
  };

  return deltas[key] ?? null;
}

export function setupContactCard(card) {
  if (!card) return;

  const handle = card.querySelector(".contact-card__handle");
  const panel = card.querySelector(".contact-card__panel");
  let pointerId = null;
  let startPointer = { x: 0, y: 0 };
  let startCard = { x: 0, y: 0 };
  let moved = false;
  let suppressClick = false;

  const placeCard = (x, y) => {
    const rect = card.getBoundingClientRect();
    const position = clampPosition({
      x,
      y,
      width: rect.width,
      height: rect.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    });

    card.style.position = "fixed";
    card.style.inset = "auto";
    card.style.left = `${position.x}px`;
    card.style.top = `${position.y}px`;
  };

  const onPointerDown = (event) => {
    if (event.button !== 0) return;
    const rect = card.getBoundingClientRect();
    pointerId = event.pointerId;
    startPointer = { x: event.clientX, y: event.clientY };
    startCard = { x: rect.left, y: rect.top };
    moved = false;
    handle.setPointerCapture(pointerId);
  };

  const onPointerMove = (event) => {
    if (event.pointerId !== pointerId) return;
    const deltaX = event.clientX - startPointer.x;
    const deltaY = event.clientY - startPointer.y;
    if (Math.hypot(deltaX, deltaY) > 4) moved = true;
    if (moved) {
      const rect = card.getBoundingClientRect();
      const position = getDraggedPosition({
        startCard,
        startPointer,
        pointer: { x: event.clientX, y: event.clientY },
        width: rect.width,
        height: rect.height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      });
      placeCard(position.x, position.y);
    }
  };

  const onPointerUp = (event) => {
    if (event.pointerId !== pointerId) return;
    if (handle.hasPointerCapture(pointerId)) handle.releasePointerCapture(pointerId);
    suppressClick = moved;
    pointerId = null;
  };

  const onClick = (event) => {
    if (suppressClick) {
      event.preventDefault();
      suppressClick = false;
      return;
    }

    const expanded = handle.getAttribute("aria-expanded") === "true";
    handle.setAttribute("aria-expanded", String(!expanded));
    panel.hidden = expanded;
    if (!expanded) {
      requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        placeCard(rect.left, rect.top);
      });
    }
  };

  const onResize = () => {
    const rect = card.getBoundingClientRect();
    placeCard(rect.left, rect.top);
  };

  const onKeyDown = (event) => {
    const delta = getKeyboardDelta(event.key);
    if (!delta) return;
    const rect = card.getBoundingClientRect();
    placeCard(rect.left + delta.x, rect.top + delta.y);
    event.preventDefault();
  };

  handle.addEventListener("pointerdown", onPointerDown);
  handle.addEventListener("pointermove", onPointerMove);
  handle.addEventListener("pointerup", onPointerUp);
  handle.addEventListener("pointercancel", onPointerUp);
  handle.addEventListener("click", onClick);
  handle.addEventListener("keydown", onKeyDown);
  window.addEventListener("resize", onResize, { passive: true });
}

let topOverlayLayer = 30;

export function setupDraggableOverlay(card) {
  if (!card) return;

  const handle = card.querySelector(".pet-card__handle");
  let pointerId = null;
  let startPointer = { x: 0, y: 0 };
  let startCard = { x: 0, y: 0 };

  const placeCard = (x, y) => {
    const rect = card.getBoundingClientRect();
    const position = clampPosition({
      x,
      y,
      width: rect.width,
      height: rect.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    });

    card.style.position = "fixed";
    card.style.inset = "auto";
    card.style.left = `${position.x}px`;
    card.style.top = `${position.y}px`;
  };

  const onPointerDown = (event) => {
    if (event.button !== 0) return;
    const rect = card.getBoundingClientRect();
    pointerId = event.pointerId;
    startPointer = { x: event.clientX, y: event.clientY };
    startCard = { x: rect.left, y: rect.top };
    topOverlayLayer += 1;
    card.style.zIndex = String(topOverlayLayer);
    handle.setPointerCapture(pointerId);
  };

  const onPointerMove = (event) => {
    if (event.pointerId !== pointerId) return;
    const rect = card.getBoundingClientRect();
    const position = getDraggedPosition({
      startCard,
      startPointer,
      pointer: { x: event.clientX, y: event.clientY },
      width: rect.width,
      height: rect.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    });
    placeCard(position.x, position.y);
  };

  const onPointerUp = (event) => {
    if (event.pointerId !== pointerId) return;
    if (handle.hasPointerCapture(pointerId)) handle.releasePointerCapture(pointerId);
    pointerId = null;
  };

  const onKeyDown = (event) => {
    const delta = getKeyboardDelta(event.key);
    if (!delta) return;
    const rect = card.getBoundingClientRect();
    topOverlayLayer += 1;
    card.style.zIndex = String(topOverlayLayer);
    placeCard(rect.left + delta.x, rect.top + delta.y);
    event.preventDefault();
  };

  handle.addEventListener("pointerdown", onPointerDown);
  handle.addEventListener("pointermove", onPointerMove);
  handle.addEventListener("pointerup", onPointerUp);
  handle.addEventListener("pointercancel", onPointerUp);
  handle.addEventListener("keydown", onKeyDown);
}
