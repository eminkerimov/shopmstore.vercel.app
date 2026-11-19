import React, { useEffect, useRef, useState } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  removeItem, resetCart, selectCartItems, selectCartQuantity,
  selectCartSubtotal, updateQuantity,
} from "../../redux/cartReducer";
import { formatMoney, getCartItemKey, describeCartItem } from "../../helpers/cart";
import QuantityControl from "../../components/QuantityControl/QuantityControl";
import "./CartPage.scss";

const CartPage = () => {
  const products = useSelector(selectCartItems);
  const totalItems = useSelector(selectCartQuantity);
  const subtotal = useSelector(selectCartSubtotal);
  const dispatch = useDispatch();
  const checkoutRef = useRef(null);
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const mobile = useMediaQuery("(max-width: 767px)");
  const mobileCheckout = mobile && products.length > 0 && !checkoutVisible;

  useEffect(() => {
    const checkout = checkoutRef.current;
    if (!checkout || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver(([entry]) => setCheckoutVisible(entry.isIntersecting && entry.intersectionRatio >= 1), {
      rootMargin: "-76px 0px -88px 0px",
      threshold: [0, 1],
    });
    observer.observe(checkout);
    return () => observer.disconnect();
  }, [products.length]);

  if (!products.length) {
    return (
      <main className="cartPage cartPage--empty">
        <div className="cartPage__empty">
          <span>Your bag</span><h1>Nothing here yet</h1>
          <p>Your selected products will appear here.</p>
          <Link to="/products/1" className="cartPage__shopLink">Explore collection</Link>
        </div>
      </main>
    );
  }

  return (
    <main className={`cartPage ${mobileCheckout ? "cartPage--mobile-checkout" : ""}`}>
      <div className="cartPage__container">
        <header className="cartPage__header">
          <h1>Your bag</h1>
          <span className="cartPage__itemsCount">{totalItems} {totalItems === 1 ? "item" : "items"}</span>
        </header>
        <div className="cartPage__layout">
          <section className="cartPage__products" aria-label="Selected products">
            {products.map((item) => {
              const key = getCartItemKey(item);
              return (
                <article className="cartPage__product" key={key} data-line-key={key}>
                  <Link className="cartPage__imageLink" to={"/product/" + item.id}>
                    <img src={item.img} alt={item.title} />
                  </Link>
                  <div className="cartPage__productContent">
                    <div className="cartPage__productTop">
                      <div>
                        <Link className="cartPage__productTitle" to={"/product/" + item.id}>{item.title}</Link>
                        {(item.size || item.color) && <p className="cartPage__variant">{[item.size, item.color].filter(Boolean).join(" · ")}</p>}
                        <span className="cartPage__unitPrice">{formatMoney(item.price)} each</span>
                      </div>
                      <strong>{formatMoney(item.quantity * item.price)}</strong>
                    </div>
                    <div className="cartPage__productBottom">
                      <QuantityControl value={item.quantity} label={"Quantity for " + describeCartItem(item)}
                        onChange={(quantity) => dispatch(updateQuantity({ key, quantity }))} />
                      <button type="button" onClick={() => dispatch(removeItem(key))} aria-label={"Remove " + describeCartItem(item)}>
                        <DeleteOutlinedIcon />Remove
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
          <aside className="cartPage__summary" aria-label="Order summary">
            <span className="cartPage__summaryLabel">Order summary</span>
            <div className="cartPage__summaryRow"><span>Subtotal</span><strong>{formatMoney(subtotal)}</strong></div>
            <div className="cartPage__summaryRow"><span>Demo delivery</span><span>Included</span></div>
            <div className="cartPage__summaryTotal"><span>Total</span><strong>{formatMoney(subtotal)}</strong></div>
            <Link className="cartPage__checkout" to="/payment" ref={checkoutRef}>Continue to checkout<ArrowForwardIcon /></Link>
            <Link className="cartPage__continue" to="/products/1"><ArrowBackIcon />Continue shopping</Link>
            <button className="cartPage__clear" type="button" onClick={() => dispatch(resetCart())}>Clear bag</button>
          </aside>
        </div>
      </div>
      {mobileCheckout && <div className="cartPage__mobileCheckout">
        <div className="cartPage__mobileTotal"><span>Total · {totalItems} {totalItems === 1 ? "item" : "items"}</span><strong>{formatMoney(subtotal)}</strong></div>
        <Link className="cartPage__mobileLink" to="/payment">Checkout<ArrowForwardIcon /></Link>
      </div>}
    </main>
  );
};

export default CartPage;
