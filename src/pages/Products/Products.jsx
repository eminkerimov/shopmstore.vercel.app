import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Drawer from "@mui/material/Drawer";
import useMediaQuery from "@mui/material/useMediaQuery";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import { Link, useParams, useSearchParams } from "react-router-dom";
import List from "../../components/List/List";
import AsyncState from "../../components/AsyncState/AsyncState";
import useFetch from "../../custom/useFetch";
import CatalogFilters from "./CatalogFilters";
import useCatalogResultScroll from "./useCatalogResultScroll";
import { MAX_PRICE, readCatalogQuery, writeCatalogQuery, filterCatalogProducts, getCatalogSubCategories } from "./catalogQuery";
import "./Products.scss";

const categoryContent = {
  all: {
    title: "All products",
    image: "https://images.unsplash.com/photo-1483181957632-8bda974cbc91?auto=format&fit=crop&w=1800&q=85",
    description: "Explore the complete collection, from everyday essentials to finishing touches.",
  },
  1: {
    title: "Women",
    number: "01",
    image: "https://images.unsplash.com/photo-1483181957632-8bda974cbc91?auto=format&fit=crop&w=1800&q=85",
    description: "Modern silhouettes and considered essentials selected for everyday confidence.",
  },
  2: {
    title: "Men",
    number: "02",
    image: "https://images.unsplash.com/photo-1550995694-3f5f4a7e1bd2?auto=format&fit=crop&w=1800&q=85",
    description: "Refined everyday pieces built around comfort, simplicity and modern form.",
  },
  3: {
    title: "Children",
    number: "03",
    image: "https://img.magnific.com/free-photo/full-length-portrait-cute-little-kid-girl-stylish-jeans-clothes-smiling-standing-white-kids-fashion-concept_155003-20300.jpg?w=1060&t=st=1671631414",
    description: "Comfortable and expressive pieces created for movement, play and everyday life.",
  },
};

const collectionContent = {
  sale: { title: "Sale", description: "Explore pieces with reduced prices from across the collection." },
  new: { title: "New arrivals", description: "Discover the latest additions from across the collection." },
};

const subCategoryContent = {
  shoes: {
    title: "Shoes",
    image: "https://cdn.dsmcdn.com/ty374/product/media/images/20220328/10/76982078/185505707/2/2_org_zoom.jpg",
    description: "Explore footwear from across the collection.",
  },
  accessories: {
    title: "Accessories",
    image: "https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?q=80&w=1170&auto=format&fit=crop",
    description: "Discover the finishing touches from across the collection.",
  },
};

