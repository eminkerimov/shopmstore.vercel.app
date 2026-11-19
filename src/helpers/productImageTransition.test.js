import "@testing-library/jest-dom";
import { startProductImageTransition } from "./productImageTransition";

const makeCard = () => {
  const card = document.createElement("article");
  card.innerHTML = '<div class="image"><img src="/front.jpg" style="opacity:1" /><img src="/back.jpg" style="opacity:0" /></div>';
  document.body.appendChild(card);
  card.querySelector(".image").getBoundingClientRect = () => ({ left: 20, top: 300, width: 180, height: 240 });
  for (const image of card.querySelectorAll("img")) {
    Object.defineProperty(image, "complete", { configurable: true, value: true });
    Object.defineProperty(image, "naturalWidth", { configurable: true, value: 600 });
  }
  return card;
};

let animate;
beforeEach(() => {
  window.history.replaceState(null, "", "/");
  window.matchMedia = jest.fn().mockReturnValue({ matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn() });
  animate = Element.prototype.animate;
  Element.prototype.animate = jest.fn();
});
afterEach(() => {
  Element.prototype.animate = animate;
  document.body.innerHTML = "";
});

test("reduced motion keeps normal navigation and creates no overlay", () => {
  window.matchMedia.mockReturnValue({ matches: true });
  const card = makeCard();
  expect(startProductImageTransition(card, "1")).toBeNull();
  expect(document.querySelector(".productImageTransition")).toBeNull();
  expect(card.querySelector(".image").style.visibility).toBe("");
});

test("only a decoded image can start a transition", () => {
  const card = makeCard();
  for (const image of card.querySelectorAll("img")) Object.defineProperty(image, "naturalWidth", { configurable: true, value: 0 });
  expect(startProductImageTransition(card, "1")).toBeNull();
  expect(document.querySelector(".productImageTransition")).toBeNull();
});

test("uses the visible alternate photo and restores the source when cancelled", () => {
  const card = makeCard();
  card.querySelectorAll("img")[0].style.opacity = "0";
  card.querySelectorAll("img")[1].style.opacity = "1";
  const transition = startProductImageTransition(card, "1");
  expect(transition.src).toBe("/back.jpg");
  expect(card.querySelector(".image").style.visibility).toBe("hidden");
  expect(document.querySelector(".productImageTransition")).toHaveAttribute("aria-hidden", "true");
  transition.cancel();
  expect(card.querySelector(".image").style.visibility).toBe("");
  expect(document.querySelector(".productImageTransition")).toBeNull();
});

test("browser Back cancels the pending transition without hiding the source", () => {
  const card = makeCard();
  startProductImageTransition(card, "1");
  window.dispatchEvent(new PopStateEvent("popstate"));
  expect(card.querySelector(".image").style.visibility).toBe("");
  expect(document.querySelector(".productImageTransition")).toBeNull();
});


test("waits for the final photo and settled route scroll instead of flying to a skeleton", async () => {
  const originalRaf = window.requestAnimationFrame;
  const originalCancelRaf = window.cancelAnimationFrame;
  const scrollDescriptor = Object.getOwnPropertyDescriptor(window, "scrollY");
  const frames = new Map();
  let nextFrame = 0;
  window.requestAnimationFrame = jest.fn((callback) => { frames.set(++nextFrame, callback); return nextFrame; });
  window.cancelAnimationFrame = jest.fn((id) => frames.delete(id));
  const tick = () => { const pending = [...frames.values()]; frames.clear(); pending.forEach((callback) => callback()); };
  Element.prototype.animate = jest.fn(() => ({ cancel: jest.fn(), finished: new Promise(() => {}) }));
  const card = makeCard();
  for (const photo of card.querySelectorAll("img")) {
    photo.style.objectFit = "contain";
    Object.defineProperty(photo, "naturalHeight", { configurable: true, value: 600 });
  }
  const transition = startProductImageTransition(card, "1");
  try {
    window.history.pushState(null, "", "/product/1");
    const skeleton = document.createElement("div");
    skeleton.className = "productDetailSkeleton__image";
    skeleton.getBoundingClientRect = () => ({ left: 50, top: -1200, width: 500, height: 600 });
    document.body.appendChild(skeleton);
    await Promise.resolve();
    tick();
    expect(Element.prototype.animate).not.toHaveBeenCalled();

    const gallery = document.createElement("div");
    gallery.className = "product__main-image";
    gallery.innerHTML = '<img src="/front.jpg" data-product-image="1" />';
    const photo = gallery.querySelector("img");
    Object.defineProperties(photo, { complete: { value: true }, naturalWidth: { value: 600 }, naturalHeight: { value: 600 } });
    photo.style.objectFit = "cover";
    let targetTop = -900;
    gallery.getBoundingClientRect = () => ({ left: 80, top: targetTop, width: 450, height: 600 });
    Object.defineProperty(window, "scrollY", { configurable: true, value: 1000 });
    skeleton.replaceWith(gallery);
    await Promise.resolve();
    tick();
    tick();
    expect(Element.prototype.animate).not.toHaveBeenCalled();

    targetTop = 124;
    Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
    tick();
    tick();
    expect(Element.prototype.animate).not.toHaveBeenCalled();
    tick();
    const calls = Element.prototype.animate.mock.calls;
    const contexts = Element.prototype.animate.mock.instances;
    const movementCalls = calls.filter((_, index) => contexts[index].classList.contains("productImageTransition"));
    const photoCall = calls.find((_, index) => contexts[index].tagName === "IMG");
    expect(photoCall[0]).toEqual([
      expect.objectContaining({ left: "0px", top: "30px", width: "180px", height: "180px" }),
      expect.objectContaining({ left: "-75px", top: "0px", width: "600px", height: "600px" }),
    ]);
    expect(movementCalls).toHaveLength(1);
    expect(movementCalls[0][0]).toEqual([
      expect.objectContaining({ top: "300px", width: "180px" }),
      expect.objectContaining({ top: "124px", width: "450px" }),
    ]);
  } finally {
    transition.cancel();
    window.requestAnimationFrame = originalRaf;
    window.cancelAnimationFrame = originalCancelRaf;
    Object.defineProperty(window, "scrollY", scrollDescriptor);
  }
});
