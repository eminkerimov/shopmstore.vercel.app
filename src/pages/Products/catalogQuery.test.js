import { filterCatalogProducts, getCatalogSubCategories, MAX_PRICE, readCatalogQuery, writeCatalogQuery } from "./catalogQuery";

test("catalog controls survive a shareable URL round trip", () => {
  const params = writeCatalogQuery(new URLSearchParams("campaign=portfolio"), {
    q: "linen shirt", sub: ["T-shirts", "Shoes"], max: 180, sort: "desc", collection: ["new", "sale"],
  });
  expect(readCatalogQuery(new URLSearchParams(params.toString()))).toEqual({
    query: "linen shirt", selectedSubCats: ["T-shirts", "Shoes"], maxPrice: 180, sort: "desc", selectedCollections: ["new", "sale"],
  });
  expect(params.get("campaign")).toBe("portfolio");
  expect(readCatalogQuery(new URLSearchParams("q=previous&sort=asc")).query).toBe("previous");
});

test("invalid URL controls fall back safely and resetting removes defaults", () => {
  expect(readCatalogQuery(new URLSearchParams("max=nope&sort=random&sub=Shoes&sub=Shoes&collection=unknown"))).toEqual({
    query: "", maxPrice: MAX_PRICE, sort: "asc", selectedSubCats: ["Shoes"], selectedCollections: [],
  });
  expect(readCatalogQuery(new URLSearchParams("max=-5")).maxPrice).toBe(0);
  expect(readCatalogQuery(new URLSearchParams("max=1000")).maxPrice).toBe(MAX_PRICE);
  const reset = writeCatalogQuery(new URLSearchParams("q=linen&sub=Shoes&max=50&sort=desc&collection=sale"), {
    q: null, sub: [], max: MAX_PRICE, sort: "asc", collection: null,
  });
  expect(reset.toString()).toBe("");
});

test("search, price, category and sorting compose without mutating API data", () => {
  const items = [
    { id: 1, title: "Linen SHIRT", price: "90", sub_category: "Shirts" },
    { id: 2, title: "Linen trousers", price: 80, sub_category: "Trousers" },
    { id: 3, title: "Cotton shirt", price: 40, sub_category: "Shirts" },
    { id: 4, title: "Linen shirt relaxed", price: 120, sub_category: "Shirts" },
  ];
  const query = readCatalogQuery(new URLSearchParams("q=+LINEN+&sub=Shirts&max=100&sort=desc"));
  expect(filterCatalogProducts(items, query).map((item) => item.id)).toEqual([1]);
  const all = readCatalogQuery(new URLSearchParams("sort=desc"));
  expect(filterCatalogProducts(items, all).map((item) => item.id)).toEqual([4, 1, 2, 3]);
  expect(items.map((item) => item.id)).toEqual([1, 2, 3, 4]);
});

test("sale uses only valid previous prices above the actual current price", () => {
  const items = [
    { id: "previous", price: 100, previousPrice: 150 },
    { id: "old", price: 100, oldPrice: "140" },
    { id: "compare", price: 100, compareAtPrice: 130 },
    { id: "missing", price: 100 },
    { id: "equal", price: 100, previousPrice: 100 },
    { id: "lower", price: 100, previousPrice: 90 },
    { id: "invalid", price: 100, previousPrice: "not a price" },
    { id: "invalid-current", price: "not a price", previousPrice: 150 },
  ];
  const query = readCatalogQuery(new URLSearchParams("collection=sale"));
  expect(filterCatalogProducts(items, query).map((item) => item.id)).toEqual(["previous", "old", "compare"]);
  expect(filterCatalogProducts([{ id: "full-price", price: 100 }], query)).toEqual([]);
});

test("new arrivals require a true API flag and compose with other controls", () => {
  const items = [
    { id: 1, title: "Linen shoes", price: 90, sub_category: "shoes", isNew: true },
    { id: 2, title: "Linen shoes relaxed", price: 60, sub_category: "shoes", isNew: "true" },
    { id: 3, title: "Linen shoes old", price: 40, sub_category: "shoes", isNew: "false" },
    { id: 4, title: "Linen shirt", price: 50, sub_category: "shirts", isNew: true },
    { id: 5, title: "Linen shoes unknown", price: 30, sub_category: "shoes" },
  ];
  const query = readCatalogQuery(new URLSearchParams("collection=new&sub=shoes&q=linen&max=100&sort=desc"));
  expect(filterCatalogProducts(items, query).map((item) => item.id)).toEqual([1, 2]);
});

test("all-product filter options come from available API subcategories", () => {
  const items = [
    { sub_category: "shoes" }, { sub_category: "accessories" }, { sub_category: "shoes" },
    { sub_category: "" }, { sub_category: null }, {},
  ];
  expect(getCatalogSubCategories(items)).toEqual(["accessories", "shoes"]);
  expect(items[0].sub_category).toBe("shoes");
});

test("checking both collections shows either selection within the chosen product type", () => {
  const items = [
    { id: "new", sub_category: "shoes", price: 80, isNew: true },
    { id: "sale", sub_category: "shoes", price: 90, previousPrice: 120 },
    { id: "full-price", sub_category: "shoes", price: 90 },
    { id: "other-type", sub_category: "coat", price: 110, isNew: true },
  ];
  const query = readCatalogQuery(new URLSearchParams("collection=new&collection=sale&sub=shoes"));
  expect(filterCatalogProducts(items, query).map((item) => item.id)).toEqual(["new", "sale"]);
});