const Products = () => {
  const { id: catId } = useParams();
  const isAllProducts = catId === "all";
  const validCategory = Object.prototype.hasOwnProperty.call(categoryContent, catId);
  const [searchParams, setSearchParams] = useSearchParams();
  const queryState = useMemo(() => readCatalogQuery(searchParams), [searchParams]);
  const { maxPrice, sort, selectedSubCats, query, collection } = queryState;
  const isMobile = useMediaQuery("(max-width:780px)", { noSsr: true });
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filtersClosing, setFiltersClosing] = useState(false);
  const catalogContentRef = useRef(null);
  const catalogToolbarRef = useRef(null);
  const requestResultsScroll = useCatalogResultScroll({
    anchorRef: catalogContentRef,
    toolbarRef: catalogToolbarRef,
    deferred: filtersOpen || filtersClosing,
  });

  const { data: category, loading: categoryLoading, error: categoryError, refetch: refetchCategories } =
    useFetch(validCategory && !isAllProducts ? "/category/" + catId : null);
  const { data, loading, error, refetch } =
    useFetch(validCategory ? isAllProducts ? "/product" : "/product?category=" + catId : null);
  const availableSubCategories = useMemo(
    () => isAllProducts ? getCatalogSubCategories(Array.isArray(data) ? data : [])
      : Array.isArray(category?.subCategories) ? category.subCategories : [],
    [isAllProducts, data, category]
  );
  const focusedSubCategory = selectedSubCats.length === 1 ? subCategoryContent[selectedSubCats[0]] : null;
  const currentCategory = isAllProducts
    ? { ...categoryContent.all, ...(collectionContent[collection] || focusedSubCategory || {}) }
    : categoryContent[catId];
  const activeFilterCount = selectedSubCats.length + (maxPrice < MAX_PRICE ? 1 : 0) + (collection ? 1 : 0);
  const hasSearch = Boolean(query.trim());
  const hasActiveFilters = activeFilterCount > 0 || hasSearch;
  const products = useMemo(
    () => filterCatalogProducts(Array.isArray(data) ? data : [], queryState),
    [data, queryState]
  );
  const productCount = products.length + " " + (products.length === 1 ? "product" : "products");



  const updateQuery = (changes, options) =>
    setSearchParams((previous) => {
      const next = writeCatalogQuery(previous, changes);
      requestResultsScroll(next.toString());
      return next;
    }, options);
  const closeFilters = useCallback(() => {
    setFiltersClosing(true);
    setFiltersOpen(false);
  }, []);
  const applyFilters = () => {
    requestResultsScroll(searchParams.toString());
    closeFilters();
  };

  useEffect(() => {
    setFiltersOpen(false);
    setFiltersClosing(false);
  }, [catId]);
  useEffect(() => {
    if (!isMobile && filtersOpen) closeFilters();
  }, [isMobile, filtersOpen, closeFilters]);

  const handleCategoryChange = (event) => {
    const { value, checked } = event.target;
    updateQuery({ sub: checked ? [...selectedSubCats, value] : selectedSubCats.filter((item) => item !== value) });
  };
  const resetFilters = () => updateQuery({ sub: [], max: null, q: null, collection: null });
  const filterProps = {
    categories: availableSubCategories,
    categoriesLoading: isAllProducts ? loading : categoryLoading,
    categoriesError: isAllProducts ? error : categoryError,
    onCategoriesRetry: isAllProducts ? refetch : refetchCategories,
    selectedSubCats,
    maxPrice,
    priceLimit: MAX_PRICE,
    hasActiveFilters,
    onCategoryChange: handleCategoryChange,
    onPriceChange: (event) => updateQuery({ max: Number(event.target.value) }, { replace: true }),
    onReset: resetFilters,
  };

  if (!validCategory) {
    return (
      <main className="products">
        <AsyncState title="Collection not found" message="This collection doesn't exist. Discover our latest pieces instead." action={<Link to="/products/1">Explore collections</Link>} />
      </main>
    );
  }

  return (
    <main className="products">
      <section className="catalogHero" key={catId + "-" + currentCategory.title}>
        <div className="catalogHero__visual">
          <img src={currentCategory.image} alt={currentCategory.title + " collection"} />
          <span className="catalogHero__visualIndex">{currentCategory.title}</span>
        </div>
        <div className="catalogHero__content">
          <div className="catalogHero__top">
            {currentCategory.number && <span className="catalogHero__number">{currentCategory.number}</span>}
            <span className="catalogHero__eyebrow">M-store collection</span>
          </div>
          <div className="catalogHero__main">
            <h1>{currentCategory.title}</h1>
            <p>{currentCategory.description}</p>
          </div>
          <div className="catalogHero__bottom"><span>New season</span><span>Selected essentials</span></div>
        </div>
      </section>

      <section className="catalog" aria-label={currentCategory.title + " products"}>
        {!isMobile && (
          <aside className="catalogFilters" aria-labelledby="catalog-filters-title">
            <CatalogFilters {...filterProps} headingId="catalog-filters-title" />
          </aside>
        )}

        <div className="catalogContent" ref={catalogContentRef}>
          <div className="catalogToolbar" ref={catalogToolbarRef}>
            <div className="catalogToolbar__title">
              <h2>{currentCategory.title} collection</h2>
              <span role="status">{loading ? "Loading collection..." : error ? "Collection unavailable" : productCount}</span>
            </div>
            <div className="catalogToolbar__actions">
              {isMobile && (
                <button type="button" className="catalogFilterToggle" aria-haspopup="dialog" aria-expanded={filtersOpen} aria-controls={filtersOpen ? "mobile-catalog-filters" : undefined} onClick={() => { setFiltersClosing(false); setFiltersOpen(true); }}>
                  <TuneOutlinedIcon />
                  Filters
                  {activeFilterCount > 0 && <span className="catalogFilterToggle__count">{activeFilterCount}</span>}
                </button>
              )}
              <label className="catalogSort">
                <span className="catalogSort__label">Sort by price</span>
                <select value={sort} onChange={(event) => updateQuery({ sort: event.target.value })} aria-label="Sort by price">
                  <option value="asc" aria-label="Price: low to high">{isMobile ? "Price ↑" : "Price: low to high"}</option>
                  <option value="desc" aria-label="Price: high to low">{isMobile ? "Price ↓" : "Price: high to low"}</option>
                </select>
                <KeyboardArrowDownRoundedIcon aria-hidden="true" />
              </label>
            </div>
          </div>

          <div className="catalogSearch">
            <SearchRoundedIcon aria-hidden="true" />
            <input type="search" aria-label="Search this collection" placeholder="Search this collection..." value={query} maxLength={100} onChange={(event) => updateQuery({ q: event.target.value }, { replace: true })} />
            {query && <button type="button" aria-label="Clear search" onClick={() => updateQuery({ q: null })}><CloseRoundedIcon /></button>}
          </div>

          {hasActiveFilters && (
            <div className="activeFilters" aria-label="Active filters">
              {collection && (
                <button type="button" className="activeFilters__chip" aria-label={"Remove " + collectionContent[collection].title + " filter"} onClick={() => updateQuery({ collection: null })}>
                  <span className="activeFilters__chipLabel">{collectionContent[collection].title}</span><CloseRoundedIcon />
                </button>
              )}
              {selectedSubCats.map((item) => (
                <button type="button" className="activeFilters__chip" key={item} aria-label={"Remove " + item + " filter"} onClick={() => updateQuery({ sub: selectedSubCats.filter((selected) => selected !== item) })}>
                  <span className="activeFilters__chipLabel">{item}</span><CloseRoundedIcon />
                </button>
              ))}
              {maxPrice < MAX_PRICE && (
                <button type="button" className="activeFilters__chip" aria-label="Remove price filter" onClick={() => updateQuery({ max: null })}><span className="activeFilters__chipLabel">Up to ${maxPrice}</span><CloseRoundedIcon /></button>
              )}
              <button type="button" className="activeFilters__clear" onClick={resetFilters}>Clear all</button>
            </div>
          )}

          <div className="catalogResults" aria-busy={loading}>
            <List products={products} loading={loading} error={error} hasActiveFilters={hasActiveFilters} onReset={resetFilters} onRetry={refetch} />
          </div>
        </div>
      </section>

      <Drawer anchor="right" transitionDuration={reducedMotion ? 0 : 250} open={isMobile && filtersOpen} onClose={closeFilters} SlideProps={{ onExited: () => setFiltersClosing(false) }} PaperProps={{ id: "mobile-catalog-filters", className: "catalogFilterDrawer", role: "dialog", "aria-modal": true, "aria-labelledby": "mobile-catalog-filters-title" }}>
        <div className="catalogFilterDrawer__top">
          <span>{currentCategory.title} collection</span>
          <button type="button" className="catalogFilterDrawer__close" aria-label="Close filters" onClick={closeFilters} autoFocus><CloseRoundedIcon /></button>
        </div>
        <div className="catalogFilterDrawer__body"><CatalogFilters {...filterProps} headingId="mobile-catalog-filters-title" /></div>
        <div className="catalogFilterDrawer__footer">
          <button type="button" onClick={applyFilters}>{loading || error ? "View collection" : "Show " + productCount}</button>
        </div>
      </Drawer>
    </main>
  );
};

export default Products;
