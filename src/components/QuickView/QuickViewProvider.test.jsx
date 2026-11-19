import React from "react";
import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import Card from "../Card/Card";
import QuickViewProvider from "./QuickViewProvider";
import cartReducer from "../../redux/cartReducer";
import wishlistReducer from "../../redux/wishlistReducer";
import { startProductImageTransition } from "../../helpers/productImageTransition";
import useFetch from "../../custom/useFetch";

jest.mock("../../helpers/productImageTransition", () => ({ startProductImageTransition: jest.fn() }));
jest.mock("../../custom/useFetch", () => ({ __esModule: true, default: jest.fn(() => {
  throw new Error("Quick view must use the existing catalog item without fetching it again.");
}) }));

const plainProduct = {
  id: "51",
  title: "Clique Men's uck Men's Hoodie",
  desc: "The original API description.",
  price: "90.50",
  img: "/quick-front.jpg",
  img2: "/quick-back.jpg",
  sub_category: "hoodie",
};
const variantProduct = { ...plainProduct, id: "31", title: "API sneakers", sizes: ["39", "40"], colors: ["White", "Black"] };
const catalogLocation = "/products/2?sub=shoes&q=API";
const originalMatchMedia = window.matchMedia;

const LocationProbe = () => {
  const location = useLocation();
  return <output data-testid="current-location">{location.pathname}{location.search}</output>;
};

