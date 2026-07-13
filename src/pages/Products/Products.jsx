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

const fallbackCategory = {
  title: "Collection",
  number: "00",
  image:
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1800&q=85",
  description:
    "A considered selection of contemporary pieces for everyday style.",
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

  const currentCategory =
    categoryContent[displayedCategoryId] || fallbackCategory;

  useEffect(() => {
    Object.values(categoryContent).forEach((category) => {
      const image = new Image();
      image.src = category.image;
    });
  }, []);

  useEffect(() => {
    if (catId === displayedCategoryId) {
      return;
    }

    let isActive = true;
    const nextCategory = categoryContent[catId] || fallbackCategory;
    const nextImage = new Image();

    setIsHeroChanging(true);

    nextImage.src = nextCategory.image;

    nextImage.onload = () => {
      if (!isActive) {
        return;
      }

      setDisplayedCategoryId(catId);
      setIsHeroChanging(false);
    };

    nextImage.onerror = () => {
      if (!isActive) {
        return;
      }

      setDisplayedCategoryId(catId);
      setIsHeroChanging(false);
    };

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
    if (!resultsRef.current) {
      return;
    }

    const currentHeight = resultsRef.current.scrollHeight;

    setResultsMinHeight((previousHeight) =>
      Math.max(previousHeight, currentHeight)
    );
  }, [data, selectedSubCats, maxPrice, sort]);

  const preserveResultsHeight = () => {
    if (!resultsRef.current) {
      return;
    }

    const currentHeight = resultsRef.current.getBoundingClientRect().height;

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

  const handlePriceChange = (event) => {
    preserveResultsHeight();
    setMaxPrice(Number(event.target.value));
  };

  const handleSortChange = (value) => {
    preserveResultsHeight();
    setSort(value);
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
          <div className="catalogFilters__header">
            <h2>Filters</h2>
            <span>{selectedSubCats.length}</span>
          </div>

          <div className="filterItem">
            <h3>Product categories</h3>

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

                  <span className="checkOption__label">{item}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filterItem">
            <h3>Filter by price</h3>

            <div className="priceFilter">
              <div className="priceFilter__values">
                <span>$0</span>
                <strong>${maxPrice}</strong>
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
            </div>
          </div>

          <div className="filterItem">
            <h3>Sort by</h3>

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

                <span className="radioOption__label">
                  Price: low to high
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

                <span className="radioOption__label">
                  Price: high to low
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
              <span>Price up to</span>
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