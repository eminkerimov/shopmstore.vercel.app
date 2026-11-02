import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// Explicit catalog interactions own this scroll. Browser POP and page navigation
// remain with ScrollToTop, which restores their saved positions independently.
const useCatalogResultScroll = ({ anchorRef, toolbarRef, deferred = false }) => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const pendingRef = useRef(null);
  const [requestVersion, setRequestVersion] = useState(0);

  const requestScroll = useCallback((search) => {
    pendingRef.current = {
      pathname: location.pathname,
      originKey: location.key,
      search: new URLSearchParams(search).toString(),
    };
    setRequestVersion((version) => version + 1);
  }, [location.pathname, location.key]);

  useLayoutEffect(() => {
    const pending = pendingRef.current;
    if (!pending) return undefined;
    if (pending.pathname !== location.pathname ||
      (navigationType === "POP" && pending.originKey !== location.key)) {
      pendingRef.current = null;
      return undefined;
    }
    if (deferred || pending.search !== new URLSearchParams(location.search).toString()) return undefined;

    const anchor = anchorRef.current;
    if (!anchor) return undefined;
    pendingRef.current = null;
    let frame = null;
    let timer;
    let stopped = false;
    let aligned = false;
    let observer;
    const interruptEvents = ["wheel", "touchstart", "pointerdown", "keydown"];

    const stop = () => {
      if (stopped) return;
      stopped = true;
      if (frame !== null) cancelAnimationFrame(frame);
      clearTimeout(timer);
      observer?.disconnect();
      interruptEvents.forEach((event) => window.removeEventListener(event, stop));
    };

    const align = () => {
      const toolbar = toolbarRef.current;
      const stickyTop = toolbar ? Number.parseFloat(window.getComputedStyle(toolbar).top) : NaN;
      const headerBottom = document.querySelector(".navbar")?.getBoundingClientRect().bottom || 0;
      const offset = Math.max(0, Number.isFinite(stickyTop) ? stickyTop : headerBottom);
      const top = Math.max(0, window.scrollY + anchor.getBoundingClientRect().top - offset);
      if (Math.abs(window.scrollY - top) > 1) {
        window.scrollTo({ left: window.scrollX, top, behavior: "instant" });
      }
    };

    const check = () => {
      frame = null;
      if (stopped) return;
      if (!aligned) {
        align();
        aligned = true;
      }
      if (!anchor.querySelector('[aria-busy="true"], [data-grid-layout="running"]')) {
        align();
        stop();
      }
    };
    const schedule = () => {
      if (!stopped && frame === null) frame = requestAnimationFrame(check);
    };

    if (typeof MutationObserver !== "undefined") {
      observer = new MutationObserver(schedule);
      observer.observe(anchor, {
        subtree: true, childList: true, attributes: true,
        attributeFilter: ["aria-busy", "data-grid-layout"],
      });
    }
    interruptEvents.forEach((event) => window.addEventListener(event, stop, { passive: true }));
    // A missing completion event must never leave a later scroll correction armed.
    timer = setTimeout(() => { if (!stopped) { align(); stop(); } }, 2000);
    schedule();
    return stop;
  }, [location.pathname, location.search, location.key, navigationType, deferred, requestVersion, anchorRef, toolbarRef]);

  return requestScroll;
};

export default useCatalogResultScroll;
