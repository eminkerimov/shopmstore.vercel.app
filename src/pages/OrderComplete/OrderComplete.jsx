import React from "react";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import { Link, useLocation } from "react-router-dom";
import { formatMoney } from "../../helpers/cart";
import "./OrderComplete.scss";

const readOrder = () => {
  try {
    const order = JSON.parse(sessionStorage.getItem("mstore-demo-order"));
    return order?.id && Array.isArray(order.items) && Number.isFinite(order.total) ? order : null;
  } catch { return null; }
};

const OrderComplete = () => {
  const { state } = useLocation();
  const order = state?.order || readOrder();
  return (
    <main className="orderComplete">
      <div className="orderComplete__card">
        <CheckCircleOutlineRoundedIcon className="orderComplete__icon" />
        <span className="orderComplete__eyebrow">Demo checkout</span>
        <h1>{order ? "Your order is confirmed" : "Ready for your first order?"}</h1>
        <p>{order ? "Thanks for exploring M-store. This was a simulated purchase; no payment was taken." : "Explore the collection and try the complete shopping experience."}</p>
        {order && (
          <>
            <dl className="orderComplete__details">
              <div><dt>Order number</dt><dd>{order.id}</dd></div>
              <div><dt>Total</dt><dd>{formatMoney(order.total)}</dd></div>
            </dl>
            <ul className="orderComplete__items">
              {order.items.map((item, index) => (
                <li key={item.key || index}>
                  <img src={item.img} alt="" />
                  <div><strong>{item.title}</strong><span>{[item.size, item.color].filter(Boolean).join(" · ")} · Qty {item.quantity}</span></div>
                  <b>{formatMoney(item.price * item.quantity)}</b>
                </li>
              ))}
            </ul>
          </>
        )}
        <Link to="/products/1" className="orderComplete__continue">Continue exploring</Link>
      </div>
    </main>
  );
};

export default OrderComplete;
