let currentTransition = null;

const bounds = (element) => {
  const { left, top, width, height } = element.getBoundingClientRect();
  return { left, top, width, height };
};
const frameStyles = ({ left, top, width, height }, borderRadius) => ({
  left: left + "px", top: top + "px", width: width + "px", height: height + "px", borderRadius,
});
const sameBounds = (first, second) => first && ["left", "top", "width", "height", "scrollY"]
  .every((key) => Math.abs(first[key] - second[key]) < 0.5);

export const startProductImageTransition = (card, productId) => {
  const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  if (!card || media?.matches || typeof Element.prototype.animate !== "function") return null;
  const sourceFrame = card.querySelector(".image");
  const source = [...card.querySelectorAll(".image img")]
    .filter((image) => image.complete && image.naturalWidth > 0)
    .sort((first, second) => Number(getComputedStyle(second).opacity) - Number(getComputedStyle(first).opacity))[0];
  if (!sourceFrame || !source) return null;
  const sourceBounds = bounds(sourceFrame);
  if (!sourceBounds.width || !sourceBounds.height) return null;

  currentTransition?.cancel();
  const id = String(productId);
  const src = source.getAttribute("src");
  const origin = window.location.pathname;
  const destination = "/product/" + id;
  const sourceVisibility = sourceFrame.style.visibility;
  const sourceStyle = getComputedStyle(source);
  const sourceRadius = getComputedStyle(sourceFrame).borderRadius;
  const node = document.createElement("div");
  const image = document.createElement("img");
  node.className = "productImageTransition";
  node.dataset.productId = id;
  node.setAttribute("aria-hidden", "true");
  node.inert = true;
  Object.assign(node.style, frameStyles(sourceBounds, sourceRadius));
  image.src = src;
  image.alt = "";
  image.style.objectPosition = sourceStyle.objectPosition;
  image.style.transform = sourceStyle.transform;
  node.appendChild(image);
  document.body.appendChild(node);
  sourceFrame.style.visibility = "hidden";

  let disposed = false;
  let finishing = false;
  let arrived = false;
  let frame = null;
  let previousBounds = null;
  let stableFrames = 0;
  let waitingImage = null;
  let target = null;
  let targetVisibility = "";
  const animations = new Set();
  const controller = { src, cancel: dispose };
  const observer = new MutationObserver(scan);
  let timer = setTimeout(fadeOut, 3500);
  currentTransition = controller;

  function dispose() {
    if (disposed) return;
    disposed = true;
    clearTimeout(timer);
    if (frame !== null) cancelAnimationFrame(frame);
    observer.disconnect();
    for (const animation of animations) animation.cancel();
    animations.clear();
    waitingImage?.removeEventListener("load", scan);
    waitingImage?.removeEventListener("error", fadeOut);
    window.removeEventListener("popstate", dispose);
    window.removeEventListener("resize", dispose);
    window.removeEventListener("wheel", dispose, true);
    window.removeEventListener("touchstart", dispose, true);
    window.removeEventListener("pointerdown", dispose, true);
    window.removeEventListener("keydown", dispose, true);
    media?.removeEventListener?.("change", dispose);
    sourceFrame.style.visibility = sourceVisibility;
    if (target) target.style.visibility = targetVisibility;
    node.remove();
    if (currentTransition === controller) currentTransition = null;
  }

  function play(element, frames, options) {
    try {
      const animation = element.animate(frames, options);
      if (typeof animation?.cancel !== "function" || typeof animation.finished?.then !== "function") return null;
      animations.add(animation);
      animation.finished.catch(() => {});
      return animation;
    } catch { return null; }
  }

  function fadeOut() {
    if (disposed || finishing) { if (finishing) dispose(); return; }
    finishing = true;
    observer.disconnect();
    if (frame !== null) cancelAnimationFrame(frame);
    if (target) target.style.visibility = targetVisibility;
    clearTimeout(timer);
    timer = setTimeout(dispose, 240);
    const animation = play(node, [{ opacity: 1 }, { opacity: 0 }], { duration: 140, easing: "ease-out", fill: "forwards" });
    if (!animation) { dispose(); return; }
    animation.finished.then(dispose, dispose);
  }

  function findTarget() {
    return [...document.querySelectorAll("img[data-product-image]")]
      .find((element) => element.dataset.productImage === id && element.getAttribute("src") === src);
  }

  function moveToProduct(candidate, last) {
    finishing = true;
    observer.disconnect();
    clearTimeout(timer);
    timer = setTimeout(dispose, 700);
    const duration = 420;
    const details = play(image, [
      { objectPosition: image.style.objectPosition, transform: image.style.transform },
      { objectPosition: getComputedStyle(candidate).objectPosition, transform: "none" },
    ], { duration, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" });
    const movement = play(node, [
      frameStyles(sourceBounds, sourceRadius),
      frameStyles(last, getComputedStyle(candidate.closest(".product__main-image") || candidate).borderRadius),
    ], { duration, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" });
    if (!details || !movement) { dispose(); return; }
    movement.finished.then(() => {
      if (disposed) return;
      target.style.visibility = targetVisibility;
      const fade = play(node, [{ opacity: 1 }, { opacity: 0 }], { duration: 100, fill: "forwards" });
      if (!fade) { dispose(); return; }
      fade.finished.then(dispose, dispose);
    }, dispose);
  }

  // Route scroll resets on the next frame. Measure only the final photo, after
  // both its layout and scroll have settled; a skeleton is never a destination.
  function settleTarget() {
    frame = null;
    if (disposed || finishing) return;
    if (window.location.pathname !== destination) { dispose(); return; }
    const candidate = findTarget();
    if (!candidate?.complete || !candidate.naturalWidth) { previousBounds = null; stableFrames = 0; scan(); return; }
    if (target !== candidate) {
      if (target) target.style.visibility = targetVisibility;
      target = candidate;
      targetVisibility = target.style.visibility;
      target.style.visibility = "hidden";
      previousBounds = null;
      stableFrames = 0;
    }
    const last = bounds(candidate.closest(".product__main-image") || candidate);
    const headerBottom = Math.max(0, document.querySelector(".navbar")?.getBoundingClientRect().bottom || 0);
    const measured = { ...last, scrollY: window.scrollY };
    const visible = last.width > 0 && last.height > 0 && last.top >= headerBottom - 1 && last.top < window.innerHeight;
    stableFrames = visible && sameBounds(previousBounds, measured) ? stableFrames + 1 : 0;
    previousBounds = measured;
    if (stableFrames >= 2) moveToProduct(candidate, last);
    else frame = requestAnimationFrame(settleTarget);
  }

  function scan() {
    if (disposed || finishing) return;
    const pathname = window.location.pathname;
    if (pathname !== destination) {
      if (!arrived && pathname === origin) return;
      dispose();
      return;
    }
    arrived = true;
    if (document.querySelector(".product--state .asyncState")) { fadeOut(); return; }
    const candidate = findTarget();
    if (!candidate) return;
    if (!candidate.complete || !candidate.naturalWidth) {
      if (waitingImage !== candidate) {
        waitingImage?.removeEventListener("load", scan);
        waitingImage?.removeEventListener("error", fadeOut);
        waitingImage = candidate;
        candidate.addEventListener("load", scan, { once: true });
        candidate.addEventListener("error", fadeOut, { once: true });
      }
      return;
    }
    if (frame === null) frame = requestAnimationFrame(settleTarget);
  }

  observer.observe(document.getElementById("main-content") || document.body, {
    childList: true, subtree: true, attributes: true, attributeFilter: ["src", "data-product-image"],
  });
  window.addEventListener("popstate", dispose);
  window.addEventListener("resize", dispose);
  window.addEventListener("wheel", dispose, { capture: true, passive: true });
  window.addEventListener("touchstart", dispose, { capture: true, passive: true });
  window.addEventListener("pointerdown", dispose, { capture: true, passive: true });
  window.addEventListener("keydown", dispose, true);
  media?.addEventListener?.("change", dispose);
  scan();
  return controller;
};
