import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import "./AnimatedProductGrid.scss";

const getProductKey = (item) => item.id;
const motionQuery = "(prefers-reduced-motion: reduce)";
const timing = { duration: 440, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)", fill: "both" };
const sameItems = (first, second) => first.length === second.length && first.every((item, index) => item === second[index]);

const useReducedMotion = () => {
  const [reduced, setReduced] = useState(() => Boolean(window.matchMedia?.(motionQuery).matches));
  useEffect(() => {
    const media = window.matchMedia?.(motionQuery);
    if (!media) return undefined;
    const update = () => setReduced(media.matches);
    update();
    if (media.addEventListener) media.addEventListener("change", update);
    else media.addListener?.(update);
    return () => {
      if (media.removeEventListener) media.removeEventListener("change", update);
      else media.removeListener?.(update);
    };
  }, []);
  return reduced;
};

const isVisible = (box) => box.width > 0 && box.height > 0 &&
  box.bottom > 0 && box.top < window.innerHeight && box.right > 0 && box.left < window.innerWidth;

const measure = (grid, nodes) => {
  const box = grid.getBoundingClientRect();
  const positions = new Map();
  nodes.forEach((node, key) => {
    const rect = node.getBoundingClientRect();
    positions.set(key, {
      node,
      x: rect.left - box.left - grid.clientLeft + grid.scrollLeft,
      y: rect.top - box.top - grid.clientTop + grid.scrollTop,
      width: rect.width,
      height: rect.height,
      visible: isVisible(rect),
      opacity: Number.parseFloat(window.getComputedStyle(node).opacity || "1"),
    });
  });
  return { positions, height: box.height, visible: isVisible(box) };
};

const prepareGhost = (node) => {
  const clone = node.cloneNode(true);
  clone.removeAttribute("data-grid-key");
  clone.classList.add("animatedProductGrid__ghost");
  clone.setAttribute("data-grid-exit", "");
  clone.setAttribute("aria-hidden", "true");
  clone.setAttribute("inert", "");
  clone.inert = true;
  [clone, ...clone.querySelectorAll("*")].forEach((element) => {
    element.removeAttribute("id");
    element.style.viewTransitionName = "none";
    if (element.matches("a, button, input, select, textarea, [tabindex], [contenteditable]")) {
      element.setAttribute("tabindex", "-1");
      if (element.hasAttribute("contenteditable")) element.setAttribute("contenteditable", "false");
    }
  });
  return clone;
};

