import React, { useMemo } from "react";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  removeItem,
  resetCart,
  totalCart,
} from "../../redux/cartReducer";
import "./CartPage.scss";

const CartPage = () => {
  const products = useSelector((state) => state.cart.products);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const totalItems = products.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const subtotal = useMemo(
    () =>
      products.reduce(
        (total, item) => total + item.quantity * item.price,
        0
      ),
    [products]
  );

  const handlePayment = () => {
    dispatch(totalCart(subtotal.toFixed(2)));
    navigate("/payment");
  };

  if (!products.length) {
    return (
      <main className="cartPage cartPage--empty">
        <div className="cartPage__empty">
          <span>Your bag</span>
          <h1>Nothing here yet</h1>
          <p>Your selected products will appear here.</p>

          <Link to="/products/1" className="cartPage__shopLink">
            Explore collection
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="cartPage">
      <div className="cartPage__container">
        <header className="cartPage__header">
          <div>
            <span className="cartPage__eyebrow">Shopping bag</span>
            <h1>Your selection</h1>
          </div>

          <span className="cartPage__itemsCount">
            {totalItems} {totalItems === 1 ? "item" : "items"}
          </span>
        </header>

        <div className="cartPage__layout">
          <section className="cartPage__products">
            {products.map((item) => (
              <article className="cartPage__product" key={item.id}>
                <Link
                  className="cartPage__imageLink"
                  to={`/product/${item.id}`}
                >
                  <img src={item.img} alt={item.title} />
                </Link>

                <div className="cartPage__productContent">
                  <div className="cartPage__productTop">
                    <div>
                      <Link
                        className="cartPage__productTitle"
                        to={`/product/${item.id}`}
                      >
                        {item.title}
                      </Link>

                      <p>{item.desc?.substring(0, 140)}</p>
                    </div>

                    <strong>
                      ${(item.quantity * item.price).toFixed(2)}
                    </strong>
                  </div>

                  <div className="cartPage__productBottom">
                    <div className="cartPage__productMeta">
                      <span>Quantity: {item.quantity}</span>
                      <span>${item.price} each</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => dispatch(removeItem(item.id))}
                    >
                      <DeleteOutlinedIcon />
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <aside className="cartPage__summary">
            <span className="cartPage__summaryLabel">Order summary</span>

            <div className="cartPage__summaryRow">
              <span>Subtotal</span>
              <strong>${subtotal.toFixed(2)}</strong>
            </div>

            <div className="cartPage__summaryRow">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>

            <div className="cartPage__summaryTotal">
              <span>Total</span>
              <strong>${subtotal.toFixed(2)}</strong>
            </div>

            <button
              className="cartPage__checkout"
              type="button"
              onClick={handlePayment}
            >
              Continue to checkout
            </button>

            <Link className="cartPage__continue" to="/products/1">
              <ArrowBackIcon />
              Continue shopping
            </Link>

            <button
              className="cartPage__clear"
              type="button"
              onClick={() => dispatch(resetCart())}
            >
              Clear bag
            </button>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default CartPage;