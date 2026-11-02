import { createSlice } from "@reduxjs/toolkit";

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: { products: [] },
  reducers: {
    toggleWishlist: (state, action) => {
      const index = state.products.findIndex(
        (item) => String(item.id) === String(action.payload.id)
      );
      if (index !== -1) state.products.splice(index, 1);
      else state.products.push(action.payload);
    },
    clearWishlist: (state) => { state.products = []; },
  },
});

export const { toggleWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
