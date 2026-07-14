import React, { useEffect, useState } from "react";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { handleCart } from "../../redux/cartReducer";
import Cart from "../Cart/Cart";
import "./Navbar.scss";

const Navbar = () => {
  const products = useSelector((state) => state.cart.products);
  const isCartOpen = useSelector((state) => state.cart.cartOpen);

  const location = useLocation().pathname;
  const dispatch = useDispatch();

  const [isScrolled, setIsScrolled] = useState(false);

  const productsCount = products.reduce(
    (total, item) => total + item.quantity,
    0
  );

  useEffect(() => {
    dispatch(handleCart(false));
  }, [location, dispatch]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleBodyScroll = () => {
      const isSmallScreen = window.innerWidth <= 550;

      if (isCartOpen && isSmallScreen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    };

    handleBodyScroll();

    window.addEventListener("resize", handleBodyScroll);

    return () => {
      window.removeEventListener("resize", handleBodyScroll);
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  const scrollToFooter = () => {
    const footer = document.querySelector(".footer");

    if (footer) {
      footer.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className={`navbar ${isScrolled ? "scrolled" : ""}`}>
      <div className="wrapper">
        <div className="brand">
          <Link className="link" to="/">
            M-store
          </Link>
        </div>

        <nav className="mainNav">
          <NavLink className="link navLink" to="/products/1">
            Women
          </NavLink>

          <NavLink className="link navLink" to="/products/2">
            Men
          </NavLink>

          <NavLink className="link navLink" to="/products/3">
            Children
          </NavLink>
        </nav>

        <div className="actions">
          <NavLink className="link actionLink" to="/">
            Home
          </NavLink>

          <NavLink className="link actionLink" to="/about">
            About
          </NavLink>

          <button
            className="actionLink contactBtn"
            type="button"
            onClick={scrollToFooter}
          >
            Contact
          </button>

          <button
            className="cartIcon"
            type="button"
            aria-label="Open shopping bag"
            onClick={() => dispatch(handleCart(!isCartOpen))}
          >
            <ShoppingCartOutlinedIcon />

            {productsCount > 0 && <span>{productsCount}</span>}
          </button>
        </div>
      </div>

      {isCartOpen && <Cart />}
    </header>
  );
};

export default Navbar;