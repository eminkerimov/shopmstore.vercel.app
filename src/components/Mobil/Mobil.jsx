import React, { useEffect, useLayoutEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
        className="burger-container"
        onClick={() => setMobilOpen(!mobilOpen)}
        aria-label="Toggle mobile menu"
      >
        <span></span>
        <span></span>
      </button>

      <div className="menuPanel">
        <Link className="menuLogo" to="/">
          M-store
        </Link>

        <ul className="menu">
          <li>
            <Link className="link" to="/">
              Home
            </Link>
          </li>
          <li>
            <Link className="link" to="/products/1">
              Women
            </Link>
          </li>
          <li>
            <Link className="link" to="/products/2">
              Men
            </Link>
          </li>
          <li>
            <Link className="link" to="/products/3">
              Children
            </Link>
          </li>
          <li>
            <Link className="link" to="/about">
              About
            </Link>
          </li>
          <li>
            <button className="link contactBtn" onClick={scrollToFooter}>
              Contact
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Mobil;