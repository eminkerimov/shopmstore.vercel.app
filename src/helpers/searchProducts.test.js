import searchProducts, { searchProducts as namedSearchProducts } from "./searchProducts";

test("normalizes query and source whitespace and casing without replacing the raw product", () => {
  const item = Object.freeze({ id: "1", title: "  LINEN\t shirt  ", desc: "Raw copy.", sub_category: "Tops" });
  const result = searchProducts([item], " \t LiNeN \n  sHiRt ");
  expect(result).toEqual([item]);
  expect(result[0]).toBe(item);
  expect(result[0].title).toBe("  LINEN\t shirt  ");
  expect(namedSearchProducts).toBe(searchProducts);
});

test("requires every token across title, subcategory, vendor and brand, independently of token order", () => {
  const match = { id: "1", title: "Running sneaker", sub_category: "Shoes", vendor: "Studio", brand: "North" };
  const missingBrand = { id: "2", title: "Running sneaker", sub_category: "Shoes", vendor: "Studio" };
  const missingType = { id: "3", title: "Running shirt", sub_category: "Tops", vendor: "Studio", brand: "North" };
  expect(searchProducts([missingBrand, match, missingType], "NORTH studio shoes run")).toEqual([match]);
  expect(searchProducts([match], "shoes north")).toEqual([match]);
  expect(searchProducts([match], "north missing")).toEqual([]);
});

test("ranks exact title, title prefix and title phrase before field matches, preserving ties in source order", () => {
  const items = [
    { id: "brand-first", title: "Trainer", brand: "Red shoe" },
    { id: "contains-first", title: "Soft red shoe for walking" },
    { id: "prefix-first", title: "Red shoe classic" },
    { id: "exact-first", title: "Red shoe" },
    { id: "contains-second", title: "Canvas red shoe" },
    { id: "prefix-second", title: "Red shoe leather" },
    { id: "exact-second", title: "  RED  SHOE  " },
    { id: "mixed-fields", title: "Red laces", sub_category: "Shoes" },
  ];
  expect(searchProducts(items, "red shoe").map((item) => item.id)).toEqual([
    "exact-first", "exact-second", "prefix-first", "prefix-second",
    "contains-first", "contains-second", "brand-first", "mixed-fields",
  ]);
});

test("does not mutate the input array or add metadata to frozen API objects", () => {
  const first = Object.freeze({ id: "a", title: "Blue summer shirt", category: "1" });
  const second = Object.freeze({ id: "b", title: "Shirt", category: "2" });
  const source = Object.freeze([first, second]);
  const result = searchProducts(source, "shirt");
  expect(result).toEqual([second, first]);
  expect(result[0]).toBe(second);
  expect(result[1]).toBe(first);
  expect(result).not.toBe(source);
  expect(source).toEqual([first, second]);
  expect(Object.keys(first)).toEqual(["id", "title", "category"]);
  expect(Object.keys(second)).toEqual(["id", "title", "category"]);
});

test.each(["", " \t\n ", null, undefined, 42, {}, []])("empty or nontext queries return no results: %p", (query) => {
  expect(searchProducts([{ title: "Shirt" }], query)).toEqual([]);
});

test.each([null, undefined, {}, "shirt", 7])("a nonarray product source returns no results: %p", (source) => {
  expect(searchProducts(source, "shirt")).toEqual([]);
});

test("ignores absent and nontext searchable fields rather than coercing objects into matches", () => {
  const safe = { id: "1", title: null, sub_category: "Shoes", vendor: { name: "Object vendor" }, brand: 42 };
  const items = [null, undefined, 7, "shirt", {}, { title: { toString: () => { throw new Error("Unexpected coercion"); } } }, safe];
  expect(searchProducts(items, "shoes")).toEqual([safe]);
  expect(searchProducts(items, "object")).toEqual([]);
  expect(searchProducts(items, "42")).toEqual([]);
  expect(searchProducts([{ title: "Shirt", desc: "Hidden brand phrase", category: "shoes" }], "hidden")).toEqual([]);
});

test("word prefixes keep men separate from women and support partial product names", () => {
  const men = { title: "Men's Archery Hoodie" };
  const women = { title: "Women's Archery Hoodie" };
  expect(searchProducts([women, men], "men")).toEqual([men]);
  expect(searchProducts([women, men], "men arch hood")).toEqual([men]);
  expect(searchProducts([women, men], "hood")).toEqual([women, men]);
  expect(searchProducts([{ title: "Men’s jacket" }, women], "men")).toEqual([{ title: "Men’s jacket" }]);
});

test("matches Unicode word prefixes across raw title and brand fields", () => {
  const item = { title: "Шерстяной худи", brand: "Север Élan" };
  expect(searchProducts([item], "СЕВ шер")).toEqual([item]);
  expect(searchProducts([item], "él худ")).toEqual([item]);
  expect(searchProducts([item], "вер")).toEqual([]);
  expect(searchProducts([item], "---")).toEqual([]);
});