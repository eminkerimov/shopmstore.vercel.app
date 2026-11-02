import { configureStore, combineReducers } from "@reduxjs/toolkit";
import cartReducer, { initialCartState } from "./cartReducer";
import wishlistReducer from "./wishlistReducer";
import { normalizeCart } from "../helpers/cart";
import {
  persistStore, persistReducer, createTransform,
  FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

const rootReducer = combineReducers({ cart: cartReducer, wishlist: wishlistReducer });

const cartPersistence = createTransform(
  (cart) => ({ products: cart.products }),
  (cart) => ({ ...initialCartState, products: normalizeCart(cart?.products) }),
  { whitelist: ["cart"] }
);

const persistedReducer = persistReducer({
  key: "root",
  version: 2,
  storage,
  whitelist: ["cart", "wishlist"],
  transforms: [cartPersistence],
}, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
    },
  }),
});

export const persistor = persistStore(store);
