import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import List from "../../components/List/List";
import useFetch from "../../custom/useFetch";
import "./Products.scss";

const categoryContent = {
  1: {
    title: "Women",
    number: "01",
    image:
      "https://images.unsplash.com/photo-1483181957632-8bda974cbc91?auto=format&fit=crop&w=1800&q=85",
    description:
      "Modern silhouettes and considered essentials selected for everyday confidence.",
  },
  2: {
    title: "Men",
    number: "02",
    image:
      "https://images.unsplash.com/photo-1550995694-3f5f4a7e1bd2?auto=format&fit=crop&w=1800&q=85",
    description:
      "Refined everyday pieces built around comfort, simplicity and modern form.",
  },
  3: {
    title: "Children",
    number: "03",
    image: "https://img.magnific.com/free-photo/full-length-portrait-cute-little-kid-girl-stylish-jeans-clothes-smiling-standing-white-kids-fashion-concept_155003-20300.jpg?w=1060&t=st=1671631414",
    description:
      "Comfortable and expressive pieces created for movement, play and everyday life.",
  },
};

const Products = () => {
  const catId = parseInt(useParams().id, 10);

  const [maxPrice, setMaxPrice] = useState(500);
  const [sort, setSort] = useState("asc");
  const [selectedSubCats, setSelectedSubCats] = useState([]);

  const [displayedCategoryId, setDisplayedCategoryId] = useState(catId);
  const [isHeroChanging, setIsHeroChanging] = useState(false);
  const [resultsMinHeight, setResultsMinHeight] = useState(0);

  const resultsRef = useRef(null);

  const { data } = useFetch(`/category/${catId}`);

  const currentCategory = categoryContent[displayedCategoryId];

  const hasActiveFilters =
    selectedSubCats.length > 0 || maxPrice < 500 || sort !== "asc";

  useEffect(() => {
    Object.values(categoryContent).forEach((category) => {
      const image = new Image();
      image.src = category.image;
    });
  }, []);

  useEffect(() => {
    if (catId === displayedCategoryId) return;

    let isActive = true;
    const nextCategory = categoryContent[catId];
    const nextImage = new Image();

    setIsHeroChanging(true);
    nextImage.src = nextCategory.image;

    const updateCategory = () => {
      if (!isActive) return;

      setDisplayedCategoryId(catId);
      setIsHeroChanging(false);
    };

    nextImage.onload = updateCategory;
    nextImage.onerror = updateCategory;

    return () => {
      isActive = false;
    };
  }, [catId, displayedCategoryId]);

  useEffect(() => {
    setSelectedSubCats([]);
    setMaxPrice(500);
    setSort("asc");
    setResultsMinHeight(0);
  }, [catId]);

  useLayoutEffect(() => {
    if (!resultsRef.current) return;

    const currentHeight = resultsRef.current.scrollHeight;

    setResultsMinHeight((previousHeight) =>
      Math.max(previousHeight, currentHeight)
    );
  }, [data, selectedSubCats, maxPrice, sort]);

  const preserveResultsHeight = () => {
    if (!resultsRef.current) return;

    const currentHeight =
      resultsRef.current.getBoundingClientRect().height;

    setResultsMinHeight((previousHeight) =>
      Math.max(previousHeight, currentHeight)
    );
  };

  const handleCategoryChange = (event) => {
    preserveResultsHeight();

    const value = event.target.value;
    const isChecked = event.target.checked;

    setSelectedSubCats((currentItems) =>
      isChecked
        ? [...currentItems, value]
        : currentItems.filter((item) => item !== value)
    );
  };

  const removeCategory = (category) => {
    preserveResultsHeight();

    setSelectedSubCats((currentItems) =>
      currentItems.filter((item) => item !== category)
    );
  };

  const handlePriceChange = (event) => {
    preserveResultsHeight();
    setMaxPrice(Number(event.target.value));
  };

  const handleSortChange = (value) => {
    preserveResultsHeight();
    setSort(value);
  };

  const resetFilters = () => {
    preserveResultsHeight();

    setSelectedSubCats([]);
    setMaxPrice(500);
    setSort("asc");
  };

  return (
    <main className="products">
      <section
        className={`catalogHero ${
          isHeroChanging ? "catalogHero--changing" : ""
        }`}
      >
        <div className="catalogHero__visual">
          <img
            src={currentCategory.image}
            alt={`${currentCategory.title} collection`}
          />

          <span className="catalogHero__visualIndex">
            {currentCategory.title}
          </span>
        </div>

        <div className="catalogHero__content">
          <div className="catalogHero__top">
            <span className="catalogHero__number">
              {currentCategory.number}
            </span>

            <span className="catalogHero__eyebrow">
              M-store collection
            </span>
          </div>

          <div className="catalogHero__main">
            <h1>{currentCategory.title}</h1>
            <p>{currentCategory.description}</p>
          </div>

          <div className="catalogHero__bottom">
            <span>New season</span>
            <span>Selected essentials</span>
          </div>
        </div>
      </section>

      <section className="catalog">
        <aside className="catalogFilters">
          <div className="catalogFilters__heading">
            <div>
              <span>Refine selection</span>
              <h2>Filters</h2>
            </div>

            <button
              type="button"
              className="catalogFilters__reset"
              onClick={resetFilters}
              disabled={!hasActiveFilters}
            >
              Reset
            </button>
          </div>

          {selectedSubCats.length > 0 && (
            <div className="activeFilters">
              <span className="activeFilters__label">
                Active
              </span>

              <div className="activeFilters__list">
                {selectedSubCats.map((item) => (
                  <button
                    type="button"
                    className="activeFilters__chip"
                    key={item}
                    onClick={() => removeCategory(item)}
                  >
                    <span>{item}</span>
                    <span aria-hidden="true">×</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div
            className={`filterCard ${
              selectedSubCats.length > 0
                ? "filterCard--active"
                : ""
            }`}
          >
            <div className="filterCard__header">
              <span className="filterCard__index">01</span>
              <h3>Categories</h3>
            </div>

            <div className="filterOptions">
              {data?.subCategories?.map((item) => (
                <label className="checkOption" key={item}>
                  <input
                    type="checkbox"
                    value={item}
                    checked={selectedSubCats.includes(item)}
                    onChange={handleCategoryChange}
                  />

                  <span className="checkOption__control">
                    <span />
                  </span>

                  <span className="checkOption__label">
                    {item}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div
            className={`filterCard ${
              maxPrice < 500 ? "filterCard--active" : ""
            }`}
          >
            <div className="filterCard__header">
              <span className="filterCard__index">02</span>
              <h3>Price range</h3>
            </div>

            <div className="priceFilter">
              <div className="priceFilter__values">
                <div>
                  <span>From</span>
                  <strong>$0</strong>
                </div>

                <div>
                  <span>Up to</span>
                  <strong>${maxPrice}</strong>
                </div>
              </div>

              <input
                className="priceFilter__range"
                type="range"
                min={0}
                max={500}
                value={maxPrice}
                onChange={handlePriceChange}
                style={{
                  "--range-progress": `${(maxPrice / 500) * 100}%`,
                }}
              />

              <div className="priceFilter__limits">
                <span>$0</span>
                <span>$500</span>
              </div>
            </div>
          </div>

          <div
            className={`filterCard ${
              sort !== "asc" ? "filterCard--active" : ""
            }`}
          >
            <div className="filterCard__header">
              <span className="filterCard__index">03</span>
              <h3>Sort products</h3>
            </div>

            <div className="sortOptions">
              <label className="radioOption">
                <input
                  type="radio"
                  value="asc"
                  name="price"
                  checked={sort === "asc"}
                  onChange={() => handleSortChange("asc")}
                />

                <span className="radioOption__control">
                  <span />
                </span>

                <span className="radioOption__content">
                  <strong>Lowest first</strong>
                  <span>Price ascending</span>
                </span>
              </label>

              <label className="radioOption">
                <input
                  type="radio"
                  value="desc"
                  name="price"
                  checked={sort === "desc"}
                  onChange={() => handleSortChange("desc")}
                />

                <span className="radioOption__control">
                  <span />
                </span>

                <span className="radioOption__content">
                  <strong>Highest first</strong>
                  <span>Price descending</span>
                </span>
              </label>
            </div>
          </div>
        </aside>

        <div className="catalogContent">
          <div className="catalogToolbar">
            <div className="catalogToolbar__title">
              <h2>{currentCategory.title} collection</h2>

              <span>
                {selectedSubCats.length
                  ? `${selectedSubCats.length} active filters`
                  : "All products"}
              </span>
            </div>

            <div className="catalogToolbar__meta">
              <span>Price limit</span>
              <strong>${maxPrice}</strong>
            </div>
          </div>

          <div
            ref={resultsRef}
            className="catalogResults"
            style={{
              minHeight: resultsMinHeight
                ? `${resultsMinHeight}px`
                : undefined,
            }}
          >
            <List
              catId={catId}
              maxPrice={maxPrice}
              sort={sort}
              subCats={selectedSubCats}
            />
          </div>
        </div>
      </section>
    </main>
  );
};

export default Products;