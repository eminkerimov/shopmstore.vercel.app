import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { startProductImageTransition } from "../../helpers/productImageTransition";
import { useDispatch, useSelector } from "react-redux";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { toggleWishlist } from "../../redux/wishlistReducer";
import { getProductDisplay, formatProductPrice } from "../../helpers/product";
import "./Card.scss";

const Card = ({ item }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const product = getProductDisplay(item);
  const wishlistProducts = useSelector((state) => state.wishlist.products);
  const [announcement, setAnnouncement] = useState("");
  const isInWishlist = wishlistProducts.some((saved) => String(saved.id) === String(product.id));

  const openProduct = (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const transition = startProductImageTransition(event.currentTarget.closest(".card"), product.id);
    if (!transition) return;
    event.preventDefault();
    navigate("/product/" + product.id, { state: { productImageTransition: { id: String(product.id), src: transition.src } } });
  };

  const handleWishlist = () => {
    dispatch(toggleWishlist(product));
    setAnnouncement(`${product.title} ${isInWishlist ? "removed from" : "added to"} wishlist.`);
  };

  return (
    <article className="card">
      <div className="cardMedia">
        <Link className="cardImageLink" to={`/product/${product.id}`} onClick={openProduct} aria-label={`View ${product.title}`}>
          <div className={`image ${product.img2 ? "image--alternate" : ""}`}>
            {product.isNew && <span className="newBadge">New season</span>}
            <img src={product.img} alt={product.title || "Product"} className="mainImg" loading="lazy" decoding="async" />
            {product.img2 && <img src={product.img2} alt="" className="secondImg" loading="lazy" decoding="async" />}
          </div>
        </Link>
        <button
          type="button"
          className={`wishlistButton ${isInWishlist ? "wishlistButton--active" : ""}`}
          onClick={handleWishlist}
          aria-label={`${isInWishlist ? "Remove" : "Save"} ${product.title} ${isInWishlist ? "from" : "to"} wishlist`}
          aria-pressed={isInWishlist}
        >
          {isInWishlist ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        </button>
        <span className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</span>
      </div>
      <Link className="cardInfoLink" to={`/product/${product.id}`} onClick={openProduct}>
        <div className="cardInfo">
          <h2>{product.title}</h2>
          <div className="prices">
            {product.previousPrice && <span className="previousPrice"><span className="sr-only">Previous price: </span>{formatProductPrice(product.previousPrice)}</span>}
            <span className="currentPrice">{formatProductPrice(product.price)}</span>
          </div>
        </div>
      </Link>
    </article>
  );
};

export default Card;
