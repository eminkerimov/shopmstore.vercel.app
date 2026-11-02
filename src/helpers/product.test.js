import { getProductDisplay, getProductVariants } from "./product";

describe("product display data", () => {
  test("preserves API copy, identity and image URLs without editing the source", () => {
    const source = Object.freeze({ id: "1", title: "  Clique Men's uck Men's Archery Half-Zip Hoodie, ", desc: "Fashionable hoodie new", vendor: "  API vendor  ", sub_category: "hoodie", img: "https://example.test/front.jpg", img2: "https://example.test/back.jpg", price: 150.99, isNew: "false" });
    const display = getProductDisplay(source);
    expect(display).toMatchObject({ title: source.title, desc: source.desc, vendor: source.vendor, id: source.id, img: source.img, img2: source.img2, price: source.price, isNew: false });
    expect(source.desc).toBe("Fashionable hoodie new");
  });

  test("uses only a supplied vendor or brand and leaves absent copy empty", () => {
    expect(getProductDisplay({ title: "Prada sneakers", price: 120 })).toMatchObject({ vendor: "", desc: "" });
    expect(getProductDisplay({ brand: "API brand" }).vendor).toBe("API brand");
    expect(getProductDisplay({ vendor: "API vendor", brand: "Other brand" }).vendor).toBe("API vendor");
    expect(getProductDisplay({})).toMatchObject({ title: "", desc: "", vendor: "" });
  });

  test("normalizes numeric prices and new flags without inventing a sale", () => {
    expect(getProductDisplay({ price: "100", isNew: "true" })).toMatchObject({ price: 100, previousPrice: null, isNew: true });
    expect(getProductDisplay({ price: 100, oldPrice: 130 }).previousPrice).toBe(130);
    expect(getProductDisplay({ price: 100, compareAtPrice: 150 }).previousPrice).toBe(150);
    expect(getProductDisplay({ price: 100, oldPrice: 80 }).previousPrice).toBeNull();
  });
});

describe("product variants", () => {
  test("uses available API variants and removes duplicate or empty options", () => {
    const variants = getProductVariants({ sizes: [" M ", "L", "M", ""], colors: [{ name: "Blue" }, { label: "Red" }, "Blue", null] });
    expect(variants).toMatchObject({ sizes: ["M", "L"], colors: ["Blue", "Red"] });
  });

  test.each([
    { category: 2, sub_category: "shoes" },
    { category: "3", sub_category: "shoes" },
    { category: 3, sub_category: "hoodie" },
    { sub_category: "hat" },
    { sizes: null, colors: "Black" },
    { sizes: [], colors: [] },
  ])("does not invent sizes or colors when the API has no option arrays: %p", (product) => {
    expect(getProductVariants(product)).toMatchObject({ sizes: [], colors: [] });
  });

  test("supports size-only and color-only products independently", () => {
    expect(getProductVariants({ sizes: [40, 41] })).toMatchObject({ sizes: ["40", "41"], colors: [] });
    expect(getProductVariants({ colors: ["Black"] })).toMatchObject({ sizes: [], colors: ["Black"] });
  });
});