import React, { useState } from "react";
import { Link } from "react-router-dom";
import EastOutlinedIcon from "@mui/icons-material/EastOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import "./Footer.scss";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address, for example you@example.com.");
      document.getElementById("newsletter-email")?.focus();
      return;
    }
    setError("");
    setSubscribed(true);
  };

  return (
    <footer className="footer">
      <div className="footer__container">
        <section className="footer__newsletter" aria-labelledby="newsletter-title">
          <div className="footer__newsletterContent">
            <span>Stay in the loop</span>
            <h2 id="newsletter-title">New collections, straight to your inbox.</h2>
            <p>Receive updates about new arrivals, seasonal collections and exclusive offers.</p>
          </div>

          <div className="footer__signup">
            <form className="footer__form" onSubmit={handleSubmit} noValidate>
              <label className="sr-only" htmlFor="newsletter-email">Email address</label>
              <input
                id="newsletter-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                  setSubscribed(false);
                }}
                aria-invalid={Boolean(error)}
                aria-describedby="newsletter-feedback"
                required
              />
              <button type="submit" disabled={subscribed}>
                {subscribed ? "Subscribed" : "Subscribe"}
                {subscribed ? <CheckOutlinedIcon /> : <EastOutlinedIcon />}
              </button>
            </form>
            <p id="newsletter-feedback" className={`footer__feedback ${error ? "footer__feedback--error" : ""}`} aria-live="polite" aria-atomic="true">
              {error || (subscribed ? "You're on the demo list. No email was sent." : "")}
            </p>
          </div>
        </section>

        <div className="footer__content">
          <div className="footer__brand">
            <Link to="/" className="footer__logo">M-store</Link>
            <p>Contemporary fashion selected for everyday comfort, confidence and effortless style.</p>
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
          <span>&copy; {currentYear} M-store. All rights reserved.</span>
          <img src="/img/payment.png" alt="Supported payment methods" loading="lazy" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
