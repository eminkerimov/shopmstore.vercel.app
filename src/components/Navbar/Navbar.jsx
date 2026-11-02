import React, { useEffect, useState } from "react";

import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

import {
  Link,
  NavLink,
  useLocation,
} from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";

import { handleCart } from "../../redux/cartReducer";

import Cart from "../Cart/Cart";

import "./Navbar.scss";

const Navbar = () => {
  const products = useSelector(
    (state) => state.cart.products
  );

  const wishlistProducts = useSelector(
    (state) => state.wishlist.products
  );

  const isCartOpen = useSelector(
    (state) => state.cart.cartOpen
  );

  const location = useLocation().pathname;
  const dispatch = useDispatch();

  const [isScrolled, setIsScrolled] = useState(false);

  const productsCount = products.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const wishlistCount = wishlistProducts.length;

  useEffect(() => {
    dispatch(handleCart(false));
  }, [location, dispatch]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);


  const scrollToFooter = () => {
    const footer = document.querySelector(".footer");

    if (footer) {
      footer.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }
  };

  return (
    <header
      className={`navbar ${isScrolled ? "scrolled" : ""}`}
    >
      <div className="wrapper">
        <div className="brand">
          <Link className="link" to="/">
            M-store
          </Link>
        </div>

        <nav
          className="categoryNav"
          aria-label="Product categories"
        >
          <NavLink
            className="categoryLink"
            to="/products/1"
          >
            Women
          </NavLink>

          <NavLink
            className="categoryLink"
            to="/products/2"
          >
            Men
          </NavLink>

          <NavLink
            className="categoryLink"
            to="/products/3"
          >
            Children
          </NavLink>
        </nav>

        <div className="actions">
          <nav
            className="pageNav"
            aria-label="Main navigation"
          >
            <NavLink
              className="pageLink"
              to="/"
              end
            >
              Home
            </NavLink>

            <NavLink
              className="pageLink"
              to="/about"
            >
              About
            </NavLink>

            <button
              className="pageLink contactBtn"
              type="button"
              onClick={scrollToFooter}
            >
              Contact
            </button>
          </nav>

          <div className="utilityActions">
            <NavLink
              className="utilityButton wishlistIcon"
              to="/wishlist"
              aria-label={`Open wishlist. ${wishlistCount} saved products`}
            >
              <FavoriteBorderIcon />

              {wishlistCount > 0 && (
                <span key={wishlistCount} aria-hidden="true">{wishlistCount}</span>
              )}
            </NavLink>

            <button
              className={`utilityButton cartIcon ${
                isCartOpen ? "utilityButton--active" : ""
              }`}
              type="button"
              aria-label={`Open shopping cart. ${productsCount} products`}
              aria-haspopup="dialog"
              aria-expanded={isCartOpen}
              onClick={() =>
                dispatch(handleCart(!isCartOpen))
              }
            >
              <ShoppingCartOutlinedIcon />

              {productsCount > 0 && (
                <span key={productsCount} aria-hidden="true">{productsCount}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      <Cart open={isCartOpen} />
    </header>
  );
};

export default Navbar;
