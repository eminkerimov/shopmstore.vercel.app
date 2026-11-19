import {
  RECENTLY_VIEWED_KEY, MAX_RECENTLY_VIEWED, normalizeRecentlyViewed, addRecentlyViewed,
  readRecentlyViewed, recordRecentlyViewed, clearRecentlyViewed,
} from "./recentlyViewed";

const product = (id, changes = {}) => ({ id, title: `API product ${id}`, price: "29.95", img: `/product-${id}.jpg`, ...changes });
const createStorage = () => {
  const values = new Map();
  return {
    getItem: jest.fn((key) => values.get(key) ?? null),
    setItem: jest.fn((key, value) => values.set(key, String(value))),
    removeItem: jest.fn((key) => values.delete(key)),
  };
};

test("stores the five newest unique products, including the current product, and restores their order after reload", () => {
  const storage = createStorage();
  for (let id = 1; id <= 6; id++) recordRecentlyViewed(product(String(id)), storage);
  const restored = readRecentlyViewed(storage);
  expect(RECENTLY_VIEWED_KEY).toBe("mstore-recently-viewed");
  expect(MAX_RECENTLY_VIEWED).toBe(5);
  expect(restored.map((item) => item.id)).toEqual(["6", "5", "4", "3", "2"]);
  expect(storage.setItem).toHaveBeenLastCalledWith(RECENTLY_VIEWED_KEY, JSON.stringify(restored));
});

test("revisiting a string-or-number identity updates its snapshot and moves it first without reload or StrictMode duplicates", () => {
  const storage = createStorage();
  recordRecentlyViewed(product("1"), storage);
  recordRecentlyViewed(product("2"), storage);
  recordRecentlyViewed(product("3"), storage);
  const updated = product(1, { title: "New API title", price: 44, img: "/updated.jpg", colors: ["Green"] });
  recordRecentlyViewed(updated, storage);
  const repeated = recordRecentlyViewed(updated, storage);
  expect(repeated.map((item) => item.id)).toEqual([1, "3", "2"]);
  expect(repeated[0]).toEqual(updated);
  expect(readRecentlyViewed(storage)).toEqual(repeated);
});

test("persists only raw card and Quick View fields, preserving copy, image arrays, option objects, and original price values", () => {
  const source = Object.freeze({
    id: 11, title: "  Clique Men's uck Men's Hoodie  ", desc: "Raw API copy", price: "120.50",
    img: "/front.jpg", img2: "/back.jpg", images: Object.freeze(["/detail.jpg", "/other.jpg"]),
    sub_category: "hoodie", category: "2", type: "featured", isNew: "true",
    previousPrice: "150", oldPrice: 155, compareAtPrice: "160",
    vendor: " Raw vendor ", brand: "API brand",
    sizes: Object.freeze([Object.freeze({ label: " M " }), 42]),
    colors: Object.freeze([Object.freeze({ name: "Black" }), " Natural "]),
    unrelatedField: "discard this", selectedSize: "M", quantity: 7,
  });
  const storage = createStorage();
  recordRecentlyViewed(source, storage);
  const { unrelatedField, selectedSize, quantity, ...expected } = source;
  expect(readRecentlyViewed(storage)).toEqual([expected]);
  expect(readRecentlyViewed(storage)[0].price).toBe("120.50");
  expect(source.unrelatedField).toBe("discard this");
  const withoutOptions = addRecentlyViewed([], product("plain"))[0];
  expect(withoutOptions).not.toHaveProperty("sizes");
  expect(withoutOptions).not.toHaveProperty("colors");
  expect(withoutOptions).not.toHaveProperty("vendor");
  expect(withoutOptions).not.toHaveProperty("previousPrice");
});

test("pure updates do not mutate existing snapshots or source order and ignore an invalid current product", () => {
  const first = Object.freeze(product("1"));
  const second = Object.freeze(product("2"));
  const source = Object.freeze([first, second]);
  expect(addRecentlyViewed(source, product(2, { title: "Updated second" }))).toEqual([
    product(2, { title: "Updated second" }), first,
  ]);
  expect(addRecentlyViewed(source, { id: "invalid", title: "Missing price" })).toEqual([first, second]);
  expect(source).toEqual([first, second]);
  expect(first.title).toBe("API product 1");
});

