const normalizeSearchText = (value) => typeof value === "string"
  ? value.trim().replace(/\s+/g, " ").toLocaleLowerCase()
  : "";
const searchWords = (value) => value.match(/[\p{L}\p{N}]+/gu) || [];

export const searchProducts = (items, query) => {
  const phrase = normalizeSearchText(query);
  if (!Array.isArray(items) || !phrase) return [];
  const tokens = searchWords(phrase);
  if (!tokens.length) return [];

  return items.map((item, index) => {
    const title = normalizeSearchText(item?.title);
    const words = searchWords([title, item?.sub_category, item?.vendor, item?.brand]
      .map(normalizeSearchText).join(" "));
    const rank = title === phrase ? 0 : title.startsWith(phrase) ? 1 : title.includes(phrase) ? 2 : 3;
    return { item, index, words, rank };
  }).filter(({ words }) => tokens.every((token) => words.some((word) => word.startsWith(token))))
    .sort((first, second) => first.rank - second.rank || first.index - second.index)
    .map(({ item }) => item);
};

export default searchProducts;