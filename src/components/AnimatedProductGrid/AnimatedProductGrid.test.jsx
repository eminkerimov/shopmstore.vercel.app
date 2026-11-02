import React from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import AnimatedProductGrid from "./AnimatedProductGrid";

const originalIO = window.IntersectionObserver;
const originalMatchMedia = window.matchMedia;
const originalAnimate = Element.prototype.animate;
const originalHeight = window.innerHeight;
const originalWidth = window.innerWidth;
let observers;
let records;
let offsets;
let media;
let listeners;
let origin;

const rect = (left, top, width, height) => ({ left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON() {} });
const liveNodes = (grid) => [...grid.children].filter((node) => node.hasAttribute("data-grid-key"));
const product = (id) => ({ id, title: "Product " + id });
const renderItem = (item) => <article className="card"><button id={"product-" + item.id}>{item.title}</button></article>;
const grid = (items, extra = {}) => <AnimatedProductGrid className="existing-grid" items={items} renderItem={renderItem} {...extra} />;
const reveal = (observer = observers[observers.length - 1]) => act(() => {
  observer.callback([...observer.nodes].map((target) => {
    const box = target.getBoundingClientRect();
    return { target, isIntersecting: box.top < window.innerHeight + 80 && box.bottom > 0 };
  }));
});
const finishAll = () => act(() => {
  [...records].forEach(({ animation }) => animation.onfinish?.());
});
const itemRecords = () => records.filter(({ node }) => node.hasAttribute("data-grid-key"));

beforeEach(() => {
  observers = [];
  records = [];
  offsets = new Map();
  listeners = new Set();
  origin = () => ({ left: 40, top: 100 });
  Object.defineProperty(window, "innerHeight", { configurable: true, writable: true, value: 900 });
  Object.defineProperty(window, "innerWidth", { configurable: true, writable: true, value: 1200 });
  media = {
    matches: false,
    addEventListener: jest.fn((_, listener) => listeners.add(listener)),
    removeEventListener: jest.fn((_, listener) => listeners.delete(listener)),
  };
  window.matchMedia = jest.fn(() => media);
  window.IntersectionObserver = class {
    constructor(callback) {
      this.callback = callback;
      this.nodes = new Set();
      this.observe = jest.fn((node) => this.nodes.add(node));
      this.unobserve = jest.fn((node) => this.nodes.delete(node));
      this.disconnect = jest.fn(() => this.nodes.clear());
      observers.push(this);
    }
  };
  Element.prototype.animate = jest.fn(function (keyframes, options) {
    const node = this;
    const animation = { cancel: jest.fn(() => offsets.delete(node.dataset.gridKey)), onfinish: null, oncancel: null };
    records.push({ node, keyframes, options, animation });
    return animation;
  });
  jest.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function () {
    const parent = this.classList.contains("animatedProductGrid") ? this : this.parentElement;
    if (!parent?.classList.contains("animatedProductGrid")) return rect(0, 0, 0, 0);
    const nodes = liveNodes(parent);
    const { left, top } = origin(nodes.map((node) => node.dataset.gridKey));
    if (this === parent) return rect(left, top, 420, nodes.length ? Math.ceil(nodes.length / 2) * 140 - 20 : 80);
    const index = nodes.indexOf(this);
    const offset = offsets.get(this.dataset.gridKey) || { x: 0, y: 0 };
    return rect(left + (index % 2) * 220 + offset.x, top + Math.floor(index / 2) * 140 + offset.y, 200, 120);
  });
});

afterEach(() => {
  cleanup();
  jest.restoreAllMocks();
  window.IntersectionObserver = originalIO;
  window.matchMedia = originalMatchMedia;
  if (originalAnimate === undefined) delete Element.prototype.animate;
  else Element.prototype.animate = originalAnimate;
  window.innerHeight = originalHeight;
  window.innerWidth = originalWidth;
});

test("API items enter on their first visible intersection with a bounded stagger", () => {
  window.innerHeight = 550;
  const items = Array.from({ length: 10 }, (_, index) => product(String(index)));
  const view = render(grid([], { fallback: <p>Loading products</p> }));
  expect(screen.getByText("Loading products")).toBeVisible();
  view.rerender(grid(items));
  expect(itemRecords()).toHaveLength(0);
  reveal();
  expect(itemRecords()).toHaveLength(8);
  expect(itemRecords().map(({ options }) => options.delay)).toEqual([0, 36, 72, 108, 144, 180, 200, 200]);
  expect(itemRecords().every(({ options }) => options.duration === 440)).toBe(true);
  expect(observers[0].nodes.size).toBe(2);
  expect(screen.getByRole("button", { name: "Product 9" })).toBeVisible();
  reveal();
  expect(itemRecords()).toHaveLength(8);
});

