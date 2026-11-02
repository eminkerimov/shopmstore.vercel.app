export const getProductDisplay = (product = {}) => {
  const price = Number(product.price);
  const rawPreviousPrice = product.previousPrice ?? product.oldPrice ?? product.compareAtPrice;
  const previousPrice = Number(rawPreviousPrice);

  return {
    ...product,
    title: String(product.title ?? ""),
    desc: String(product.desc ?? ""),
    vendor: String(product.vendor || product.brand || ""),
    price: Number.isFinite(price) && price >= 0 ? price : 0,
    previousPrice: rawPreviousPrice != null && Number.isFinite(previousPrice) && previousPrice > price ? previousPrice : null,
    isNew: product.isNew === true || product.isNew === "true",
  };
};

const uniqueOptions = (options) => [...new Set((Array.isArray(options) ? options : [])
  .map((option) => typeof option === "object" && option !== null ? option.label || option.name || option.value : option)
  .filter((option) => typeof option === "string" || typeof option === "number")
  .map((option) => String(option).trim())
  .filter(Boolean))];

export const getProductVariants = (product = {}) => {
  const type = String(product.sub_category || "").toLowerCase();
  return {
    sizes: uniqueOptions(product.sizes),
    colors: uniqueOptions(product.colors),
    sizeKind: ["hat", "accessories"].includes(type) ? "accessory"
      : type === "shoes" ? "shoes" : String(product.category) === "3" ? "kids" : "apparel",
  };
};

export const formatProductPrice = (price) => new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
}).format(Number(price) || 0);