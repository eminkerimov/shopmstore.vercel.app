import React, {
  useEffect,
  useLayoutEffect,
  useState,
} from "react";

import {
  Link,
  NavLink,
  useLocation,
} from "react-router-dom";

import "./Mobil.scss";

const Mobil = () => {
  const [mobilOpen, setMobilOpen] = useState(false);
  const location = useLocation().pathname;

  useLayoutEffect(() => {
    setMobilOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = mobilOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobilOpen]);

  const handleToggle = () => {
    setMobilOpen((current) => !current);
  };

  const handleClose = () => {
    setMobilOpen(false);
  };

  const scrollToFooter = () => {
    const footer = document.querySelector(".footer");

    if (footer) {
      footer.scrollIntoView({ behavior: "smooth" });
      setMobilOpen(false);
    }
  };

  return (
    <div className={mobilOpen ? "mobil menu-opened" : "mobil"}>
      <button
        type="button"
        className="burger-container"
        onClick={handleToggle}
        aria-label={
          mobilOpen
            ? "Close mobile menu"
            : "Open mobile menu"
        }
        aria-expanded={mobilOpen}
      >
        <span />
        <span />
      </button>

      <button
        type="button"
        className="menuOverlay"
        onClick={handleClose}
        aria-label="Close mobile menu"
      />

      <aside className="menuPanel">
        <Link
          className="menuLogo"
          to="/"
          onClick={handleClose}
        >
          M-store
        </Link>

        <div className="menuSection">
          <span className="menuSectionTitle">
            Shop
          </span>

          <nav
            className="categoryMenu"
            aria-label="Product categories"
          >
            <NavLink
              className="categoryMenuLink"
              to="/products/1"
            >
              Women
            </NavLink>

            <NavLink
              className="categoryMenuLink"
              to="/products/2"
            >
              Men
            </NavLink>

            <NavLink
              className="categoryMenuLink"
              to="/products/3"
            >
              Children
            </NavLink>
          </nav>
        </div>

        <div className="menuSection">
          <span className="menuSectionTitle">
            Explore
          </span>

          <nav
            className="pageMenu"
            aria-label="Main navigation"
          >
            <NavLink
              className="pageMenuLink"
              to="/"
              end
            >
              Home
            </NavLink>

            <NavLink
              className="pageMenuLink"
              to="/about"
            >
              About
            </NavLink>

            <button
              type="button"
              className="pageMenuLink contactBtn"
              onClick={scrollToFooter}
            >
              Contact
            </button>
          </nav>
        </div>
      </aside>
    </div>
  );
};

export default Mobil;