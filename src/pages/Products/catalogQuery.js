export const MAX_PRICE = 500;

export const readCatalogQuery = (params) => {
  const rawPrice = params.get("max");
  const parsedPrice = rawPrice === null || rawPrice.trim() === "" ? MAX_PRICE : Number(rawPrice);
  const collection = params.get("collection");
  return {
    query: (params.get("q") || "").slice(0, 100),
    maxPrice: Number.isFinite(parsedPrice) ? Math.max(0, Math.min(MAX_PRICE, parsedPrice)) : MAX_PRICE,
    sort: params.get("sort") === "desc" ? "desc" : "asc",
    selectedSubCats: [...new Set(params.getAll("sub").filter(Boolean))],
    collection: collection === "sale" || collection === "new" ? collection : "",
  };
};

export const writeCatalogQuery = (params, changes) => {
  const next = new URLSearchParams(params);
  Object.entries(changes).forEach(([key, value]) => {
    next.delete(key);
    if (Array.isArray(value)) value.forEach((item) => next.append(key, item));
    else if (value !== "" && value !== null && value !== undefined &&
      !(key === "max" && Number(value) >= MAX_PRICE) && !(key === "sort" && value === "asc")) {
      next.set(key, String(value));
    }
  });
  return next;
};

export const getCatalogSubCategories = (items) => [...new Set(items
  .map((item) => item.sub_category)
  .filter((name) => typeof name === "string" && name.trim()))]
  .sort((first, second) => first.localeCompare(second));

const hasSalePrice = (item) => {
  const price = Number(item.price);
  const rawPreviousPrice = item.previousPrice ?? item.oldPrice ?? item.compareAtPrice;
  const previousPrice = Number(rawPreviousPrice);
  return item.price != null && Number.isFinite(price) && price >= 0 &&
    rawPreviousPrice != null && Number.isFinite(previousPrice) && previousPrice > price;
};

export const filterCatalogProducts = (items, { query, maxPrice, sort, selectedSubCats, collection = "" }) => {
  const search = query.trim().toLocaleLowerCase();
  return items
    .filter((item) => Number(item.price) <= maxPrice &&
      (!selectedSubCats.length || selectedSubCats.includes(item.sub_category)) &&
      (!search || String(item.title || "").toLocaleLowerCase().includes(search)) &&
      (collection !== "new" || item.isNew === true || item.isNew === "true") &&
      (collection !== "sale" || hasSalePrice(item)))
    .sort((a, b) => sort === "desc" ? Number(b.price) - Number(a.price) : Number(a.price) - Number(b.price));
};
