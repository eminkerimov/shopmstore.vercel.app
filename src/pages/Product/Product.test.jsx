import React from "react";
import { render, screen, fireEvent, within, act, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Product from "./Product";
import useFetch from "../../custom/useFetch";
import cartReducer from "../../redux/cartReducer";
import wishlistReducer from "../../redux/wishlistReducer";

jest.mock("../../custom/useFetch", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("../../components/Card/Card", () => () => <div>Related item</div>);

const item = { id: "31", title: "Prada sneakers", desc: "A custom product description.", price: 120, img: "/front.jpg", img2: "/back.jpg", category: 2, sub_category: "shoes", sizes: ["39", "40"], colors: ["White", "Black"] };
const refetch = jest.fn();
const setupProduct = () => {
  const store = configureStore({ reducer: { cart: cartReducer, wishlist: wishlistReducer } });
  render(<Provider store={store}><MemoryRouter initialEntries={["/product/31"]}><Routes><Route path="/product/:id" element={<Product />} /></Routes></MemoryRouter></Provider>);
  return store;
};

beforeEach(() => {
  jest.clearAllMocks();
  useFetch.mockImplementation((url) => ({ data: url === "/product/31" ? item : [], loading: false, error: null, refetch }));
});

test("adds selected API size and color as distinct cart variants", () => {
  const store = setupProduct();
  const addButton = screen.getByRole("button", { name: "Add to cart", exact: true });
  expect(addButton).toBeDisabled();
  expect(addButton).toHaveAccessibleDescription("Select a color and a size to add this item.");
  fireEvent.click(screen.getByRole("button", { name: "40", exact: true }));
  expect(addButton).toHaveAccessibleDescription("Select a color to add this item.");
  expect(addButton).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Black", exact: true }));
  expect(addButton).toBeEnabled();
  expect(screen.queryByText(/Select a color/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Increase quantity" }));
  fireEvent.click(screen.getByRole("button", { name: "Add to cart", exact: true }));
  expect(store.getState().cart.products[0]).toMatchObject({ id: "31", size: "40", color: "Black", quantity: 2 });
  fireEvent.click(screen.getByRole("button", { name: "39", exact: true }));
  fireEvent.click(screen.getByRole("button", { name: "Add to cart", exact: true }));
  expect(store.getState().cart.products).toHaveLength(2);
});

test("opens the zoom gallery and navigates images with the keyboard", async () => {
  setupProduct();
  fireEvent.click(screen.getByRole("button", { name: "Enlarge Prada sneakers image" }));
  const dialog = await screen.findByRole("dialog", { name: "Prada sneakers" });
  expect(within(dialog).getByRole("img")).toHaveAttribute("src", "/front.jpg");
  fireEvent.keyDown(dialog, { key: "ArrowRight" });
  expect(within(dialog).getByRole("img")).toHaveAttribute("src", "/back.jpg");
  fireEvent.keyDown(dialog, { key: "ArrowRight" });
  expect(within(dialog).getByRole("img")).toHaveAttribute("src", "/front.jpg");
});

test("offers a usable size guide in place of the inactive compare action", async () => {
  setupProduct();
  fireEvent.click(screen.getByRole("button", { name: "Size guide" }));
  const dialog = await screen.findByRole("dialog", { name: "Find your fit" });
  expect(within(dialog).getByRole("table")).toBeInTheDocument();
  expect(within(dialog).getByRole("button", { name: "Close size guide" })).toBeInTheDocument();
});

test("distinguishes a missing product from a retryable request error", () => {
  useFetch.mockReturnValue({ data: null, loading: false, error: { response: { status: 404 } }, refetch });
  const { unmount } = (() => {
    const store = configureStore({ reducer: { cart: cartReducer, wishlist: wishlistReducer } });
    return render(<Provider store={store}><MemoryRouter><Product /></MemoryRouter></Provider>);
  })();
  expect(screen.getByRole("heading", { name: "Product not found" })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Try again" })).not.toBeInTheDocument();
  unmount();
  useFetch.mockReturnValue({ data: null, loading: false, error: new Error("Network unavailable"), refetch });
  setupProduct();
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(refetch).toHaveBeenCalledTimes(1);
});
test("shows the mobile buy bar after jumping past the purchase block and hides it on return", () => {
  const originalWidth = window.innerWidth;
  const originalMatchMedia = window.matchMedia;
  Object.defineProperty(window, "innerWidth", { configurable: true, writable: true, value: 390 });
  window.matchMedia = jest.fn().mockReturnValue({ matches: true, addListener: jest.fn(), removeListener: jest.fn() });
  const frames = [];
  let purchaseBottom = 1200;
  const animationFrame = jest.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    frames.push(callback);
    return frames.length;
  });
  const geometry = jest.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function () {
    return { top: this.classList.contains("product__purchase") ? purchaseBottom - 90 : 0, bottom: this.classList.contains("product__purchase") ? purchaseBottom : 0 };
  });
  const flushFrames = () => act(() => { frames.splice(0).forEach((callback) => callback(0)); });
  try {
    setupProduct();
    flushFrames();
    expect(screen.getAllByRole("button", { name: "Add to cart", exact: true })).toHaveLength(1);
    purchaseBottom = -100;
    fireEvent.scroll(window);
    flushFrames();
    expect(screen.getAllByRole("button", { name: "Add to cart", exact: true })).toHaveLength(2);
    purchaseBottom = 500;
    fireEvent.scroll(window);
    flushFrames();
    expect(screen.getAllByRole("button", { name: "Add to cart", exact: true })).toHaveLength(1);
  } finally {
    animationFrame.mockRestore();
    geometry.mockRestore();
    window.innerWidth = originalWidth;
    window.matchMedia = originalMatchMedia;
  }
});
test("shows API titles and descriptions without local copy corrections or inferred brands", () => {
  const source = { ...item, title: "Clique Men's uck Men's Archery Half-Zip Hoodie", desc: "Fashionable hoodie new", vendor: undefined, brand: undefined };
  useFetch.mockImplementation((url) => ({ data: url === "/product/31" ? source : [], loading: false, error: null, refetch }));
  setupProduct();
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(source.title);
  expect(screen.getAllByText(source.desc)).toHaveLength(1);
  expect(screen.queryByText("Brand", { exact: true })).not.toBeInTheDocument();
});

test("allows buying a product without API variants and omits selectors and size guide", () => {
  const source = { ...item, sizes: undefined, colors: undefined };
  useFetch.mockImplementation((url) => ({ data: url === "/product/31" ? source : [], loading: false, error: null, refetch }));
  const store = setupProduct();
  expect(screen.queryByRole("group", { name: /^Size/ })).not.toBeInTheDocument();
  expect(screen.queryByRole("group", { name: /^Color/ })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Size guide" })).not.toBeInTheDocument();
  const addButton = screen.getByRole("button", { name: "Add to cart", exact: true });
  expect(addButton).toBeEnabled();
  fireEvent.click(addButton);
  expect(store.getState().cart.products[0]).toMatchObject({ id: "31", size: "", color: "", quantity: 1 });
});

test.each([
  { sizes: ["39", "40"], colors: [], option: "40", absentGroup: /^Color/, expectedSize: "40", expectedColor: "", hasGuide: true },
  { sizes: [], colors: ["White", "Black"], option: "Black", absentGroup: /^Size/, expectedSize: "", expectedColor: "Black", hasGuide: false },
])("requires only the API option group that exists: $option", ({ sizes, colors, option, absentGroup, expectedSize, expectedColor, hasGuide }) => {
  const source = { ...item, sizes, colors };
  useFetch.mockImplementation((url) => ({ data: url === "/product/31" ? source : [], loading: false, error: null, refetch }));
  const store = setupProduct();
  expect(screen.queryByRole("group", { name: absentGroup })).not.toBeInTheDocument();
  expect(Boolean(screen.queryByRole("button", { name: "Size guide" }))).toBe(hasGuide);
  const addButton = screen.getByRole("button", { name: "Add to cart", exact: true });
  expect(addButton).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: option, exact: true }));
  expect(addButton).toBeEnabled();
  fireEvent.click(addButton);
  expect(store.getState().cart.products[0]).toMatchObject({ size: expectedSize, color: expectedColor });
});
test("opens a fullscreen fitted photo and zooms only on request, with panning and fit-only swipes", async () => {
  const width = jest.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(function () {
    return this.classList.contains("productDialog__viewport") ? 600 : 0;
  });
  const height = jest.spyOn(HTMLElement.prototype, "clientHeight", "get").mockImplementation(function () {
    return this.classList.contains("productDialog__viewport") ? 400 : 0;
  });
  const naturalWidth = jest.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(600);
  const naturalHeight = jest.spyOn(HTMLImageElement.prototype, "naturalHeight", "get").mockReturnValue(800);
  const geometry = jest.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function () {
    return this.classList.contains("productDialog__viewport")
      ? { width: 600, height: 400, top: 0, bottom: 400, left: 0, right: 600 }
      : { width: 350, height: 430, top: 0, bottom: 430, left: 0, right: 350 };
  });
  try {
    setupProduct();
    const trigger = screen.getByRole("button", { name: "Enlarge Prada sneakers image" });
    trigger.focus();
    fireEvent.click(trigger);
    const dialog = await screen.findByRole("dialog", { name: "Prada sneakers" });
    fireEvent.load(within(dialog).getByRole("img"));
    expect(dialog).toHaveClass("MuiDialog-paperFullScreen");
    expect(within(dialog).getByRole("img")).toHaveStyle({ width: "300px", height: "400px" });
    expect(within(dialog).getByLabelText("Image zoom")).toHaveTextContent("100%");
    expect(within(dialog).getByRole("button", { name: "Zoom out" })).toBeDisabled();
    fireEvent.click(within(dialog).getByRole("button", { name: "Zoom in" }));
    expect(within(dialog).getByRole("img")).toHaveStyle({ width: "450px", height: "600px" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Zoom in" }));
    expect(within(dialog).getByRole("img")).toHaveStyle({ width: "600px", height: "800px" });
    expect(within(dialog).getByLabelText("Image zoom")).toHaveTextContent("200%");
    const viewport = within(dialog).getByRole("region", { name: "Product image" });
    const beforePan = viewport.scrollTop;
    fireEvent.keyDown(viewport, { key: "ArrowDown", shiftKey: true });
    expect(viewport.scrollTop).toBe(beforePan + 80);
    expect(within(dialog).getByRole("img")).toHaveAttribute("src", "/front.jpg");
    fireEvent.touchStart(viewport, { touches: [{ clientX: 250, clientY: 120 }] });
    fireEvent.touchEnd(viewport, { changedTouches: [{ clientX: 80, clientY: 120 }] });
    expect(within(dialog).getByRole("img")).toHaveAttribute("src", "/front.jpg");

    fireEvent.click(within(dialog).getByRole("button", { name: "Fit image to screen" }));
    expect(viewport).toHaveFocus();
    expect(within(dialog).getByLabelText("Image zoom")).toHaveTextContent("100%");
    expect(within(dialog).getByRole("img")).toHaveStyle({ width: "300px", height: "400px" });
    expect(within(dialog).getByRole("button", { name: "Zoom out" })).toBeDisabled();
    fireEvent.click(within(dialog).getByRole("button", { name: "Zoom in" }));
    expect(within(dialog).getByRole("img")).toHaveStyle({ width: "450px", height: "600px" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Zoom out" }));
    expect(viewport).toHaveFocus();
    fireEvent.touchStart(viewport, { touches: [{ clientX: 250, clientY: 120 }] });
    fireEvent.touchEnd(viewport, { changedTouches: [{ clientX: 80, clientY: 120 }] });
    expect(within(dialog).getByRole("img")).toHaveAttribute("src", "/back.jpg");
    expect(within(dialog).getByLabelText("Image zoom")).toHaveTextContent("100%");
    const zoomIn = within(dialog).getByRole("button", { name: "Zoom in" });
    zoomIn.focus();
    for (let step = 0; step < 5; step++) {
      fireEvent.click(zoomIn);
      expect(zoomIn).toHaveFocus();
    }
    fireEvent.click(zoomIn);
    expect(within(dialog).getByLabelText("Image zoom")).toHaveTextContent("400%");
    expect(zoomIn).toBeDisabled();
    expect(viewport).toHaveFocus();
    fireEvent.keyDown(dialog, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Prada sneakers" })).not.toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Enlarge Prada sneakers image" })).toHaveFocus();
  } finally {
    width.mockRestore();
    height.mockRestore();
    naturalWidth.mockRestore();
    naturalHeight.mockRestore();
    geometry.mockRestore();
  }
});