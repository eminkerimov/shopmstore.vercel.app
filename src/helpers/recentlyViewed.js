export const RECENTLY_VIEWED_KEY = "mstore-recently-viewed";
export const MAX_RECENTLY_VIEWED = 5;

const snapshotFields = [
  "id", "title", "desc", "price", "img", "img2", "images", "sub_category", "category", "type", "isNew",
  "previousPrice", "oldPrice", "compareAtPrice", "vendor", "brand", "sizes", "colors",
];

const productSnapshot = (product) => {
  if (!product || typeof product !== "object" || Array.isArray(product)) return null;
  const { id, title, price } = product;
  const validId = typeof id === "string" ? Boolean(id.trim()) : typeof id === "number" && Number.isFinite(id);
  const validPrice = (typeof price === "number" || (typeof price === "string" && Boolean(price.trim())))
    && Number.isFinite(Number(price)) && Number(price) >= 0;
  if (!validId || typeof title !== "string" || !title.trim() || !validPrice) return null;

  return snapshotFields.reduce((snapshot, field) => {
    if (Object.prototype.hasOwnProperty.call(product, field)) snapshot[field] = product[field];
    return snapshot;
  }, {});
};

export const normalizeRecentlyViewed = (items) => {
  if (!Array.isArray(items)) return [];
  const result = [];
  const seen = new Set();
  for (const item of items) {
    const snapshot = productSnapshot(item);
    if (!snapshot || seen.has(String(snapshot.id))) continue;
    seen.add(String(snapshot.id));
    result.push(snapshot);
    if (result.length === MAX_RECENTLY_VIEWED) break;
  }
  return result;
};

export const addRecentlyViewed = (items, product) => {
  const previous = normalizeRecentlyViewed(items);
  const snapshot = productSnapshot(product);
  if (!snapshot) return previous;
  return [snapshot, ...previous.filter((item) => String(item.id) !== String(snapshot.id))]
    .slice(0, MAX_RECENTLY_VIEWED);
};

const resolveStorage = (storage) => {
  if (storage !== undefined) return storage;
  try { return typeof window === "undefined" ? null : window.localStorage; }
  catch { return null; }
};

export const readRecentlyViewed = (storage) => {
  try {
    const stored = resolveStorage(storage)?.getItem(RECENTLY_VIEWED_KEY);
    return stored ? normalizeRecentlyViewed(JSON.parse(stored)) : [];
  } catch { return []; }
};

export const recordRecentlyViewed = (product, storage) => {
  const items = addRecentlyViewed(readRecentlyViewed(storage), product);
  try { resolveStorage(storage)?.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(items)); }
  catch { /* The caller can keep the returned list when storage is unavailable. */ }
  return items;
};

export const clearRecentlyViewed = (storage) => {
  try { resolveStorage(storage)?.removeItem(RECENTLY_VIEWED_KEY); }
  catch { /* Clearing the in-memory list still works when storage is unavailable. */ }
  return [];
};