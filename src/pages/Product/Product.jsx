import React, { useState } from "react";
import "./Product.scss";

import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import BalanceIcon from "@mui/icons-material/Balance";

import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";

import useFetch from "../../custom/useFetch";
import { addToCart, handleCart } from "../../redux/cartReducer.js";

const Product = () => {
  const { id } = useParams();

  const [selectedImg, setSelectedImg] = useState("img");
  const [quantity, setQuantity] = useState(1);

  const dispatch = useDispatch();
  const { data, loading } = useFetch(`/product/${id}`);

  const handleAdd = () => {
    if (!data) return;

    dispatch(
      addToCart({
        id: data.id,
        title: data.title,
        desc: data.desc,
        price: data.price,
        img: data.img,
        quantity,
      })
    );

    dispatch(handleCart(true));
  };

  if (loading) {
    return (
      <main className="product">
        <div className="product__loading">Loading product...</div>
      </main>
    );
  }

  return (
    <main className="product">
      <div className="product__container">
        <section className="product__gallery">
          <div className="product__thumbnails">
            {data?.img && (
              <button
                type="button"
                className={`product__thumbnail ${
                  selectedImg === "img" ? "product__thumbnail--active" : ""
                }`}
                onClick={() => setSelectedImg("img")}
                aria-label="Show first product image"
              >
                <img src={data.img} alt={`${data.title} front view`} />
              </button>
            )}

            {data?.img2 && (
              <button
                type="button"
                className={`product__thumbnail ${
                  selectedImg === "img2" ? "product__thumbnail--active" : ""
                }`}
                onClick={() => setSelectedImg("img2")}
                aria-label="Show second product image"
              >
                <img src={data.img2} alt={`${data.title} back view`} />
              </button>
            )}
          </div>

          <div className="product__main-image">
            <span className="product__badge">New collection</span>

            <img
              src={data?.[selectedImg] || data?.img}
              alt={data?.title || "Product"}
            />
          </div>
        </section>

        <section className="product__details">
          <div className="product__heading">
            <span className="product__category">
              {data?.sub_category || "Premium collection"}
            </span>

            <h1>{data?.title}</h1>

            <p className="product__description">{data?.desc}</p>
          </div>

          <div className="product__price">
            <span>${data?.price}</span>
            <small>Taxes included</small>
          </div>

          <div className="product__purchase">
            <div className="product__quantity-wrapper">
              <span className="product__label">Quantity</span>

              <div className="product__quantity">
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((prev) => (prev === 1 ? 1 : prev - 1))
                  }
                  aria-label="Decrease quantity"
                >
                  −
                </button>

                <span>{quantity}</span>

                <button
                  type="button"
                  onClick={() => setQuantity((prev) => prev + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            <button
              type="button"
              className="product__add"
              onClick={handleAdd}
            >
              <AddShoppingCartIcon />
              Add to cart
            </button>
          </div>

          <div className="product__actions">
            <button type="button">
              <FavoriteBorderIcon />
              Add to wishlist
            </button>

            <button type="button">
              <BalanceIcon />
              Add to compare
            </button>
          </div>

          <div className="product__benefits">
            <div>
              <strong>Free delivery</strong>
              <span>For orders over $100</span>
            </div>

            <div>
              <strong>Easy returns</strong>
              <span>Return within 14 days</span>
            </div>

            <div>
              <strong>Secure payment</strong>
              <span>Protected checkout</span>
            </div>
          </div>

          <div className="product__meta">
            <div>
              <span>Vendor</span>
              <strong>Polo</strong>
            </div>

            <div>
              <span>Product type</span>
              <strong>{data?.sub_category || "—"}</strong>
            </div>

            <div>
              <span>Tags</span>
              <strong>
                {[data?.sub_category, data?.type].filter(Boolean).join(", ") ||
                  "—"}
              </strong>
            </div>
          </div>

          <div className="product__information">
            <button type="button">
              <span>Description</span>
              <span>+</span>
            </button>

            <button type="button">
              <span>Additional information</span>
              <span>+</span>
            </button>

            <button type="button">
              <span>FAQ</span>
              <span>+</span>
            </button>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Product;