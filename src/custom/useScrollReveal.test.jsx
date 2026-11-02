import React, { useRef } from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import useScrollReveal from "./useScrollReveal";

const originalObserver = window.IntersectionObserver;
const originalMatchMedia = window.matchMedia;
const originalAnimate = Element.prototype.animate;
let observers;
let animations;
let motionListeners;
let reducedMotion;

const Example = () => {
  const root = useRef(null);
  useScrollReveal(root);
  return (
    <div ref={root}>
      <section className="featuredProducts">
        <div className="top" data-testid="heading">A collection</div>
      </section>
      <a className="categories__tile" href="#first">First category</a>
      <a className="categories__tile" href="#second">Second category</a>
    </div>
  );
};

beforeEach(() => {
  jest.useFakeTimers();
  observers = [];
  animations = [];
  motionListeners = new Set();
  reducedMotion = false;
  window.matchMedia = jest.fn(() => ({
    matches: reducedMotion,
    addEventListener: (_event, listener) => motionListeners.add(listener),
    removeEventListener: (_event, listener) => motionListeners.delete(listener),
  }));
  window.IntersectionObserver = jest.fn(function (callback) {
    this.callback = callback;
    this.observe = jest.fn();
    this.unobserve = jest.fn();
    this.disconnect = jest.fn();
    observers.push(this);
  });
  Element.prototype.animate = jest.fn(function () {
    const animation = { cancel: jest.fn(), onfinish: null, oncancel: null };
    animations.push({ target: this, animation });
    return animation;
  });
});

afterEach(() => {
  cleanup();
  jest.useRealTimers();
  window.IntersectionObserver = originalObserver;
  window.matchMedia = originalMatchMedia;
  Element.prototype.animate = originalAnimate;
});

const enter = (target) => {
  act(() => observers[0].callback([{ target, isIntersecting: true }]));
};

test("leaves content visible when animation APIs are unavailable", () => {
  window.IntersectionObserver = undefined;
  render(<Example />);
  expect(screen.getByTestId("heading")).toBeVisible();
  expect(screen.getByRole("link", { name: "First category" })).not.toHaveAttribute("data-scroll-reveal");
  expect(Element.prototype.animate).not.toHaveBeenCalled();
});

test("keyboard focus immediately releases running and pending reveals", () => {
  render(<Example />);
  const first = screen.getByRole("link", { name: "First category" });
  const second = screen.getByRole("link", { name: "Second category" });
  expect(window.IntersectionObserver).toHaveBeenCalledWith(expect.any(Function), {
    threshold: 0,
    rootMargin: "0px 0px 80px 0px",
  });
  expect(first).toBeVisible();

  enter(first);
  expect(first).toHaveAttribute("data-scroll-reveal", "running");
  act(() => first.focus());
  expect(animations[0].animation.cancel).toHaveBeenCalledTimes(1);
  expect(first).not.toHaveAttribute("data-scroll-reveal");
  expect(first).toHaveFocus();

  act(() => second.focus());
  enter(second);
  enter(first);
  expect(Element.prototype.animate).toHaveBeenCalledTimes(1);
  expect(second).not.toHaveAttribute("data-scroll-reveal");
});

test("respects an initial reduced-motion preference without observing or animating", () => {
  reducedMotion = true;
  render(<Example />);
  expect(window.IntersectionObserver).not.toHaveBeenCalled();
  expect(Element.prototype.animate).not.toHaveBeenCalled();
  expect(screen.getByTestId("heading")).toBeVisible();
});

test("switching to reduced motion cancels current animations and future reveals", () => {
  const { unmount } = render(<Example />);
  enter(screen.getByTestId("heading"));
  enter(screen.getByRole("link", { name: "First category" }));
  act(() => motionListeners.forEach((listener) => listener({ matches: true })));

  animations.forEach(({ target, animation }) => {
    expect(animation.cancel).toHaveBeenCalledTimes(1);
    expect(target).not.toHaveAttribute("data-scroll-reveal");
  });
  expect(observers[0].disconnect).toHaveBeenCalled();
  enter(screen.getByRole("link", { name: "Second category" }));
  expect(Element.prototype.animate).toHaveBeenCalledTimes(2);
  unmount();
  expect(motionListeners.size).toBe(0);
});

test("fails open if animate throws and releases effects even if finish never arrives", () => {
  Element.prototype.animate.mockImplementationOnce(() => { throw new Error("Animation unavailable"); });
  render(<Example />);
  const heading = screen.getByTestId("heading");
  enter(heading);
  expect(heading).not.toHaveAttribute("data-scroll-reveal");
  expect(heading).toBeVisible();

  const first = screen.getByRole("link", { name: "First category" });
  enter(first);
  act(() => jest.runOnlyPendingTimers());
  expect(animations[0].animation.cancel).toHaveBeenCalledTimes(1);
  expect(first).not.toHaveAttribute("data-scroll-reveal");
});
