import React, { useEffect, useState } from "react";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import { Link, NavLink, useLocation } from "react-router-dom";
import "./Navbar.scss";
import Cart from "../Cart/Cart";
import { useSelector, useDispatch } from "react-redux";
import { handleCart } from "../../redux/cartReducer";

const Navbar = () => {
  const products = useSelector((state) => state.cart.products);
  const isCartOpen = useSelector((state) => state.cart.cartOpen);
  const location = useLocation().pathname;
  const dispatch = useDispatch();

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    dispatch(handleCart(false));
  }, [location, dispatch]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
          <button className="actionLink contactBtn" onClick={scrollToFooter}>
            Contact
          </button>

          <div
            className="cartIcon"
            onClick={() => dispatch(handleCart(!isCartOpen))}
          >
            <ShoppingCartOutlinedIcon />
            <span>{products?.length}</span>
          </div>
        </div>
      </div>

      {isCartOpen && <Cart />}
    </header>
  );
};

export default Navbar;