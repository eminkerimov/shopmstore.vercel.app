import { createSlice } from "@reduxjs/toolkit";
import { cartQuantity, cartSubtotal, clampQuantity, getCartItemKey, normalizeCartItem } from "../helpers/cart";

export const initialCartState = {
  products: [],
  cartOpen: false,
  lastRemoved: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState: initialCartState,
  reducers: {
    addToCart: (state, action) => {
      const incoming = normalizeCartItem(action.payload);
      if (!incoming) return;
      const existing = state.products.find((item) => getCartItemKey(item) === incoming.key);
      if (existing) existing.quantity = clampQuantity(existing.quantity + incoming.quantity);
      else state.products.push(incoming);
    },
    updateQuantity: (state, action) => {
      const item = state.products.find((entry) => getCartItemKey(entry) === action.payload.key);
      if (item) item.quantity = clampQuantity(action.payload.quantity);
    },
    removeItem: (state, action) => {
      const index = state.products.findIndex((item) =>
        getCartItemKey(item) === action.payload || String(item.id) === String(action.payload)
      );
      if (index < 0) return;
      state.lastRemoved = { item: state.products[index], index };
      state.products.splice(index, 1);
    },
    undoRemove: (state) => {
      if (!state.lastRemoved) return;
      const { item, index } = state.lastRemoved;
      const existing = state.products.find((entry) => getCartItemKey(entry) === getCartItemKey(item));
      if (existing) existing.quantity = clampQuantity(existing.quantity + item.quantity);
      else state.products.splice(Math.min(index, state.products.length), 0, item);
      state.lastRemoved = null;
    },
    dismissUndo: (state) => { state.lastRemoved = null; },
    resetCart: (state) => {
      state.products = [];
      state.lastRemoved = null;
    },
    handleCart: (state, action) => { state.cartOpen = Boolean(action.payload); },
  },
});

export const { addToCart, updateQuantity, removeItem, undoRemove, dismissUndo, resetCart, handleCart } = cartSlice.actions;
export const selectCartItems = (state) => state.cart.products;
export const selectCartSubtotal = (state) => cartSubtotal(state.cart.products);
export const selectCartQuantity = (state) => cartQuantity(state.cart.products);
export default cartSlice.reducer;