test("FLIP uses grid-relative coordinates when the page origin changes", () => {
  origin = (keys) => ({ left: 40, top: keys[0] === "a" ? 300 : 100 });
  const first = [product("a"), product("b")];
  const view = render(grid(first));
  reveal();
  finishAll();
  records.length = 0;
  view.rerender(grid([first[1], first[0]]));
  const moves = itemRecords();
  expect(moves.find(({ node }) => node.dataset.gridKey === "a").keyframes[0].transform).toBe("translate(-220px, 0px)");
  expect(moves.find(({ node }) => node.dataset.gridKey === "b").keyframes[0].transform).toBe("translate(220px, 0px)");
  expect(view.container.querySelector(".existing-grid")).toBeInTheDocument();
  expect(view.container.querySelectorAll(".animatedProductGrid__item > .card")).toHaveLength(2);
});

test("removal ghosts are inert, inaccessible and removed when the exit finishes", () => {
  const first = [product("a"), product("b"), product("c")];
  const view = render(grid(first));
  reveal();
  finishAll();
  records.length = 0;
  view.rerender(grid(first.slice(1)));
  const ghost = view.container.querySelector("[data-grid-exit]");
  expect(ghost).toHaveAttribute("inert");
  expect(ghost).toHaveAttribute("aria-hidden", "true");
  expect(ghost).not.toHaveAttribute("data-grid-key");
  expect(ghost.querySelector("button")).toHaveAttribute("tabindex", "-1");
  expect(ghost.querySelector("[id]")).toBeNull();
  expect(screen.queryByRole("button", { name: "Product a" })).not.toBeInTheDocument();
  expect(screen.getAllByRole("button")).toHaveLength(2);
  const height = records.find(({ node }) => node.classList.contains("animatedProductGrid") && !node.hasAttribute("data-grid-exit"));
  expect(height.keyframes).toEqual([{ height: "260px" }, { height: "120px" }]);
  finishAll();
  expect(view.container.querySelector("[data-grid-exit]")).toBeNull();
});

test("rapid filtering resumes from current visual positions and cancels obsolete exits", () => {
  const first = [product("a"), product("b"), product("c"), product("d")];
  const view = render(grid(first));
  reveal();
  finishAll();
  records.length = 0;
  view.rerender(grid(first.slice(1)));
  const interrupted = [...records];
  expect(view.container.querySelector("[data-grid-exit]")).not.toBeNull();
  offsets.set("b", { x: 80, y: 0 });
  records.length = 0;
  view.rerender(grid([first[3], first[1]]));
  expect(interrupted.every(({ animation }) => animation.cancel.mock.calls.length === 1)).toBe(true);
  expect(view.container.querySelectorAll("[data-grid-exit]")).toHaveLength(1);
  const resumedB = itemRecords().find(({ node }) => node.dataset.gridKey === "b");
  expect(resumedB.keyframes[0].transform).toBe("translate(-140px, 0px)");
  expect(liveNodes(view.container.firstChild).map((node) => node.dataset.gridKey)).toEqual(["d", "b"]);
  finishAll();
  expect(view.container.querySelector("[data-grid-exit]")).toBeNull();
});

test("filtering to empty keeps the fallback visible and unmount cancels all work", () => {
  const view = render(grid([product("a"), product("b")]));
  reveal();
  view.rerender(grid([], { fallback: <button>Clear filters</button> }));
  expect(screen.getByRole("button", { name: "Clear filters" })).toBeVisible();
  expect(screen.getAllByRole("button")).toHaveLength(1);
  const beforeUnmount = [...records];
  const observer = observers[0];
  view.unmount();
  expect(beforeUnmount.every(({ animation }) => animation.cancel.mock.calls.length === 1)).toBe(true);
  expect(observer.disconnect).toHaveBeenCalled();
  const recordCount = records.length;
  act(() => observer.callback([{ target: document.createElement("div"), isIntersecting: true }]));
  expect(records).toHaveLength(recordCount);
});

test("reduced motion performs no WAAPI or observer work and leaves content visible", () => {
  media.matches = true;
  const view = render(grid([product("a"), product("b")]));
  view.rerender(grid([product("b")]));
  expect(Element.prototype.animate).not.toHaveBeenCalled();
  expect(observers).toHaveLength(0);
  expect(screen.getByRole("button", { name: "Product b" })).toBeVisible();
  expect(view.container.querySelector(".animatedProductGrid__item").style.opacity).toBe("");
});

