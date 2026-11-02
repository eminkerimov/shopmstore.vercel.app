import React, { useRef, useState } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import useCatalogResultScroll from "./useCatalogResultScroll";

let frames;
let sequence;
let documentTop;
const originalScrollTo = window.scrollTo;
const originalRAF = window.requestAnimationFrame;
const originalCancelRAF = window.cancelAnimationFrame;
const originalScrollY = window.scrollY;

const Harness = () => {
  const anchorRef = useRef(null);
  const toolbarRef = useRef(null);
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [deferred, setDeferred] = useState(false);
  const [running, setRunning] = useState(false);
  const [empty, setEmpty] = useState(false);
  const requestScroll = useCatalogResultScroll({ anchorRef, toolbarRef, deferred });

  const change = (value) => {
    const next = new URLSearchParams(value);
    requestScroll(next.toString());
    setRunning(true);
    setEmpty(next.get("q") === "missing");
    setParams(next);
  };

  return <>
    <header className="navbar" />
    <output data-testid="location">{location.pathname + location.search}</output>
    <button onClick={() => change("sub=accessories")}>Accessories</button>
    <button onClick={() => change("sub=shoes")}>Shoes</button>
    <button onClick={() => change("q=missing")}>Empty search</button>
    <button onClick={() => change("")}>Reset</button>
    <button onClick={() => setDeferred(true)}>Open drawer</button>
    <button onClick={() => { requestScroll(params.toString()); setDeferred(false); }}>Drawer exited</button>
    <button onClick={() => setRunning(false)}>Finish grid</button>
    <button onClick={() => navigate(-1)}>Back</button>
    <div className="catalogContent" ref={anchorRef}>
      <div className="catalogToolbar" ref={toolbarRef} style={{ position: "sticky", top: 84 }}>Catalog controls</div>
      <div data-grid-layout={running ? "running" : undefined}>
        {empty ? <p>No matching products</p> : <p>Visible products</p>}
      </div>
    </div>
  </>;
};

const mount = () => render(<MemoryRouter initialEntries={["/products/all"]}><Harness /></MemoryRouter>);
const flushFrames = async () => {
  await act(async () => { await Promise.resolve(); });
  act(() => {
    const callbacks = [...frames.values()];
    frames.clear();
    callbacks.forEach((callback) => callback(0));
  });
};

beforeEach(() => {
  jest.useFakeTimers();
  frames = new Map();
  sequence = 0;
  documentTop = 1000;
  Object.defineProperty(window, "scrollY", { configurable: true, writable: true, value: 1700 });
  window.requestAnimationFrame = jest.fn((callback) => { const id = ++sequence; frames.set(id, callback); return id; });
  window.cancelAnimationFrame = jest.fn((id) => frames.delete(id));
  window.scrollTo = jest.fn(({ top }) => { window.scrollY = top; });
  jest.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function () {
    const top = this.classList.contains("catalogContent") ? documentTop - window.scrollY : 0;
    const height = this.classList.contains("navbar") ? 76 : 600;
    return { top, bottom: top + height, left: 0, right: 1200, width: 1200, height, x: 0, y: top, toJSON() {} };
  });
});

afterEach(() => {
  cleanup();
  jest.restoreAllMocks();
  jest.useRealTimers();
  window.scrollTo = originalScrollTo;
  window.requestAnimationFrame = originalRAF;
  window.cancelAnimationFrame = originalCancelRAF;
  window.scrollY = originalScrollY;
});

test("a user filter returns a deep catalog to its controls under the sticky header and corrects after height settles", async () => {
  mount();
  await flushFrames();
  expect(window.scrollTo).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText("Accessories"));
  await flushFrames();
  expect(window.scrollTo).toHaveBeenLastCalledWith({ left: 0, top: 916, behavior: "instant" });
  expect(screen.getByTestId("location").textContent).toBe("/products/all?sub=accessories");

  documentTop = 1020;
  fireEvent.click(screen.getByText("Finish grid"));
  await flushFrames();
  expect(window.scrollTo).toHaveBeenLastCalledWith({ left: 0, top: 936, behavior: "instant" });
});

test("drawer filter changes defer background scrolling until the drawer has exited", async () => {
  mount();
  fireEvent.click(screen.getByText("Open drawer"));
  fireEvent.click(screen.getByText("Accessories"));
  await flushFrames();
  expect(window.scrollTo).not.toHaveBeenCalled();
  expect(screen.getByTestId("location").textContent).toContain("sub=accessories");
  fireEvent.click(screen.getByText("Drawer exited"));
  await flushFrames();
  expect(window.scrollTo).toHaveBeenCalledTimes(1);
  expect(window.scrollY).toBe(916);
});

test("browser Back does not replace saved-position restoration with a new catalog scroll", async () => {
  mount();
  fireEvent.click(screen.getByText("Accessories"));
  fireEvent.click(screen.getByText("Finish grid"));
  await flushFrames();
  window.scrollTo.mockClear();
  window.scrollY = 1400;
  fireEvent.click(screen.getByText("Back"));
  await flushFrames();
  expect(screen.getByTestId("location").textContent).toBe("/products/all");
  expect(window.scrollTo).not.toHaveBeenCalled();
  expect(window.scrollY).toBe(1400);
});

test("rapid user changes cancel the obsolete frame and scroll only for the latest selection", async () => {
  mount();
  fireEvent.click(screen.getByText("Accessories"));
  fireEvent.click(screen.getByText("Shoes"));
  await flushFrames();
  expect(screen.getByTestId("location").textContent).toBe("/products/all?sub=shoes");
  expect(window.scrollTo).toHaveBeenCalledTimes(1);
  expect(window.scrollY).toBe(916);
});

test("manual scrolling cancels a pending final correction", async () => {
  mount();
  fireEvent.click(screen.getByText("Accessories"));
  await flushFrames();
  window.scrollTo.mockClear();
  documentTop = 1250;
  fireEvent.wheel(window);
  fireEvent.click(screen.getByText("Finish grid"));
  await flushFrames();
  act(() => jest.advanceTimersByTime(2500));
  expect(window.scrollTo).not.toHaveBeenCalled();
});

test("empty results and reset use the results anchor without returning to the hero", async () => {
  mount();
  fireEvent.click(screen.getByText("Empty search"));
  await flushFrames();
  expect(screen.getByText("No matching products")).toBeTruthy();
  expect(window.scrollY).toBe(916);
  window.scrollY = 1600;
  fireEvent.click(screen.getByText("Reset"));
  await flushFrames();
  expect(screen.getByText("Visible products")).toBeTruthy();
  expect(window.scrollTo).toHaveBeenLastCalledWith({ left: 0, top: 916, behavior: "instant" });
  expect(screen.getByTestId("location").textContent).toBe("/products/all");
});

test("unmount clears the queued frame and the completion watchdog", async () => {
  const view = mount();
  fireEvent.click(screen.getByText("Accessories"));
  view.unmount();
  await flushFrames();
  act(() => jest.advanceTimersByTime(2500));
  expect(window.scrollTo).not.toHaveBeenCalled();
  expect(frames.size).toBe(0);
});
