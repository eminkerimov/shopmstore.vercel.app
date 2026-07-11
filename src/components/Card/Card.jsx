import React from "react";
import { Link } from "react-router-dom";
import "./Card.scss";

const Card = ({ item }) => {
  const previousPrice = ((item?.price * 100) / 70).toFixed(2);

  return (
    <Link className="cardLink" to={`/product/${item.id}`}>
      <article className="card">
        <div className="image">
          {item?.isNew && (
            <span className="newBadge">New Season</span>
          )}

          <img
            src={item?.img}
            alt={item?.title || "Product"}
            className="mainImg"
          />

          <img
            src={item?.img2}
            alt=""
            className="secondImg"
          />
        </div>

        <div className="cardInfo">
          <h2>{item?.title}</h2>

          <div className="prices">
            <span className="previousPrice">${previousPrice}</span>
            <span className="currentPrice">${item?.price}</span>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default Card;