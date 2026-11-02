import React, { useEffect, useRef, useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { resetCart, selectCartItems, selectCartQuantity, selectCartSubtotal } from "../../redux/cartReducer";
import { formatMoney } from "../../helpers/cart";
import { DEMO_DETAILS, formatCardNumber, formatExpiry, validateCheckout } from "../../helpers/checkout";
import "./Payment.scss";

const EMPTY_DETAILS = { email: "", cardNumber: "", expiry: "", cvc: "", cardName: "", country: "" };

const Payment = () => {
  const products = useSelector(selectCartItems);
  const total = useSelector(selectCartSubtotal);
  const quantity = useSelector(selectCartQuantity);
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
        <aside className="payment__summary">
          <div className="payment__summaryTop">
            <span className="payment__eyebrow">Demo checkout</span>
            <h1>Complete your order</h1>
            <p>A complete checkout preview. No real payment is taken.</p>
          </div>
          <div className="payment__summaryDetails">
            <div className="payment__summaryRow"><span>Items</span><strong>{quantity}</strong></div>
            <div className="payment__summaryRow"><span>Delivery</span><span>Included in this demo</span></div>
            <div className="payment__summaryTotal"><span>Total</span><strong>{formatMoney(total)}</strong></div>
          </div>
          <p className="payment__demoHint">Your card details stay in this form and are never sent or saved.</p>
        </aside>
        <section className="payment__content">
          <div className="payment__contentHeader">
            <span className="payment__eyebrow">Payment details</span>
            <h2>Try the checkout</h2>
            <button className="payment__fill" type="button" disabled={phase === "processing"}
              onClick={() => { setValues(DEMO_DETAILS); setErrors({}); setPaymentError(""); }}>
              Fill test details
            </button>
          </div>
          <form className="payment__form" ref={formRef} onSubmit={handlePay} noValidate>
            <fieldset disabled={phase === "processing"} className="payment__fields">
              <label className="payment__field" htmlFor="checkout-email">
                <span>Email address</span><input {...field("email")} type="email" autoComplete="email" placeholder="name@example.com" required />
                {error("email")}
              </label>
              <div className="payment__field">
                <label htmlFor="checkout-cardNumber">Test card number</label>
                <input {...field("cardNumber")} type="text" inputMode="numeric" autoComplete="off"
                  placeholder="4242 4242 4242 4242" required />
                {error("cardNumber")}
              </div>
              <div className="payment__cardMeta">
                <label className="payment__field" htmlFor="checkout-expiry">
                  <span>Expiry</span><input {...field("expiry")} inputMode="numeric" autoComplete="off" placeholder="MM / YY" maxLength={7} required />
                  {error("expiry")}
                </label>
                <label className="payment__field" htmlFor="checkout-cvc">
                  <span>CVC</span><input {...field("cvc")} inputMode="numeric" autoComplete="off" placeholder="123" maxLength={4} required />
                  {error("cvc")}
                </label>
              </div>
              <label className="payment__field" htmlFor="checkout-cardName">
                <span>Name on test card</span><input {...field("cardName")} autoComplete="off" placeholder="Full name" required />
                {error("cardName")}
              </label>
              <label className="payment__field" htmlFor="checkout-country">
                <span>Billing country</span>
                <select {...field("country")} required>
                  <option value="" disabled>Select country</option>
                  <option value="AZ">Azerbaijan</option><option value="CY">Cyprus</option>
                  <option value="TR">Turkey</option><option value="GB">United Kingdom</option><option value="US">United States</option>
                </select>
                {error("country")}
              </label>
            </fieldset>
            {paymentError && <p className="payment__feedback" role="alert">{paymentError}</p>}
            <button className="payment__submit" type="submit" disabled={phase === "processing"}>
              {phase === "processing" ? "Processing demo order..." : "Place demo order · " + formatMoney(total)}
            </button>
            <p className="payment__notice" role="status">{phase === "processing" ? "Processing your demo order. Please wait." : "Use test details. No payment will be processed."}</p>
          </form>
          <Link className="payment__back" to="/cart"><ArrowBackIcon />Return to bag</Link>
        </section>
      </div>
    </main>
  );
};

export default Payment;