const setup = (item = plainProduct) => {
  const actions = [];
  const recordActions = () => (next) => (action) => {
    actions.push(action);
    return next(action);
  };
  const store = configureStore({
    reducer: { cart: cartReducer, wishlist: wishlistReducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(recordActions),
  });
  render(<Provider store={store}><MemoryRouter initialEntries={[catalogLocation]}>
    <QuickViewProvider>
      <LocationProbe />
      <Routes>
        <Route path="/products/:id" element={<Card item={item} />} />
        <Route path="/product/:id" element={<h1>Full product details</h1>} />
      </Routes>
    </QuickViewProvider>
  </MemoryRouter></Provider>);
  return { store, actions };
};

const openQuickView = async (item = plainProduct) => {
  const trigger = screen.getByRole("button", { name: `Quick view: ${item.title}` });
  trigger.focus();
  fireEvent.click(trigger);
  return screen.findByRole("dialog", { name: item.title });
};

beforeEach(() => {
  jest.clearAllMocks();
  window.matchMedia = jest.fn((query) => ({
    matches: query === "(prefers-reduced-motion: reduce)",
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
});

afterEach(() => {
  window.matchMedia = originalMatchMedia;
});

test("the card opens the raw catalog item without navigation, another request, or a photo transition", async () => {
  const { store } = setup();
  const dialog = await openQuickView();
  expect(within(dialog).getByRole("heading", { name: plainProduct.title })).toBeInTheDocument();
  expect(within(dialog).getByText(plainProduct.desc)).toBeInTheDocument();
  expect(within(dialog).getByRole("img", { name: `${plainProduct.title}, view 1` })).toHaveAttribute("src", plainProduct.img);
  expect(screen.getByTestId("current-location")).toHaveTextContent(catalogLocation);
  expect(startProductImageTransition).not.toHaveBeenCalled();
  expect(useFetch).not.toHaveBeenCalled();
  expect(store.getState().cart.products).toEqual([]);
  expect(store.getState().wishlist.products).toEqual([]);
});

test("Escape restores card focus and reopening resets the selected photo, quantity, size, and color", async () => {
  setup(variantProduct);
  let dialog = await openQuickView(variantProduct);
  fireEvent.click(within(dialog).getByRole("button", { name: "Show quick view image 2" }));
  fireEvent.click(within(dialog).getByRole("button", { name: "Increase quantity" }));
  fireEvent.click(within(dialog).getByRole("button", { name: "40", exact: true }));
  fireEvent.click(within(dialog).getByRole("button", { name: "Black", exact: true }));
  expect(within(dialog).getByRole("img", { name: `${variantProduct.title}, view 2` })).toHaveAttribute("src", variantProduct.img2);
  expect(within(dialog).getByRole("button", { name: "Add to cart", exact: true })).toBeEnabled();
  fireEvent.keyDown(dialog, { key: "Escape", code: "Escape" });
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(screen.getByRole("button", { name: `Quick view: ${variantProduct.title}` })).toHaveFocus();
  expect(screen.getByTestId("current-location")).toHaveTextContent(catalogLocation);

  dialog = await openQuickView(variantProduct);
  expect(within(dialog).getByRole("img", { name: `${variantProduct.title}, view 1` })).toHaveAttribute("src", variantProduct.img);
  expect(within(dialog).getByRole("button", { name: "Show quick view image 1" })).toHaveAttribute("aria-pressed", "true");
  expect(within(dialog).getByRole("group", { name: "Quantity", exact: true }).querySelector("output")).toHaveTextContent("1");
  expect(within(dialog).getByRole("button", { name: "40", exact: true })).toHaveAttribute("aria-pressed", "false");
  expect(within(dialog).getByRole("button", { name: "Black", exact: true })).toHaveAttribute("aria-pressed", "false");
  expect(within(dialog).getByRole("button", { name: "Add to cart", exact: true })).toBeDisabled();
});

test("a product without API variants adds the exact quantity-two payload and opens the bag only after dialog exit", async () => {
  const { store, actions } = setup();
  const dialog = await openQuickView();
  expect(within(dialog).queryByRole("group", { name: /^Size/ })).not.toBeInTheDocument();
  expect(within(dialog).queryByRole("group", { name: /^Color/ })).not.toBeInTheDocument();
  const addButton = within(dialog).getByRole("button", { name: "Add to cart", exact: true });
  expect(addButton).toBeEnabled();
  fireEvent.click(within(dialog).getByRole("button", { name: "Increase quantity" }));
  fireEvent.click(addButton);

  const addAction = actions.find((action) => action.type === "cart/addToCart");
  expect(addAction.payload).toEqual({
    id: plainProduct.id,
    title: plainProduct.title,
    desc: plainProduct.desc,
    price: 90.5,
    img: plainProduct.img,
    quantity: 2,
    size: "",
    color: "",
  });
  expect(store.getState().cart.products).toHaveLength(1);
  expect(store.getState().cart.products[0]).toMatchObject(addAction.payload);
  expect(store.getState().cart.cartOpen).toBe(false);
  expect(actions.some((action) => action.type === "cart/handleCart")).toBe(false);
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  await waitFor(() => expect(store.getState().cart.cartOpen).toBe(true));
  expect(actions.filter((action) => action.type === "cart/handleCart")).toEqual([{ type: "cart/handleCart", payload: true }]);
});

test("only supplied API choices are offered, both groups are required, and different sizes remain separate cart lines", async () => {
  const { store } = setup(variantProduct);
  let dialog = await openQuickView(variantProduct);
  expect(within(dialog).getByRole("group", { name: /^Size/ }).querySelectorAll("button")).toHaveLength(2);
  expect(within(dialog).getByRole("group", { name: /^Color/ }).querySelectorAll("button")).toHaveLength(2);
  let addButton = within(dialog).getByRole("button", { name: "Add to cart", exact: true });
  expect(addButton).toBeDisabled();
  fireEvent.click(within(dialog).getByRole("button", { name: "40", exact: true }));
  expect(addButton).toBeDisabled();
  fireEvent.click(within(dialog).getByRole("button", { name: "Black", exact: true }));
  expect(addButton).toBeEnabled();
  fireEvent.click(addButton);
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

  dialog = await openQuickView(variantProduct);
  addButton = within(dialog).getByRole("button", { name: "Add to cart", exact: true });
  fireEvent.click(within(dialog).getByRole("button", { name: "Black", exact: true }));
  expect(addButton).toBeDisabled();
  fireEvent.click(within(dialog).getByRole("button", { name: "39", exact: true }));
  fireEvent.click(addButton);
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(store.getState().cart.products).toHaveLength(2);
  expect(store.getState().cart.products).toEqual(expect.arrayContaining([
    expect.objectContaining({ id: "31", size: "40", color: "Black", quantity: 1 }),
    expect.objectContaining({ id: "31", size: "39", color: "Black", quantity: 1 }),
  ]));
});

test("View full details navigates to the product and closes the dialog without opening the bag", async () => {
  const { store } = setup(variantProduct);
  const dialog = await openQuickView(variantProduct);
  const detailsLink = within(dialog).getByRole("link", { name: "View full details" });
  expect(detailsLink).toHaveAttribute("href", "/product/31");
  fireEvent.click(detailsLink);
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(screen.getByTestId("current-location")).toHaveTextContent("/product/31");
  expect(screen.getByRole("heading", { name: "Full product details" })).toBeInTheDocument();
  expect(store.getState().cart.cartOpen).toBe(false);
  expect(store.getState().cart.products).toEqual([]);
  expect(startProductImageTransition).not.toHaveBeenCalled();
});