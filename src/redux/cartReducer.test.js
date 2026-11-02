import reducer, { addToCart, removeItem, undoRemove, updateQuantity } from "./cartReducer";
import { cartSubtotal, getCartItemKey, normalizeCart } from "../helpers/cart";

const product = { id: 1, title: "Hoodie", price: 10.15, quantity: 1, size: "M", color: "Black" };

test("different variants stay separate while matching variants merge", () => {
  let state = reducer(undefined, addToCart(product));
  state = reducer(state, addToCart({ ...product, id: "1", quantity: 2 }));
  state = reducer(state, addToCart({ ...product, size: "L" }));
  expect(state.products).toHaveLength(2);
  expect(state.products.map((item) => item.quantity)).toEqual([3, 1]);
});

test("quantity changes affect the correct variant and stay within allowed limits", () => {
  let state = reducer(undefined, addToCart(product));
  state = reducer(state, addToCart({ ...product, size: "L" }));
  const key = getCartItemKey(product);
  state = reducer(state, updateQuantity({ key, quantity: 4 }));
  expect(cartSubtotal(state.products)).toBe(50.75);
  state = reducer(state, updateQuantity({ key, quantity: 0 }));
  expect(state.products[0].quantity).toBe(1);
  state = reducer(state, updateQuantity({ key, quantity: 200 }));
  expect(state.products[0].quantity).toBe(99);
});

test("undo restores the removed variant at its original position", () => {
  let state = reducer(undefined, addToCart(product));
  state = reducer(state, addToCart({ ...product, size: "L" }));
  state = reducer(state, removeItem(getCartItemKey(product)));
  expect(state.products[0].size).toBe("L");
  state = reducer(state, undoRemove());
  expect(state.products.map((item) => item.size)).toEqual(["M", "L"]);
});

test("undo merges with an identical variant added after removal", () => {
  let state = reducer(undefined, addToCart({ ...product, quantity: 2 }));
  state = reducer(state, removeItem(getCartItemKey(product)));
  state = reducer(state, addToCart(product));
  state = reducer(state, undoRemove());
  expect(state.products).toHaveLength(1);
  expect(state.products[0].quantity).toBe(3);
});

test("legacy persisted items are normalized without retaining derived totals", () => {
  const items = normalizeCart([
    { ...product, quantity: 2 },
    { ...product, id: "1", quantity: 3 },
    { id: "bad", price: -1 },
  ]);
  expect(items).toHaveLength(1);
  expect(items[0]).toMatchObject({ id: "1", quantity: 5, key: getCartItemKey(product) });
  expect(normalizeCart(null)).toEqual([]);
});

test("money is accumulated in cents", () => {
  expect(cartSubtotal([{ price: 0.1, quantity: 3 }, { price: 0.2, quantity: 2 }])).toBe(0.7);
});
