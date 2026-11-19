import React, { useEffect, useRef, useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { resetCart, selectCartItems, selectCartQuantity, selectCartSubtotal } from "../../redux/cartReducer";
import { formatMoney, getCartItemKey } from "../../helpers/cart";
import { DEMO_DETAILS, formatCardNumber, formatExpiry, validateCheckout } from "../../helpers/checkout";
import "./Payment.scss";

const EMPTY_DETAILS = { email: "", cardNumber: "", expiry: "", cvc: "", cardName: "", country: "" };

const Payment = () => {
  const products = useSelector(selectCartItems);
  const total = useSelector(selectCartSubtotal);
  const quantity = useSelector(selectCartQuantity);
  const compactSummary = useMediaQuery("(max-width: 900px)");
  const [summaryOpen, setSummaryOpen] = useState(false);
  const itemCountLabel = `${quantity} ${quantity === 1 ? "item" : "items"}`;
  const [values, setValues] = useState(EMPTY_DETAILS);
  const [errors, setErrors] = useState({});
  const [phase, setPhase] = useState("idle");
  const [paymentError, setPaymentError] = useState("");
  const formRef = useRef(null);
  const timerRef = useRef(null);
  const latestProducts = useRef(products);
  latestProducts.current = products;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const change = (event) => {
    const { name } = event.target;
    let value = event.target.value;
    if (name === "cardNumber") value = formatCardNumber(value);
    if (name === "expiry") value = formatExpiry(value);
    if (name === "cvc") value = value.replace(/\D/g, "").slice(0, 4);
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setPaymentError("");
  };

  const field = (name) => ({
    name,
    id: "checkout-" + name,
    value: values[name],
    onChange: change,
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? name + "-error" : undefined,
  });
  const error = (name) => errors[name] ? (
    <small className="payment__error" id={name + "-error"} role="alert">{errors[name]}</small>
  ) : null;

  const handlePay = async (event) => {
    event.preventDefault();
    if (phase === "processing" || !products.length) return;
    const nextErrors = validateCheckout(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      formRef.current.elements.namedItem(Object.keys(nextErrors)[0])?.focus();
      return;
    }
    const fingerprint = JSON.stringify(products);
    setPhase("processing");
    setPaymentError("");
    await new Promise((resolve) => { timerRef.current = setTimeout(resolve, 1000); });
    if (JSON.stringify(latestProducts.current) !== fingerprint) {
      setPhase("error");
      setPaymentError("Your bag changed. Review the new total and try again.");
      return;
    }
    const order = {
      id: "MS-" + Date.now().toString(36).toUpperCase(),
      createdAt: new Date().toISOString(),
      items: products.map((item) => ({ ...item })),
      total,
      quantity,
    };
    try { sessionStorage.setItem("mstore-demo-order", JSON.stringify(order)); } catch {}
    dispatch(resetCart());
    navigate("/order-complete", { state: { order }, replace: true });
  };

  if (!products.length) {
    return (
      <main className="payment payment--empty">
        <div className="payment__empty">
          <span className="payment__eyebrow">Demo checkout</span>
          <h1>Your bag is empty</h1>
          <p>Add a product before trying the checkout.</p>
          <Link className="payment__submit" to="/products/1">Explore collection</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="payment">
      <div className="payment__container">
        <header className="payment__header">
          <Link className="payment__back" to="/cart"><ArrowBackIcon />Return to bag</Link>
          <div className="payment__headingRow">
            <h1>Checkout</h1>
            <button className="payment__fill" type="button" disabled={phase === "processing"}
              onClick={() => { setValues(DEMO_DETAILS); setErrors({}); setPaymentError(""); }}>
              Fill test details
            </button>
          </div>
          <p className="payment__demoHint">Demo checkout. No payment is taken.</p>
        </header>

        <div className="payment__layout">
          <aside className="payment__summary" aria-label="Order summary">
            {compactSummary ? (
              <button type="button" className="payment__summaryToggle" aria-expanded={summaryOpen}
                aria-controls="checkout-order-summary" onClick={() => setSummaryOpen((open) => !open)}>
                <span className="payment__summaryToggleLabel">
                  <strong>{summaryOpen ? "Hide order summary" : "Show order summary"}</strong>
                  <small>{itemCountLabel}</small>
                </span>
                <span className="payment__summaryToggleTotal">{formatMoney(total)}<ExpandMoreIcon aria-hidden="true" /></span>
              </button>
            ) : (
              <div className="payment__summaryHeader"><h2>Order summary</h2><span>{itemCountLabel}</span></div>
            )}
            <div id="checkout-order-summary" className="payment__summaryContent" hidden={compactSummary && !summaryOpen}>
              <ul className="payment__items" aria-label="Items in your order">
                {products.map((item) => (
                  <li className="payment__item" key={getCartItemKey(item)} data-line-key={getCartItemKey(item)}>
                    <img src={item.img} alt="" width="60" height="80" />
                    <div className="payment__itemDetails">
                      <h3 title={item.title}>{item.title}</h3>
                      {(item.size || item.color) && <p className="payment__itemVariant">{[item.size, item.color].filter(Boolean).join(" · ")}</p>}
                      <p className="payment__itemQuantity">Qty {item.quantity} · {formatMoney(item.price)} each</p>
                    </div>
                    <strong className="payment__itemTotal">{formatMoney(item.price * item.quantity)}</strong>
                  </li>
                ))}
              </ul>
              <dl className="payment__totals">
                <div className="payment__summaryRow"><dt>Subtotal</dt><dd>{formatMoney(total)}</dd></div>
                <div className="payment__summaryRow"><dt>Delivery</dt><dd>Included in this demo</dd></div>
                <div className="payment__summaryTotal"><dt>Total</dt><dd><strong>{formatMoney(total)}</strong><span>USD</span></dd></div>
              </dl>
            </div>
          </aside>

          <section className="payment__content" aria-label="Checkout details">
            <form className="payment__form" ref={formRef} onSubmit={handlePay} noValidate>
              <fieldset disabled={phase === "processing"} className="payment__fields payment__fields--contact">
                <legend>Contact</legend>
                <div className="payment__field">
                  <label htmlFor="checkout-email">Email address</label>
                  <input {...field("email")} type="email" autoComplete="email" placeholder="name@example.com" required />
                  {error("email")}
                </div>
              </fieldset>
              <fieldset disabled={phase === "processing"} className="payment__fields">
                <legend>Payment</legend>
                <div className="payment__field">
                  <label htmlFor="checkout-cardNumber">Test card number</label>
                  <input {...field("cardNumber")} type="text" inputMode="numeric" autoComplete="off"
                    placeholder="4242 4242 4242 4242" required />
                  {error("cardNumber")}
                </div>
                <div className="payment__cardMeta">
                  <div className="payment__field">
                    <label htmlFor="checkout-expiry">Expiry</label>
                    <input {...field("expiry")} inputMode="numeric" autoComplete="off" placeholder="MM / YY" maxLength={7} required />
                    {error("expiry")}
                  </div>
                  <div className="payment__field">
                    <label htmlFor="checkout-cvc">CVC</label>
                    <input {...field("cvc")} inputMode="numeric" autoComplete="off" placeholder="123" maxLength={4} required />
                    {error("cvc")}
                  </div>
                </div>
                <div className="payment__billingMeta">
                <div className="payment__field">
                  <label htmlFor="checkout-cardName">Name on test card</label>
                  <input {...field("cardName")} autoComplete="off" placeholder="Full name" required />
                  {error("cardName")}
                </div>
                <div className="payment__field">
                  <label htmlFor="checkout-country">Billing country</label>
                  <select {...field("country")} required>
                    <option value="" disabled>Select country</option>
                    <option value="AZ">Azerbaijan</option><option value="CY">Cyprus</option>
                    <option value="TR">Turkey</option><option value="GB">United Kingdom</option><option value="US">United States</option>
                  </select>
                  {error("country")}
                </div>
                </div>
              </fieldset>
              {paymentError && <p className="payment__feedback" role="alert">{paymentError}</p>}
              <button className="payment__submit" type="submit" disabled={phase === "processing"}>
                {phase === "processing" ? "Processing demo order..." : "Place demo order · " + formatMoney(total)}
              </button>
              <p className="payment__notice" role="status">{phase === "processing" ? "Processing your demo order. Please wait." : ""}</p>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Payment;