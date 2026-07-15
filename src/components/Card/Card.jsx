import React from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";

import { toggleWishlist } from "../../redux/wishlistReducer";

import "./Card.scss";

const Card = ({ item }) => {
  const dispatch = useDispatch();

  const wishlistProducts = useSelector(
    (state) => state.wishlist.products
  );

  const previousPrice = ((item?.price * 100) / 70).toFixed(2);

  const isInWishlist = wishlistProducts.some(
    (product) => String(product.id) === String(item.id)
  );

  const handleWishlist = () => {
    dispatch(
      toggleWishlist({
        id: item.id,
        title: item.title,
        desc: item.desc,
        price: item.price,
        img: item.img,
        img2: item.img2,
        category: item.category,
        sub_category: item.sub_category,
        type: item.type,
        isNew: item.isNew,
      })
    );
  };

  return (
    <article className="card">
      <div className="cardMedia">
        <Link
          className="cardImageLink"
          to={`/product/${item.id}`}
        >
          <div className="image">
            {item?.isNew && (
              <span className="newBadge">New Season</span>
            )}

            <img
              src={item?.img}
              alt={item?.title || "Product"}
              className="mainImg"
            />

            <img
              src={item?.img2}
              alt=""
              className="secondImg"
            />
          </div>
        </Link>

        <button
          type="button"
          className={`wishlistButton ${
            isInWishlist ? "wishlistButton--active" : ""
          }`}
          onClick={handleWishlist}
          aria-label={
            isInWishlist
              ? "Remove product from wishlist"
              : "Add product to wishlist"
          }
          aria-pressed={isInWishlist}
        >
          {isInWishlist ? (
            <FavoriteIcon />
          ) : (
            <FavoriteBorderIcon />
          )}
        </button>
      </div>

      <Link
        className="cardInfoLink"
        to={`/product/${item.id}`}
      >
        <div className="cardInfo">
          <h2>{item?.title}</h2>

          <div className="prices">
            <span className="previousPrice">
              ${previousPrice}
            </span>

            <span className="currentPrice">
              ${item?.price}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
};

export default Card;