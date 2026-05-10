import React, { useLayoutEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Mobil.scss";

const Mobil = () => {
  const [mobilOpen, setMobilOpen] = useState(false);
  const location = useLocation().pathname;

  useLayoutEffect(() => {
    setMobilOpen(false)
  }, [location]);

  return (
    <div className={mobilOpen ? "mobil menu-opened" : "mobil"}>
      <div
        className="burger-container"
        onClick={() => setMobilOpen(!mobilOpen)}
      >
        <div id="burger">
          <div className="bar topBar"></div>
          <div className="bar btmBar"></div>
        </div>
      </div>
      <ul className="menu">
        <li className="menu-item">
        <Link className="link" to="/">Home</Link>
        </li>
        <li className="menu-item">
        <Link className="link" to="/about">About</Link>
        </li>
        <li className="menu-item">
        <Link className="link" to="/">Contact</Link>
        </li>
        <li className="menu-item">
        <Link className="link" to="/products/1">Women</Link>
        </li>
        <li className="menu-item">
        <Link className="link" to="/products/2">Men</Link>
        </li>
        <li className="menu-item">
        <Link className="link" to="/products/3">Children</Link>
        </li>
      </ul>
    </div>
  );
};

export default Mobil;
