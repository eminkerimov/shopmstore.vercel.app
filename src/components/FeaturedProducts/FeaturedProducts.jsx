import React from "react";
import { Link } from "react-router-dom";
import useFetch from "../../custom/useFetch";
import Card from "../Card/Card";
import AsyncState, { ProductSkeleton } from "../AsyncState/AsyncState";
import AnimatedProductGrid from "../AnimatedProductGrid/AnimatedProductGrid";
import "./FeaturedProducts.scss";

const FeaturedProducts = ({ type }) => {
  const { data, loading, error, refetch } = useFetch(`/product?type=${type}`);
  const isFeatured = type === "featured";

  return (
    <section className="featuredProducts">
      <div className="top">
        <span className="eyebrow">{isFeatured ? "Featured collection" : "Trending now"}</span>
        <h2>{isFeatured ? "Featured Products" : "Trending Products"}</h2>
        <p>{isFeatured ? "Modern essentials selected for the new season." : "The most wanted pieces from our latest collections."}</p>
        <div className="divider" aria-hidden="true"><span /></div>
      </div>
      <AnimatedProductGrid
        className="bottom"
        aria-busy={loading}
        items={loading || error || !Array.isArray(data) ? [] : data}
        renderItem={(item) => <Card item={item} />}
        animateChanges={!loading && !error}
        fallback={loading ? <ProductSkeleton count={4} /> : error ? (
          <AsyncState title="Collection unavailable" message="We couldn't load the products. Please try again." onRetry={refetch} />
        ) : (
          <AsyncState title="New pieces are on their way" message="Explore our other collections in the meantime." action={<Link to="/products/1">Explore collections</Link>} />
        )}
      />
    </section>
  );
};

export default FeaturedProducts;
