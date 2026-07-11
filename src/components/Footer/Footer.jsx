import React from "react";
import { Link } from "react-router-dom";
import EastOutlinedIcon from "@mui/icons-material/EastOutlined";
import "./Footer.scss";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <footer className="footer">
      <div className="footer__container">
        <section className="footer__newsletter">
          <div className="footer__newsletterContent">
            <span>Stay in the loop</span>

            <h2>New collections, straight to your inbox.</h2>

            <p>
              Receive updates about new arrivals, seasonal collections and
              exclusive offers.
            </p>
          </div>

          <form className="footer__form" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Enter your email address"
              aria-label="Email address"
              required
            />

            <button type="submit" aria-label="Subscribe">
              Subscribe
              <EastOutlinedIcon />
            </button>
          </form>
        </section>

        <div className="footer__content">
          <div className="footer__brand">
            <Link to="/" className="footer__logo">
              M-store
            </Link>

            <p>
              Contemporary fashion selected for everyday comfort, confidence
              and effortless style.
            </p>
          </div>

          <nav className="footer__column" aria-label="Shop links">
            <h3>Shop</h3>

            <Link to="/products/1">Women</Link>
            <Link to="/products/2">Men</Link>
            <Link to="/products/3">Children</Link>
          </nav>

          <nav className="footer__column" aria-label="Company links">
            <h3>Company</h3>

            <Link to="/about">About</Link>
            <a href="mailto:support@m-store.com">Contact</a>
          </nav>

          <div className="footer__column">
            <h3>Customer care</h3>

            <a href="mailto:support@m-store.com">support@m-store.com</a>
            <span>Baku, Azerbaijan</span>
          </div>
        </div>

        <div className="footer__bottom">
          <span>© {currentYear} M-store. All rights reserved.</span>

          <img
            src="/img/payment.png"
            alt="Supported payment methods"
          />
        </div>
      </div>
    </footer>
  );
};

export default Footer;