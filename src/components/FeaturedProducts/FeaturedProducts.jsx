import React from "react";
import useFetch from "../../custom/useFetch";
import Card from "../Card/Card";
import "./FeaturedProducts.scss";

const FeaturedProducts = ({ type }) => {
  const { data, loading, error } = useFetch(`/product?type=${type}`);

  const isFeatured = type === "featured";

  return (
    <section className="featuredProducts">
      <div className="top">
        <span className="eyebrow">
          {isFeatured ? "Featured collection" : "Trending now"}
        </span>

        <h1>
          {isFeatured ? "Featured Products" : "Trending Products"}
        </h1>

        <p>
          {isFeatured
            ? "Modern essentials selected for the new season."
            : "The most wanted pieces from our latest collections."}
        </p>

        <div className="divider">
          <span></span>
        </div>
      </div>

      <div className="bottom">
        {error ? (
          <div className="status error">Something went wrong.</div>
        ) : loading ? (
          <div className="status">Loading products...</div>
        ) : (
          data?.map((item) => <Card item={item} key={item.id} />)
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;