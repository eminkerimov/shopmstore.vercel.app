import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import Card from "../../components/Card/Card";

import "./Wishlist.scss";

const Wishlist = () => {
  const products = useSelector(
    (state) => state.wishlist.products
  );

  if (!products.length) {
    return (
      <main className="wishlist wishlist--empty">
        <section className="wishlist__empty">
          <div className="wishlist__empty-icon">
            <FavoriteBorderIcon />
          </div>

          <span className="wishlist__eyebrow">
            Your collection
          </span>

          <h1>Your wishlist is empty</h1>

          <p>
            Save products you like and return to them whenever
            you are ready.
          </p>

          <Link
            className="wishlist__empty-link"
            to="/products/1"
          >
            Explore products
            <ArrowForwardIcon />
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="wishlist">
      <section className="wishlist__hero">
        <div className="wishlist__hero-content">
          <span className="wishlist__eyebrow">
            Saved selection
          </span>

          <h1>Wishlist</h1>

          <p>
            Your favourite products, collected in one place.
          </p>
        </div>

        <div className="wishlist__count">
          <strong>{products.length}</strong>

          <span>
            {products.length === 1 ? "item" : "items"}
          </span>
        </div>
      </section>

      <section className="wishlist__content">
        <div className="wishlist__grid">
          {products.map((product) => (
            <Card key={product.id} item={product} />
          ))}
        </div>
      </section>
    </main>
  );
};

export default Wishlist;