test("validation skips unusable products while accepting zero identities, free products, and numeric string prices", () => {
  const invalid = [
    null, undefined, [], "product", {}, product(""), product("  "), product(null), product(false), product({}),
    product(NaN), product(Infinity), product("x", { title: "" }), product("x", { title: " \t " }),
    product("x", { title: 123 }), product("x", { price: -1 }), product("x", { price: Infinity }),
    product("x", { price: "not a price" }), product("x", { price: " " }), product("x", { price: null }),
    product("x", { price: false }), product("x", { price: [] }),
  ];
  const free = product(0, { price: 0 });
  const priced = product("valid", { price: "0.00" });
  expect(normalizeRecentlyViewed([...invalid, free, priced])).toEqual([free, priced]);
  expect(normalizeRecentlyViewed({ products: [free] })).toEqual([]);
  expect(addRecentlyViewed(null, free)).toEqual([free]);
});

test("normalizes stored duplicates and invalid entries before applying the five-item limit", () => {
  const storage = createStorage();
  const newest = product("1", { title: "Newest stored snapshot" });
  storage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify([
    null, newest, product(1, { title: "Older duplicate" }), ...[2, 3, 4, 5, 6].map((id) => product(id)),
  ]));
  const items = readRecentlyViewed(storage);
  expect(items.map((item) => item.id)).toEqual(["1", 2, 3, 4, 5]);
  expect(items[0].title).toBe("Newest stored snapshot");
});

test.each([null, "", "{broken", "null", "{}", '"not an array"', "42"])("missing, malformed or nonarray stored data is ignored: %p", (stored) => {
  const storage = { getItem: jest.fn(() => stored) };
  expect(readRecentlyViewed(storage)).toEqual([]);
});

test("storage access, quota and removal errors never prevent returning usable session state", () => {
  const storage = {
    getItem: jest.fn(() => { throw new Error("Access denied"); }),
    setItem: jest.fn(() => { throw new Error("Quota exceeded"); }),
    removeItem: jest.fn(() => { throw new Error("Access denied"); }),
  };
  const current = product("1");
  expect(readRecentlyViewed(storage)).toEqual([]);
  expect(recordRecentlyViewed(current, storage)).toEqual([current]);
  expect(clearRecentlyViewed(storage)).toEqual([]);
  expect(recordRecentlyViewed(current, null)).toEqual([current]);
  expect(readRecentlyViewed(null)).toEqual([]);
});

test("a failed write still returns the previous readable items plus the new product", () => {
  const storage = createStorage();
  recordRecentlyViewed(product("old"), storage);
  storage.setItem.mockImplementation(() => { throw new Error("Quota exceeded"); });
  expect(recordRecentlyViewed(product("new"), storage)).toEqual([product("new"), product("old")]);
  expect(readRecentlyViewed(storage)).toEqual([product("old")]);
});

test("default localStorage access is guarded even when its getter throws", () => {
  const descriptor = Object.getOwnPropertyDescriptor(window, "localStorage");
  Object.defineProperty(window, "localStorage", { configurable: true, get: () => { throw new Error("Blocked storage"); } });
  try {
    expect(readRecentlyViewed()).toEqual([]);
    expect(recordRecentlyViewed(product("1"))).toEqual([product("1")]);
    expect(clearRecentlyViewed()).toEqual([]);
  } finally {
    Object.defineProperty(window, "localStorage", descriptor);
  }
});

test("clear removes only recently-viewed storage and returns an empty list", () => {
  const storage = createStorage();
  recordRecentlyViewed(product("1"), storage);
  storage.setItem("wishlist", "keep this");
  expect(clearRecentlyViewed(storage)).toEqual([]);
  expect(storage.removeItem).toHaveBeenCalledWith(RECENTLY_VIEWED_KEY);
  expect(readRecentlyViewed(storage)).toEqual([]);
  expect(storage.getItem("wishlist")).toBe("keep this");
});