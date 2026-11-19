import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const pageTitles = { "/": "Fashion collection", "/products/all": "All products", "/cart": "Your bag", "/wishlist": "Wishlist", "/payment": "Demo checkout", "/order-complete": "Order confirmed", "/about": "About" };
const positions = new Map();

export default function ScrollToTop() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const previousLocation = useRef(null);
  const restoring = useRef(false);
  const { pathname, hash, key } = location;

  useEffect(() => {
    document.title = (pageTitles[pathname] || (pathname.startsWith("/products/") ? "Collection" : pathname.startsWith("/product/") ? "Product" : "Page not found")) + " · M-store";
  }, [pathname]);

  useEffect(() => {
    const previous = window.history.scrollRestoration;
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    return () => {
      if ("scrollRestoration" in window.history) window.history.scrollRestoration = previous;
    };
  }, []);

  useLayoutEffect(() => {
    const previous = previousLocation.current;
    previousLocation.current = location;
    const content = document.getElementById("main-content");
    const saved = navigationType === "POP" ? positions.get(key) : null;
    const changedPage = !previous || previous.pathname !== pathname || previous.hash !== hash;
    let frame = null;
    let resizeObserver;
    let mutationObserver;
    let stopped = false;

    const savePosition = () => {
      if (!restoring.current) positions.set(key, { x: window.scrollX, y: window.scrollY });
    };
    const stopRestoring = () => {
      if (stopped) return;
      stopped = true;
      restoring.current = false;
      if (frame !== null) cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      window.removeEventListener("wheel", stopRestoring);
      window.removeEventListener("touchstart", stopRestoring);
      window.removeEventListener("pointerdown", stopRestoring);
      window.removeEventListener("keydown", stopRestoring);
      savePosition();
    };
    const applyPosition = () => {
      frame = null;
      if (stopped) return;
      const anchor = hash ? document.getElementById(hash.slice(1)) : null;
      if (anchor) anchor.scrollIntoView({ block: "start", behavior: "instant" });
      else window.scrollTo({ left: saved?.x || 0, top: saved?.y || 0, behavior: "instant" });
      // Lazy routes and product requests can initially render shorter skeletons.
      const busy = content?.querySelector('[aria-busy="true"], .routeLoading, [data-grid-layout="running"]');
      if (!saved || !busy) stopRestoring();
    };
    const schedulePosition = () => {
      if (!stopped && frame === null) frame = requestAnimationFrame(applyPosition);
    };

    window.addEventListener("scroll", savePosition, { passive: true });
    if (saved || changedPage) {
      restoring.current = true;
      window.addEventListener("wheel", stopRestoring, { passive: true });
      window.addEventListener("touchstart", stopRestoring, { passive: true });
      window.addEventListener("pointerdown", stopRestoring, { passive: true });
      window.addEventListener("keydown", stopRestoring);
      if (saved && content) {
        if (typeof ResizeObserver !== "undefined") {
          resizeObserver = new ResizeObserver(schedulePosition);
          resizeObserver.observe(content);
        }
        mutationObserver = new MutationObserver(schedulePosition);
        mutationObserver.observe(content, { childList: true, subtree: true, attributes: true, attributeFilter: ["aria-busy", "data-grid-layout"] });
      }
      // Keep route focus outside the hero so it doesn't pause the slideshow.
      if (changedPage) {
        const focusTarget = (hash && document.getElementById(hash.slice(1))) || content;
        focusTarget?.focus({ preventScroll: true });
      }
      schedulePosition();
    } else {
      restoring.current = false;
      savePosition();
    }

    return () => {
      // Preserve the last recorded scroll before the next route changes height.
      if (frame !== null) cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      window.removeEventListener("scroll", savePosition);
      window.removeEventListener("wheel", stopRestoring);
      window.removeEventListener("touchstart", stopRestoring);
      window.removeEventListener("pointerdown", stopRestoring);
      window.removeEventListener("keydown", stopRestoring);
      restoring.current = false;
      stopped = true;
    };
  }, [location, navigationType, key, pathname, hash]);

  return null;
}
