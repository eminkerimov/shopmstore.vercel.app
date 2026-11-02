import React, { useEffect, useRef, useState } from "react";
import { Drawer, useMediaQuery } from "@mui/material";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { Link, NavLink, useLocation } from "react-router-dom";
import "./Mobil.scss";

const Mobil = () => {
  const [mobilOpen, setMobilOpen] = useState(false);
  const location = useLocation().pathname;
  const isMobile = useMediaQuery("(max-width:767px)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const scrollAfterClose = useRef(false);

  useEffect(() => {
    setMobilOpen(false);
  }, [location]);

  useEffect(() => {
    if (!isMobile) setMobilOpen(false);
  }, [isMobile]);

  const handleClose = () => setMobilOpen(false);

  return (
    <>
      <div className="mobil">
        <button
          type="button"
          className="burger-container"
          onClick={() => setMobilOpen(true)}
          aria-label="Open mobile menu"
          aria-expanded={mobilOpen}
          aria-controls={mobilOpen ? "mobile-navigation" : undefined}
          aria-haspopup="dialog"
        >
          <span />
          <span />
        </button>
      </div>

      <Drawer
        className="mobileMenu"
        anchor="left"
        open={isMobile && mobilOpen}
        onClose={handleClose}
        transitionDuration={reducedMotion ? 0 : 280}
        PaperProps={{
          className: "menuPanel",
          id: "mobile-navigation",
          role: "dialog",
          "aria-modal": true,
          "aria-label": "Mobile navigation",
        }}
        SlideProps={{
          onExited: () => {
            if (scrollAfterClose.current) {
              document.querySelector(".footer")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
              scrollAfterClose.current = false;
            }
          },
        }}
      >
        <div className="menuHeader">
          <Link className="menuLogo" to="/" onClick={handleClose}>M-store</Link>
          <button type="button" className="menuClose" onClick={handleClose} aria-label="Close mobile menu">
            <CloseOutlinedIcon />
          </button>
        </div>

        <div className="menuSection">
          <span className="menuSectionTitle">Shop</span>
          <nav className="categoryMenu" aria-label="Product categories">
            <NavLink className="categoryMenuLink" to="/products/1" onClick={handleClose}>Women</NavLink>
            <NavLink className="categoryMenuLink" to="/products/2" onClick={handleClose}>Men</NavLink>
            <NavLink className="categoryMenuLink" to="/products/3" onClick={handleClose}>Children</NavLink>
          </nav>
        </div>

        <div className="menuSection">
          <span className="menuSectionTitle">Explore</span>
          <nav className="pageMenu" aria-label="Main navigation">
            <NavLink className="pageMenuLink" to="/" end onClick={handleClose}>Home</NavLink>
            <NavLink className="pageMenuLink" to="/about" onClick={handleClose}>About</NavLink>
            <button
              type="button"
              className="pageMenuLink contactBtn"
              onClick={() => {
                scrollAfterClose.current = true;
                handleClose();
              }}
            >Contact</button>
          </nav>
        </div>
      </Drawer>
    </>
  );
};

export default Mobil;
