import React from "react";
import Card from "../Card/Card";
import AsyncState, { ProductSkeleton } from "../AsyncState/AsyncState";
import AnimatedProductGrid from "../AnimatedProductGrid/AnimatedProductGrid";
import "./List.scss";

const List = ({ products = [], loading, error, hasActiveFilters, onReset, onRetry }) => (
  <AnimatedProductGrid
    className="list"
    items={loading || error ? [] : products}
    renderItem={(item) => <Card item={item} />}
    animateChanges={!loading && !error}
    fallback={loading ? (
      <ProductSkeleton count={8} />
    ) : error ? (
      <AsyncState title="Collection unavailable" message="We couldn't load this collection. Check your connection and try again." onRetry={onRetry} />
    ) : (
      <AsyncState
        title={hasActiveFilters ? "No matching products" : "No products yet"}
        message={hasActiveFilters ? "Try another search, remove a filter or increase your price limit." : "This collection is currently empty. Explore another collection."}
        action={hasActiveFilters ? <button type="button" onClick={onReset}>Clear search and filters</button> : undefined}
      />
    )}
  />
);

export default List;
