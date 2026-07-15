import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  products: [],
};

export const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    toggleWishlist: (state, action) => {
      const index = state.products.findIndex(
        (item) => item.id === action.payload.id
      );

      if (index !== -1) {
        state.products.splice(index, 1);
      } else {
        state.products.push(action.payload);
      }
    },
  },
});

export const { toggleWishlist } = wishlistSlice.actions;

export default wishlistSlice.reducer;