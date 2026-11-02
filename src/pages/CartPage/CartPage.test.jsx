import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import CartPage from "./CartPage";
import CartUndo from "../../components/CartUndo/CartUndo";
import cartReducer, { addToCart } from "../../redux/cartReducer";

test("a shopper changes quantity, removes a variant and restores it with Undo", () => {
  const store = configureStore({ reducer: { cart: cartReducer } });
  store.dispatch(addToCart({ id: "1", title: "Hoodie", price: 10.15, quantity: 1, size: "M", color: "Black" }));
  store.dispatch(addToCart({ id: "1", title: "Hoodie", price: 10.15, quantity: 1, size: "L", color: "Black" }));
  render(<Provider store={store}><MemoryRouter><CartPage /><CartUndo /></MemoryRouter></Provider>);
  fireEvent.click(screen.getByRole("button", { name: "Increase quantity for hoodie, m, black" }));
  expect(screen.getAllByText("$30.45")).toHaveLength(2);
  fireEvent.click(screen.getByRole("button", { name: "Remove Hoodie, M, Black" }));
  expect(screen.queryByText("M · Black")).not.toBeInTheDocument();
  expect(screen.getByText("L · Black")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Undo" }));
  expect(screen.getByText("M · Black")).toBeInTheDocument();
  expect(screen.getAllByText("$30.45")).toHaveLength(2);
});