const AnimatedProductGrid = ({
  items = [],
  renderItem,
  getKey = getProductKey,
  className = "",
  fallback = null,
  animateChanges = true,
  ...domProps
}) => {
  const [displayedItems, setDisplayedItems] = useState(items);
  const gridRef = useRef(null);
  const nodesRef = useRef(new Map());
  const callbacksRef = useRef(new Map());
  const animationsRef = useRef(new Map());
  const ghostsRef = useRef(new Set());
  const seenRef = useRef(new Set());
  const observerRef = useRef(null);
  const observerFailedRef = useRef(false);
  const pendingRef = useRef(null);
  const mountedRef = useRef(false);
  const hasProductsRef = useRef(false);
  const orderRef = useRef(new Map());
  const reduced = useReducedMotion();
  const enabled = !reduced && typeof window.IntersectionObserver === "function" &&
    typeof Element.prototype.animate === "function";
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  orderRef.current = new Map(displayedItems.map((item, index) => [String(getKey(item)), index]));

  const stopAll = useCallback(() => {
    [...animationsRef.current.values()].forEach((stop) => stop());
    ghostsRef.current.forEach((ghost) => ghost.remove());
    ghostsRef.current.clear();
  }, []);

  const animate = useCallback((node, keyframes, options = {}, onDone) => {
    if (!enabledRef.current || observerFailedRef.current) {
      onDone?.();
      return;
    }
    let animation;
    const settings = { ...timing, ...options };
    try {
      animation = node.animate(keyframes, settings);
    } catch {
      onDone?.();
      return;
    }
    if (!animation || typeof animation.cancel !== "function") {
      onDone?.();
      return;
    }
    let stopped = false;
    let watchdog;
    const stop = () => {
      if (stopped) return;
      stopped = true;
      clearTimeout(watchdog);
      animationsRef.current.delete(animation);
      animation.onfinish = null;
      animation.oncancel = null;
      animation.cancel();
      onDone?.();
    };
    animationsRef.current.set(animation, stop);
    animation.onfinish = stop;
    animation.oncancel = stop;
    watchdog = setTimeout(stop, Number(settings.duration) + Number(settings.delay || 0) + 100);
  }, []);

  const enter = useCallback((node, index) => {
    animate(node, [
      { opacity: 0, transform: "translateY(18px)" },
      { opacity: 1, transform: "translateY(0)" },
    ], { delay: Math.min(index * 36, 200) });
  }, [animate]);

  const ensureObserver = useCallback(() => {
    if (observerRef.current || observerFailedRef.current || !enabledRef.current) return;
    try {
      observerRef.current = new window.IntersectionObserver((entries) => {
        if (!mountedRef.current || !enabledRef.current) return;
        const visible = entries.filter((entry) => {
          const key = entry.target.dataset.gridKey;
          const box = entry.target.getBoundingClientRect();
          return entry.isIntersecting && nodesRef.current.get(key) === entry.target &&
            !seenRef.current.has(key) && box.width > 0 && box.height > 0;
        }).sort((first, second) => orderRef.current.get(first.target.dataset.gridKey) - orderRef.current.get(second.target.dataset.gridKey));
        visible.forEach((entry, index) => {
          seenRef.current.add(entry.target.dataset.gridKey);
          observerRef.current?.unobserve(entry.target);
          enter(entry.target, index);
        });
      }, { rootMargin: "0px 0px 80px 0px", threshold: 0 });
    } catch {
      observerFailedRef.current = true;
      stopAll();
    }
  }, [enter, stopAll]);

  const itemRef = useCallback((key) => {
    if (!callbacksRef.current.has(key)) {
      callbacksRef.current.set(key, (node) => {
        const previous = nodesRef.current.get(key);
        if (previous && previous !== node) observerRef.current?.unobserve(previous);
        if (node) nodesRef.current.set(key, node);
        else nodesRef.current.delete(key);
      });
    }
    return callbacksRef.current.get(key);
  }, []);

  useLayoutEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      observerRef.current?.disconnect();
      observerRef.current = null;
      pendingRef.current = null;
      stopAll();
    };
  }, [stopAll]);

  // Keep the old React children for one layout pass so measurements precede
  // their replacement. Rapid updates start at the current animated positions.
  useLayoutEffect(() => {
    if (sameItems(items, displayedItems)) return;
    const nextKeys = new Set(items.map((item) => String(getKey(item))));
    const before = enabled && animateChanges ? measure(gridRef.current, nodesRef.current) : null;
    const removed = [];
    before?.positions.forEach((position, key) => {
      if (!nextKeys.has(key) && position.visible && position.opacity > 0.01) {
        removed.push({ ...position, clone: prepareGhost(position.node) });
      }
    });
    stopAll();
    seenRef.current.forEach((key) => { if (!nextKeys.has(key)) seenRef.current.delete(key); });
    pendingRef.current = before ? { ...before, removed } : null;
    setDisplayedItems(items);
  }, [items, displayedItems, getKey, enabled, animateChanges, stopAll]);

  useLayoutEffect(() => {
    const grid = gridRef.current;
    const before = pendingRef.current;
    pendingRef.current = null;
    if (!enabled) {
      observerRef.current?.disconnect();
      observerRef.current = null;
      stopAll();
      displayedItems.forEach((item) => seenRef.current.add(String(getKey(item))));
      return;
    }
    ensureObserver();
    const after = measure(grid, nodesRef.current);
    const firstProducts = !hasProductsRef.current;
    if (displayedItems.length) hasProductsRef.current = true;

    const markSeen = (key, node) => {
      seenRef.current.add(key);
      observerRef.current?.unobserve(node);
    };

    if (before && animateChanges) {
      const entering = [];
      after.positions.forEach((position, key) => {
        const previous = before.positions.get(key);
        if (previous?.visible && position.visible) {
          const dx = previous.x - position.x;
          const dy = previous.y - position.y;
          if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5 || previous.opacity < 0.99) {
            markSeen(key, position.node);
            animate(position.node, [
              { transform: `translate(${dx}px, ${dy}px)`, opacity: previous.opacity },
              { transform: "translate(0, 0)", opacity: 1 },
            ]);
          }
        } else if (position.visible && !firstProducts && (!previous || !seenRef.current.has(key))) {
          markSeen(key, position.node);
          entering.push(position.node);
        }
      });
      entering.forEach(enter);

      before.removed.forEach(({ clone, x, y, width, height, opacity }) => {
        Object.assign(clone.style, { left: x + "px", top: y + "px", width: width + "px", height: height + "px" });
        ghostsRef.current.add(clone);
        grid.appendChild(clone);
        animate(clone, [
          { opacity, transform: "translateY(0)" },
          { opacity: 0, transform: "translateY(-10px)" },
        ], { duration: 240 }, () => { ghostsRef.current.delete(clone); clone.remove(); });
      });

      if ((before.visible || after.visible) && Math.abs(before.height - after.height) > 1) {
        grid.setAttribute("data-grid-layout", "running");
        animate(grid, [{ height: before.height + "px" }, { height: after.height + "px" }], {},
          () => grid.removeAttribute("data-grid-layout"));
      }
    }

    nodesRef.current.forEach((node, key) => {
      if (!seenRef.current.has(key)) {
        try { observerRef.current?.observe(node); }
        catch {
          observerFailedRef.current = true;
          observerRef.current?.disconnect();
          observerRef.current = null;
          stopAll();
        }
      }
    });
    callbacksRef.current.forEach((_, key) => {
      if (!nodesRef.current.has(key)) callbacksRef.current.delete(key);
    });
  }, [displayedItems, enabled, animateChanges, getKey, animate, enter, ensureObserver, stopAll]);

  return (
    <div {...domProps} className={["animatedProductGrid", className].filter(Boolean).join(" ")} ref={gridRef}
      onFocusCapture={(event) => {
        const node = event.target.closest(".animatedProductGrid__item");
        if (node?.parentElement === gridRef.current) {
          seenRef.current.add(node.dataset.gridKey);
          observerRef.current?.unobserve(node);
        }
        stopAll();
        domProps.onFocusCapture?.(event);
      }}>
      {displayedItems.map((item) => {
        const key = String(getKey(item));
        return <div className="animatedProductGrid__item" data-grid-key={key} ref={itemRef(key)} key={key}>{renderItem(item)}</div>;
      })}
      {!displayedItems.length && fallback}
    </div>
  );
};

export default AnimatedProductGrid;