test("changing the motion preference cancels active animations and removes ghosts", () => {
  const first = [product("a"), product("b")];
  const view = render(grid(first));
  reveal();
  finishAll();
  view.rerender(grid(first.slice(1)));
  expect(view.container.querySelector("[data-grid-exit]")).not.toBeNull();
  act(() => { media.matches = true; listeners.forEach((listener) => listener()); });
  expect(view.container.querySelector("[data-grid-exit]")).toBeNull();
  expect(records.every(({ animation }) => animation.cancel.mock.calls.length === 1)).toBe(true);
  expect(observers[0].disconnect).toHaveBeenCalled();
  expect(screen.getByRole("button", { name: "Product b" })).toBeVisible();
});

test.each(["observer", "animate"])("missing %s support fails open", (missing) => {
  if (missing === "observer") window.IntersectionObserver = undefined;
  else delete Element.prototype.animate;
  const view = render(grid([product("a")]));
  view.rerender(grid([product("b")]));
  expect(screen.getByRole("button", { name: "Product b" })).toBeVisible();
  expect(records).toHaveLength(0);
  expect(view.container.querySelector("[data-grid-exit]")).toBeNull();
});

test("WAAPI failures cannot hide products or leave exit clones behind", () => {
  Element.prototype.animate = jest.fn(() => { throw new Error("Animation unavailable"); });
  const first = [product("a"), product("b")];
  const view = render(grid(first));
  reveal();
  view.rerender(grid(first.slice(1)));
  expect(screen.getByRole("button", { name: "Product b" })).toBeVisible();
  expect(view.container.querySelector("[data-grid-exit]")).toBeNull();
  expect(view.container.querySelector(".animatedProductGrid__item").style.opacity).toBe("");
});

test("entrance starts just before the viewport to avoid a visible opacity reset", () => {
  origin = () => ({ left: 40, top: window.innerHeight + 40 });
  render(grid([product("a")]));
  reveal();
  expect(itemRecords()).toHaveLength(1);
});

test("parent rerenders with refreshed item objects do not replay the reveal", () => {
  const first = [product("a"), product("b")];
  const view = render(grid(first));
  reveal();
  finishAll();
  records.length = 0;
  view.rerender(grid(first.map((item) => ({ ...item }))));
  reveal();
  expect(records).toHaveLength(0);
});

test("keyboard focus settles motion so a focused product cannot stay transparent", () => {
  render(grid([product("a"), product("b")]));
  reveal();
  fireEvent.focus(screen.getByRole("button", { name: "Product a" }));
  expect(records.every(({ animation }) => animation.cancel.mock.calls.length === 1)).toBe(true);
  expect(screen.getByRole("button", { name: "Product a" })).toBeVisible();
});

test("an observer construction failure leaves current and updated products visible", () => {
  window.IntersectionObserver = class { constructor() { throw new Error("Observer unavailable"); } };
  const view = render(grid([product("a")]));
  view.rerender(grid([product("b")]));
  expect(screen.getByRole("button", { name: "Product b" })).toBeVisible();
  expect(records).toHaveLength(0);
  expect(view.container.querySelector("[data-grid-exit]")).toBeNull();
});
test("height motion advertises readiness and watchdog removes stale exits when finish events are missed", () => {
  jest.useFakeTimers();
  try {
    const first = [product("a"), product("b"), product("c")];
    const view = render(grid(first));
    reveal();
    finishAll();
    view.rerender(grid(first.slice(1)));
    expect(view.container.firstChild).toHaveAttribute("data-grid-layout", "running");
    expect(view.container.querySelector("[data-grid-exit]")).not.toBeNull();
    act(() => jest.advanceTimersByTime(540));
    expect(view.container.firstChild).not.toHaveAttribute("data-grid-layout");
    expect(view.container.querySelector("[data-grid-exit]")).toBeNull();
  } finally {
    cleanup();
    jest.useRealTimers();
  }
});

test("finishing or cancelling the height animation clears its running marker", () => {
  const first = [product("a"), product("b"), product("c")];
  const view = render(grid(first));
  reveal();
  finishAll();
  view.rerender(grid(first.slice(1)));
  expect(view.container.firstChild).toHaveAttribute("data-grid-layout", "running");
  finishAll();
  expect(view.container.firstChild).not.toHaveAttribute("data-grid-layout");
  view.rerender(grid(first));
  expect(view.container.firstChild).toHaveAttribute("data-grid-layout", "running");
  fireEvent.focus(screen.getByRole("button", { name: "Product b" }));
  expect(view.container.firstChild).not.toHaveAttribute("data-grid-layout");
});

test("focus before the observer callback cannot trigger a later opacity reset", () => {
  render(grid([product("a"), product("b")]));
  fireEvent.focus(screen.getByRole("button", { name: "Product a" }));
  reveal();
  expect(itemRecords().map(({ node }) => node.dataset.gridKey)).toEqual(["b"]);
});