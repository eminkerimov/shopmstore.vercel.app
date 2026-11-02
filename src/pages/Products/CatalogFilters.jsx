import React from "react";

const CatalogFilters = ({
  headingId,
  categories,
  categoriesLoading,
  categoriesError,
  onCategoriesRetry,
  selectedSubCats,
  maxPrice,
  priceLimit,
  hasActiveFilters,
  onCategoryChange,
  onPriceChange,
  onReset,
}) => (
  <>
    <div className="catalogFilters__heading">
      <div>
        <span>Refine selection</span>
        <h2 id={headingId}>Filters</h2>
      </div>
      <button
        type="button"
        className="catalogFilters__reset"
        onClick={onReset}
        disabled={!hasActiveFilters}
      >
        Reset
      </button>
    </div>

    <section
      className={
        "filterCard " + (selectedSubCats.length ? "filterCard--active" : "")
      }
      aria-labelledby={headingId + "-categories"}
    >
      <div className="filterCard__header">
        <span className="filterCard__index" aria-hidden="true">01</span>
        <h3 id={headingId + "-categories"}>Categories</h3>
      </div>
      <div className="filterOptions">
        {categoriesLoading ? (
          <p className="catalogFilters__status">Loading categories...</p>
        ) : categoriesError ? (
          <div className="catalogFilters__status" role="alert"><p>Categories unavailable.</p><button type="button" className="catalogFilters__retry" onClick={onCategoriesRetry}>Try again</button></div>
        ) : (
          categories.map((item) => (
            <label className="checkOption" key={item}>
              <input
                type="checkbox"
                value={item}
                checked={selectedSubCats.includes(item)}
                onChange={onCategoryChange}
              />
              <span className="checkOption__control" aria-hidden="true">
                <span />
              </span>
              <span className="checkOption__label">{item}</span>
            </label>
          ))
        )}
      </div>
    </section>

    <section
      className={
        "filterCard " + (maxPrice < priceLimit ? "filterCard--active" : "")
      }
      aria-labelledby={headingId + "-price"}
    >
      <div className="filterCard__header">
        <span className="filterCard__index" aria-hidden="true">02</span>
        <h3 id={headingId + "-price"}>Price range</h3>
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
          aria-label="Maximum price"
          aria-valuetext={"Up to $" + maxPrice}
          min={0}
          max={priceLimit}
          value={maxPrice}
          onChange={onPriceChange}
          style={{ "--range-progress": (maxPrice / priceLimit) * 100 + "%" }}
        />
        <div className="priceFilter__limits" aria-hidden="true">
          <span>$0</span>
          <span>${priceLimit}</span>
        </div>
      </div>
    </section>
  </>
);

export default CatalogFilters;
