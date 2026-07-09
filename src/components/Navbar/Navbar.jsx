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
    <div className={`navbar ${isScrolled ? "scrolled" : ""}`}>
      <div className="wrapper">
        <div className="mobilBtn">
          <div></div>
          <div></div>
          <div></div>
        </div>

        <div className="left">
          <div className="item underline">
            <NavLink className="link" to="/products/1">
              Women
            </NavLink>
          </div>

          <div className="item underline">
            <NavLink className="link" to="/products/2">
              Men
            </NavLink>
          </div>

          <div className="item underline">
            <NavLink className="link" to="/products/3">
              Children
            </NavLink>
          </div>
        </div>

        <div className="center">
          <Link className="link" to="/">
            M-store
          </Link>
        </div>

        <div className="right">
          <div className="item underline">
            <NavLink className="link" to="/">
              Home
            </NavLink>
          </div>

          <div className="item underline">
            <NavLink className="link" to="/about">
              About
            </NavLink>
          </div>

          <button className="item underline contactBtn" onClick={scrollToFooter}>
            Contact
          </button>

          <div className="icons">
            <div
              className="cartIcon"
              onClick={() => dispatch(handleCart(!isCartOpen))}
            >
              <ShoppingCartOutlinedIcon />
              <span>{products?.length}</span>
            </div>
          </div>
        </div>
      </div>

      {isCartOpen && <Cart />}
    </div>
  );
};

export default Navbar;