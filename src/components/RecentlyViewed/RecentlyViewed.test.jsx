import React from "react";
import "@testing-library/jest-dom";
import { act, render, screen, waitFor } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import cartReducer from "../../redux/cartReducer";
import wishlistReducer from "../../redux/wishlistReducer";
import RecentlyViewed from "./RecentlyViewed";
import { RECENTLY_VIEWED_KEY, readRecentlyViewed, recordRecentlyViewed } from "../../helpers/recentlyViewed";

const item = (id) => ({ id: String(id), title: "API product " + id, desc: "Original API description", price: id * 10, img: "/front-" + id + ".jpg", img2: "/back-" + id + ".jpg", category: "2", sub_category: "hoodie" });
const setup = (product, currentProductId = product.id) => {
  const store = configureStore({ reducer: { cart: cartReducer, wishlist: wishlistReducer } });
  const tree = (nextProduct, nextId) => <Provider store={store}><MemoryRouter><RecentlyViewed product={nextProduct} currentProductId={nextId} /></MemoryRouter></Provider>;
  const view = render(tree(product, currentProductId));
  return { ...view, show: (nextProduct, nextId = nextProduct.id) => view.rerender(tree(nextProduct, nextId)) };
};
beforeEach(() => { localStorage.clear(); });
afterEach(() => { jest.restoreAllMocks(); });

test("records the first successful product but hides empty previous history", () => {
  setup(item(1));
  expect(screen.queryByRole("heading", { name: "Recently viewed" })).not.toBeInTheDocument();
  expect(readRecentlyViewed()).toEqual([item(1)]);
});

test("shows newest previous products once, updates revisits, and excludes the current product before the four-item limit", async () => {
  const view = setup(item(1));
  for (let id = 2; id <= 6; id++) view.show(item(id));
  await waitFor(() => expect(document.querySelectorAll(".recentlyViewed .cardImageLink")).toHaveLength(4));
  expect([...document.querySelectorAll(".recentlyViewed .cardImageLink")].map((link) => link.getAttribute("href"))).toEqual(["/product/5", "/product/4", "/product/3", "/product/2"]);
  view.show({ ...item(3), title: "Updated API title" });
  await waitFor(() => expect(document.querySelector(".recentlyViewed .cardImageLink")).toHaveAttribute("href", "/product/6"));
  expect([...document.querySelectorAll(".recentlyViewed .cardImageLink")].map((link) => link.getAttribute("href"))).toEqual(["/product/6", "/product/5", "/product/4", "/product/2"]);
  expect(readRecentlyViewed().map((product) => product.id)).toEqual(["3", "6", "5", "4", "2"]);
  expect(readRecentlyViewed()[0].title).toBe("Updated API title");
});

test("restores cards after remount and preserves their original product links and prices", async () => {
  recordRecentlyViewed(item(1));
  const view = setup(item(2));
  expect(await screen.findByRole("link", { name: "View API product 1" })).toHaveAttribute("href", "/product/1");
  view.unmount();
  setup(item(2));
  expect(await screen.findByRole("link", { name: "View API product 1" })).toHaveAttribute("href", "/product/1");
  expect(screen.getByText("$10.00")).toBeInTheDocument();
  expect(readRecentlyViewed().map((product) => product.id)).toEqual(["2", "1"]);
});

test("does not record a response for a different route id", () => {
  recordRecentlyViewed(item(1));
  setup(item(2), "3");
  expect(readRecentlyViewed()).toEqual([item(1)]);
});

test("syncs another tab's history and storage clearing without writing back", async () => {
  recordRecentlyViewed(item(1));
  setup(item(2));
  const writes = jest.spyOn(Storage.prototype, "setItem");
  localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify([item(3), item(2)]));
  writes.mockClear();
  act(() => { window.dispatchEvent(new StorageEvent("storage", { key: RECENTLY_VIEWED_KEY })); });
  expect(await screen.findByRole("link", { name: "View API product 3" })).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "View API product 1" })).not.toBeInTheDocument();
  expect(writes).not.toHaveBeenCalled();
  localStorage.clear();
  act(() => { window.dispatchEvent(new StorageEvent("storage", { key: null })); });
  expect(screen.queryByRole("heading", { name: "Recently viewed" })).not.toBeInTheDocument();
  expect(writes).not.toHaveBeenCalled();
});

test("recovers from malformed saved history and unavailable writes without breaking the page", () => {
  localStorage.setItem(RECENTLY_VIEWED_KEY, "{invalid-json");
  jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Storage unavailable"); });
  expect(() => setup(item(1))).not.toThrow();
  expect(screen.queryByRole("heading", { name: "Recently viewed" })).not.toBeInTheDocument();
});
