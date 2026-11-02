import { useLayoutEffect } from "react";

const TARGETS = ".featuredProducts .top, .categories__header, .categories__tile";
const REVEAL_ATTRIBUTE = "data-scroll-reveal";
const DURATION = 600;
const DISTANCE = 20;

/**
 * Reveals homepage sections once, without wrappers or an initially hidden state.
 * Keeping the baseline visible makes failed/unsupported animation APIs fail open.
 */
const useScrollReveal = (rootRef) => {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || typeof window.IntersectionObserver !== "function" ||
      typeof Element.prototype.animate !== "function") return undefined;

    const motionPreference = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (motionPreference?.matches) return undefined;

    const targets = [...root.querySelectorAll(TARGETS)];
    const tiles = [...root.querySelectorAll(".categories__tile")];
    const delays = new Map(tiles.map((tile, index) => [tile, Math.min(index * 40, 200)]));
    const seen = new Set();
    const active = new Map();
    let observer;
    let enabled = true;
    let disposed = false;

    const showImmediately = (target) => {
      seen.add(target);
      observer?.unobserve(target);
      target.removeAttribute(REVEAL_ATTRIBUTE);

      const running = active.get(target);
      if (!running) return;
      active.delete(target);
      clearTimeout(running.timer);
      running.animation.onfinish = null;
      running.animation.oncancel = null;
      running.animation.cancel();
    };

    const startReveal = (target) => {
      if (disposed || !enabled || seen.has(target)) return;
      seen.add(target);
      observer?.unobserve(target);
      target.setAttribute(REVEAL_ATTRIBUTE, "running");

      try {
        const delay = delays.get(target) || 0;
        const animation = target.animate(
          [
            { opacity: 0, transform: "translateY(" + DISTANCE + "px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          {
            duration: DURATION,
            delay,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            fill: "both",
          }
        );
        if (!animation || typeof animation.cancel !== "function") {
          showImmediately(target);
          return;
        }

        // The timeout also releases the visible state if a browser misses finish.
        const timer = setTimeout(() => showImmediately(target), DURATION + delay + 100);
        active.set(target, { animation, timer });
        animation.onfinish = () => showImmediately(target);
        animation.oncancel = () => showImmediately(target);
      } catch {
        showImmediately(target);
      }
    };

    const handleFocus = (event) => {
      const target = event.target.closest?.("[" + REVEAL_ATTRIBUTE + "]");
      if (target && root.contains(target)) showImmediately(target);
    };

    const handleMotionChange = (event) => {
      if (!event.matches) return;
      enabled = false;
      observer?.disconnect();
      targets.forEach(showImmediately);
    };

    try {
      // Begin below the viewport so already-visible content never flashes out.
      observer = new window.IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) startReveal(entry.target);
        });
      }, { threshold: 0, rootMargin: "0px 0px 80px 0px" });

      targets.forEach((target) => {
        target.setAttribute(REVEAL_ATTRIBUTE, "waiting");
        observer.observe(target);
      });
    } catch {
      observer?.disconnect();
      targets.forEach(showImmediately);
      return undefined;
    }

    root.addEventListener("focusin", handleFocus);
    if (motionPreference?.addEventListener) {
      motionPreference.addEventListener("change", handleMotionChange);
    } else {
      motionPreference?.addListener?.(handleMotionChange);
    }

    return () => {
      disposed = true;
      enabled = false;
      observer.disconnect();
      root.removeEventListener("focusin", handleFocus);
      if (motionPreference?.removeEventListener) {
        motionPreference.removeEventListener("change", handleMotionChange);
      } else {
        motionPreference?.removeListener?.(handleMotionChange);
      }
      targets.forEach(showImmediately);
    };
  }, [rootRef]);
};

export default useScrollReveal;
