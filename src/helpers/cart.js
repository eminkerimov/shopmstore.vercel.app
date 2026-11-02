/** @typedef {import("../types/domain").CartLine} CartLine */

export const MAX_QUANTITY = 99;

export const clampQuantity = (value) =>
  Math.min(MAX_QUANTITY, Math.max(1, Math.floor(Number(value)) || 1));

export const getCartItemKey = (item) =>
  JSON.stringify([String(item.id), item.size || "", item.color || ""]);

export const normalizeCartItem = (item) => {
  if (item?.id == null || !Number.isFinite(Number(item.price)) || Number(item.price) < 0) {
    return null;
  }
  const normalized = {
    id: String(item.id),
    title: String(item.title || "Product"),
    desc: String(item.desc || ""),
    img: String(item.img || ""),
    price: Math.round(Number(item.price) * 100) / 100,
    quantity: clampQuantity(item.quantity),
    size: String(item.size || ""),
    color: String(item.color || ""),
  };
  return { ...normalized, key: getCartItemKey(normalized) };
};

export const normalizeCart = (items = []) => {
  if (!Array.isArray(items)) return [];
  const result = [];
  for (const raw of items) {
    const item = normalizeCartItem(raw);
    if (!item) continue;
    const existing = result.find((entry) => entry.key === item.key);
    if (existing) existing.quantity = clampQuantity(existing.quantity + item.quantity);
    else result.push(item);
  }
  return result;
};

/** @param {CartLine[]} items */
export const cartSubtotal = (items) =>
  items.reduce((cents, item) => cents + Math.round(item.price * 100) * item.quantity, 0) / 100;

/** @param {CartLine[]} items */
export const cartQuantity = (items) =>
  items.reduce((quantity, item) => quantity + item.quantity, 0);

export const formatMoney = (amount) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(amount) || 0);

export const describeCartItem = (item) =>
  [item.title, item.size, item.color].filter(Boolean).join(", ");
