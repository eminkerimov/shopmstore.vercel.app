import React from "react";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { resetCart } from "../../redux/cartReducer";
import "./Payment.scss";

const Payment = () => {
  const total = useSelector((state) => state.cart.total);
  const products = useSelector((state) => state.cart.products);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handlePay = (event) => {
    event.preventDefault();
    dispatch(resetCart());
    navigate("/");
  };

  return (
    <main className="payment">
      <div className="payment__container">
        <aside className="payment__summary">
          <div className="payment__summaryTop">
            <span className="payment__eyebrow">Secure checkout</span>
            <h1>Complete your order</h1>
            <p>
              Review your total and enter your payment details to finish the
              purchase.
            </p>
          </div>

          <div className="payment__summaryDetails">
            <div className="payment__summaryRow">
              <span>Items</span>
              <strong>{products.length}</strong>
            </div>

            <div className="payment__summaryRow">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>

            <div className="payment__summaryTotal">
              <span>Total</span>
              <strong>${Number(total || 0).toFixed(2)}</strong>
            </div>
          </div>

          <div className="payment__trust">
            <div>
              <LockOutlinedIcon />
              <span>Encrypted payment</span>
            </div>

            <div>
              <ShieldOutlinedIcon />
              <span>Secure checkout</span>
            </div>
          </div>
        </aside>

        <section className="payment__content">
          <div className="payment__contentHeader">
            <span className="payment__eyebrow">Payment details</span>
            <h2>Pay with card</h2>
          </div>

          <form className="payment__form" onSubmit={handlePay}>
            <label className="payment__field">
              <span>Email address</span>
              <input
                type="email"
                name="email"
                placeholder="name@example.com"
                autoComplete="email"
                required
              />
            </label>

            <div className="payment__field">
              <span>Card information</span>

              <div className="payment__cardGroup">
                <input
                  className="payment__cardNumber"
                  type="text"
                  name="cardNumber"
                  placeholder="1234 1234 1234 1234"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  required
                />

                <div className="payment__cardMeta">
                  <input
                    type="text"
                    name="expiry"
                    placeholder="MM / YY"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    required
                  />

                  <input
                    type="text"
                    name="cvc"
                    placeholder="CVC"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    required
                  />
                </div>
              </div>
            </div>

            <label className="payment__field">
              <span>Name on card</span>
              <input
                type="text"
                name="cardName"
                placeholder="Full name"
                autoComplete="cc-name"
                required
              />
            </label>

            <label className="payment__field">
              <span>Billing country</span>
              <select name="country" defaultValue="" required>
                <option value="" disabled>
                  Select country
                </option>
                <option value="AZ">Azerbaijan</option>
                <option value="CY">Cyprus</option>
                <option value="TR">Turkey</option>
                <option value="GB">United Kingdom</option>
                <option value="US">United States</option>
              </select>
            </label>

            <button className="payment__submit" type="submit">
              Pay ${Number(total || 0).toFixed(2)}
            </button>

            <p className="payment__notice">
              This is a demo checkout. No real payment will be processed.
            </p>
          </form>

          <Link className="payment__back" to="/cart">
            <ArrowBackIcon />
            Return to bag
          </Link>
        </section>
      </div>
    </main>
  );
};

export default Payment;