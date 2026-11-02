import React from "react";
import { Link } from "react-router-dom";
import "./NotFound.scss";

const NotFound = () => (
  <main className="notFound">
    <span className="notFound__code" aria-hidden="true">404</span>
    <p className="notFound__eyebrow">A little off course</p>
    <h1>This page couldn't be found.</h1>
    <p>The link may have changed. Your next favourite piece is still waiting to be discovered.</p>
    <div className="notFound__actions">
      <Link to="/products/1">Explore collections</Link>
      <Link to="/">Back to home</Link>
    </div>
  </main>
);

export default NotFound;
