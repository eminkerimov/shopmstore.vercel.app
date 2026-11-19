import React, { useEffect, useState } from "react";

import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

import {
  Link,
  NavLink,
  useLocation,
} from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";

import { handleCart } from "../../redux/cartReducer";

import Cart from "../Cart/Cart";
import GlobalSearch from "../GlobalSearch/GlobalSearch";
import useFetch from "../../custom/useFetch";

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

  const route = useLocation();
  const location = route.pathname;
  const dispatch = useDispatch();

  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchActivated, setSearchActivated] = useState(false);
  const { data: searchData, loading: searchLoading, error: searchError, refetch: retrySearch } = useFetch(searchActivated ? "/product" : null);

  useEffect(() => { setSearchOpen(false); }, [route.key]);

  const openSearch = () => {
    setSearchActivated(true);
    setSearchOpen(true);
  };

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
            <button type="button" className={`utilityButton globalSearchTrigger ${searchOpen ? "utilityButton--active" : ""}`}
              aria-label="Search all products" aria-haspopup="dialog" aria-expanded={searchOpen}
              onClick={openSearch}><SearchOutlinedIcon /></button>

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
      {searchActivated && <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)}
        products={Array.isArray(searchData) ? searchData : []} loading={searchLoading} error={searchError} onRetry={retrySearch} />}
    </header>
  );
};

export default Navbar;
