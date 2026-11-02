import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import cartReducer, { addToCart, removeItem } from "../../redux/cartReducer";
import CartUndo from "./CartUndo";

test("each consecutive removal receives a full Undo interval", () => {
  jest.useFakeTimers();
  const store = configureStore({ reducer: { cart: cartReducer } });
  for (const id of ["first", "second"]) {
    store.dispatch(addToCart({ id, title: id, price: 25, quantity: 1 }));
  }
  const [first, second] = store.getState().cart.products;
  const { unmount } = render(<Provider store={store}><CartUndo /></Provider>);
  act(() => { store.dispatch(removeItem(first.key)); });
  act(() => { jest.advanceTimersByTime(5000); });
  act(() => { store.dispatch(removeItem(second.key)); });
  act(() => { jest.advanceTimersByTime(2500); });
  expect(screen.getByRole("button", { name: "Undo" })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Undo" }));
  expect(store.getState().cart.products).toEqual([second]);
  unmount();
  jest.useRealTimers();
});
