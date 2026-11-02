import React from "react";
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
    <main className="cartPage">
      <div className="cartPage__container">
        <header className="cartPage__header">
          <div><span className="cartPage__eyebrow">Shopping bag</span><h1>Your selection</h1></div>
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
                        <p>{item.desc?.substring(0, 140)}</p>
                      </div>
                      <strong>{formatMoney(item.quantity * item.price)}</strong>
                    </div>
                    <div className="cartPage__productBottom">
                      <div className="cartPage__productMeta">
                        {(item.size || item.color) && <span>{[item.size, item.color].filter(Boolean).join(" · ")}</span>}
                        <span>{formatMoney(item.price)} each</span>
                        <QuantityControl value={item.quantity} label={"Quantity for " + describeCartItem(item)}
                          onChange={(quantity) => dispatch(updateQuantity({ key, quantity }))} />
                      </div>
                      <button type="button" onClick={() => dispatch(removeItem(key))} aria-label={"Remove " + describeCartItem(item)}>
                        <DeleteOutlinedIcon />Remove
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
          <aside className="cartPage__summary">
            <span className="cartPage__summaryLabel">Order summary</span>
            <div className="cartPage__summaryRow"><span>Subtotal</span><strong>{formatMoney(subtotal)}</strong></div>
            <div className="cartPage__summaryRow"><span>Demo delivery</span><span>Included</span></div>
            <div className="cartPage__summaryTotal"><span>Total</span><strong>{formatMoney(subtotal)}</strong></div>
            <Link className="cartPage__checkout" to="/payment">Continue to checkout</Link>
            <Link className="cartPage__continue" to="/products/1"><ArrowBackIcon />Continue shopping</Link>
            <button className="cartPage__clear" type="button" onClick={() => dispatch(resetCart())}>Clear bag</button>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default CartPage;
