import React, { useEffect, useState } from "react";
import "./Product.scss";

import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import BalanceIcon from "@mui/icons-material/Balance";

import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";

import useFetch from "../../custom/useFetch";
import Card from "../../components/Card/Card";

import { addToCart, handleCart } from "../../redux/cartReducer.js";

const RelatedProducts = ({ category, currentProductId }) => {
  const { data: relatedProducts, loading } = useFetch(
    `/product?category=${category}&sortBy=price&order=asc`
  );

  const products = Array.isArray(relatedProducts)
    ? relatedProducts
        .filter(
          (product) =>
            String(product.id) !== String(currentProductId)
        )
        .slice(0, 4)
    : [];

  if (loading) {
    return (
      <section className="product__related">
        <div className="product__related-inner">
          <div className="product__related-loading">
            Loading recommendations...
          </div>
        </div>
      </section>
    );
  }

  if (!products.length) return null;

  return (
    <section className="product__related">
      <div className="product__related-inner">
        <aside className="product__related-label">
          <span>Related</span>
          <span>Products</span>
        </aside>

        <div className="product__related-grid">
          {products.map((product) => (
            <Card key={product.id} item={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

const Product = () => {
  const { id } = useParams();

  const [selectedImg, setSelectedImg] = useState("img");
  const [quantity, setQuantity] = useState(1);
  const [activeAccordion, setActiveAccordion] =
    useState("description");

  const dispatch = useDispatch();

  const { data, loading } = useFetch(`/product/${id}`);

  useEffect(() => {
    setSelectedImg("img");
    setQuantity(1);
    setActiveAccordion("description");
  }, [id]);

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

  const handleAccordion = (accordionName) => {
    setActiveAccordion((current) =>
      current === accordionName ? null : accordionName
    );
  };

  if (loading) {
    return (
      <main className="product">
        <div className="product__loading">
          Loading product...
        </div>
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
                  selectedImg === "img"
                    ? "product__thumbnail--active"
                    : ""
                }`}
                onClick={() => setSelectedImg("img")}
                aria-label="Show first product image"
              >
                <img
                  src={data.img}
                  alt={`${data.title} front view`}
                />
              </button>
            )}

            {data?.img2 && (
              <button
                type="button"
                className={`product__thumbnail ${
                  selectedImg === "img2"
                    ? "product__thumbnail--active"
                    : ""
                }`}
                onClick={() => setSelectedImg("img2")}
                aria-label="Show second product image"
              >
                <img
                  src={data.img2}
                  alt={`${data.title} back view`}
                />
              </button>
            )}
          </div>

          <div className="product__main-image">
            <span className="product__badge">
              New collection
            </span>

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

            <p className="product__description">
              {data?.desc}
            </p>
          </div>

          <div className="product__price">
            <span>${data?.price}</span>
            <small>Taxes included</small>
          </div>

          <div className="product__purchase">
            <div className="product__quantity-wrapper">
              <span className="product__label">
                Quantity
              </span>

              <div className="product__quantity">
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((prev) =>
                      prev === 1 ? 1 : prev - 1
                    )
                  }
                  aria-label="Decrease quantity"
                >
                  −
                </button>

                <span>{quantity}</span>

                <button
                  type="button"
                  onClick={() =>
                    setQuantity((prev) => prev + 1)
                  }
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
              <strong>
                {data?.sub_category || "—"}
              </strong>
            </div>

            <div>
              <span>Tags</span>
              <strong>
                {[data?.sub_category, data?.type]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </strong>
            </div>
          </div>

          <div className="product__accordions">
            <div
              className={`product__accordion ${
                activeAccordion === "description"
                  ? "product__accordion--active"
                  : ""
              }`}
            >
              <button
                type="button"
                className="product__accordion-header"
                onClick={() =>
                  handleAccordion("description")
                }
                aria-expanded={
                  activeAccordion === "description"
                }
              >
                <span>Description</span>

                <span className="product__accordion-icon">
                  +
                </span>
              </button>

              <div className="product__accordion-content">
                <div className="product__accordion-inner">
                  <p>{data?.desc}</p>

                  <p>
                    Designed for everyday comfort with a clean,
                    modern silhouette. Easy to combine with casual
                    and seasonal wardrobe essentials.
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`product__accordion ${
                activeAccordion === "information"
                  ? "product__accordion--active"
                  : ""
              }`}
            >
              <button
                type="button"
                className="product__accordion-header"
                onClick={() =>
                  handleAccordion("information")
                }
                aria-expanded={
                  activeAccordion === "information"
                }
              >
                <span>Additional information</span>

                <span className="product__accordion-icon">
                  +
                </span>
              </button>

              <div className="product__accordion-content">
                <div className="product__accordion-inner">
                  <div className="product__specifications">
                    <div>
                      <span>Category</span>
                      <strong>
                        {data?.sub_category || "Fashion"}
                      </strong>
                    </div>

                    <div>
                      <span>Collection</span>
                      <strong>
                        {data?.type || "Current collection"}
                      </strong>
                    </div>

                    <div>
                      <span>Vendor</span>
                      <strong>Polo</strong>
                    </div>

                    <div>
                      <span>Availability</span>
                      <strong>In stock</strong>
                    </div>

                    <div>
                      <span>Shipping</span>
                      <strong>2–5 business days</strong>
                    </div>

                    <div>
                      <span>Returns</span>
                      <strong>14-day return policy</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`product__accordion ${
                activeAccordion === "faq"
                  ? "product__accordion--active"
                  : ""
              }`}
            >
              <button
                type="button"
                className="product__accordion-header"
                onClick={() => handleAccordion("faq")}
                aria-expanded={activeAccordion === "faq"}
              >
                <span>FAQ</span>

                <span className="product__accordion-icon">
                  +
                </span>
              </button>

              <div className="product__accordion-content">
                <div className="product__accordion-inner">
                  <div className="product__faq">
                    <div>
                      <strong>
                        How long does shipping take?
                      </strong>

                      <p>
                        Orders are usually delivered within 2–5
                        business days.
                      </p>
                    </div>

                    <div>
                      <strong>
                        Can I return this product?
                      </strong>

                      <p>
                        Returns are accepted within 14 days after
                        delivery.
                      </p>
                    </div>

                    <div>
                      <strong>
                        Is online payment secure?
                      </strong>

                      <p>
                        Payments are processed through a protected
                        checkout.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {data?.category && (
        <RelatedProducts
          category={data.category}
          currentProductId={data.id}
        />
      )}
    </main>
  );
};

export default Product;