import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Payment from "./Payment";
import cartReducer, { addToCart } from "../../redux/cartReducer";
import { DEMO_DETAILS } from "../../helpers/checkout";

const originalMatchMedia = window.matchMedia;
let compact = false;
const setupCheckout = () => {
  const store = configureStore({ reducer: { cart: cartReducer } });
  const item = { id: "31", title: "Raw API product title, unchanged", price: 10.15, img: "/front.jpg", size: "M", color: "Black", quantity: 2 };
  store.dispatch(addToCart(item));
  store.dispatch(addToCart({ ...item, size: "L", quantity: 1 }));
  render(<Provider store={store}><MemoryRouter initialEntries={["/payment"]}><Routes>
    <Route path="/payment" element={<Payment />} />
    <Route path="/cart" element={<h1>Your bag</h1>} />
    <Route path="/order-complete" element={<h1>Order confirmed</h1>} />
  </Routes></MemoryRouter></Provider>);
  return store;
};

beforeEach(() => {
  compact = false;
  window.matchMedia = jest.fn().mockImplementation((query) => ({
    matches: compact && query === "(max-width: 900px)",
    media: query,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  }));
});
afterEach(() => { window.matchMedia = originalMatchMedia; });

test("mobile summary starts collapsed with its total visible and preserves form input when toggled", () => {
  compact = true;
  setupCheckout();
  const toggle = screen.getByRole("button", { name: /Show order summary/ });
  expect(toggle).toHaveAttribute("aria-expanded", "false");
  expect(toggle).toHaveAttribute("aria-controls", "checkout-order-summary");
  expect(toggle).toHaveTextContent("3 items");
  expect(toggle).toHaveTextContent("$30.45");
  expect(screen.queryByRole("list", { name: "Items in your order" })).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "reader@example.com" } });
  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute("aria-expanded", "true");
  expect(toggle).toHaveTextContent("Hide order summary");
  expect(within(screen.getByRole("list", { name: "Items in your order" })).getAllByRole("listitem")).toHaveLength(2);
  fireEvent.click(toggle);
  expect(screen.queryByRole("list", { name: "Items in your order" })).not.toBeInTheDocument();
  expect(screen.getByLabelText("Email address")).toHaveValue("reader@example.com");
});

test("desktop summary shows the actual variant lines, quantities and exact prices", () => {
  setupCheckout();
  expect(screen.getByRole("heading", { level: 1, name: "Checkout" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Return to bag" })).toHaveAttribute("href", "/cart");
  expect(screen.queryByRole("button", { name: /Show order summary/ })).not.toBeInTheDocument();
  const items = within(screen.getByRole("list", { name: "Items in your order" })).getAllByRole("listitem");
  expect(items).toHaveLength(2);
  expect(within(items[0]).getByText("Raw API product title, unchanged")).toBeInTheDocument();
  expect(within(items[0]).getByText("M · Black")).toBeInTheDocument();
  expect(within(items[0]).getByText("Qty 2 · $10.15 each")).toBeInTheDocument();
  expect(within(items[0]).getByText("$20.30")).toBeInTheDocument();
  expect(within(items[1]).getByText("L · Black")).toBeInTheDocument();
  expect(within(screen.getByRole("complementary", { name: "Order summary" })).getAllByText("$30.45")).toHaveLength(2);
});

test("grouped checkout keeps validation focus, test filling and processing controls", () => {
  const store = setupCheckout();
  fireEvent.click(screen.getByRole("button", { name: "Place demo order · $30.45" }));
  expect(screen.getAllByRole("alert")).toHaveLength(6);
  expect(screen.getByLabelText("Email address")).toHaveFocus();
  fireEvent.click(screen.getByRole("button", { name: "Fill test details" }));
  expect(screen.getByLabelText("Email address")).toHaveValue(DEMO_DETAILS.email);
  expect(screen.getByLabelText("Test card number")).toHaveValue(DEMO_DETAILS.cardNumber);
  expect(screen.queryAllByRole("alert")).toHaveLength(0);
  fireEvent.click(screen.getByRole("button", { name: "Place demo order · $30.45" }));
  expect(screen.getByRole("group", { name: "Contact" })).toBeDisabled();
  expect(screen.getByRole("group", { name: "Payment" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Fill test details" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Processing demo order..." })).toBeDisabled();
  expect(store.getState().cart.products).toHaveLength(2);
});