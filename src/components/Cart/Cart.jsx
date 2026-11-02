import React from "react";
import Drawer from "@mui/material/Drawer";
import useMediaQuery from "@mui/material/useMediaQuery";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  handleCart, removeItem, resetCart, selectCartItems, selectCartQuantity,
  selectCartSubtotal, updateQuantity,
} from "../../redux/cartReducer";
import { formatMoney, getCartItemKey, describeCartItem } from "../../helpers/cart";
import QuantityControl from "../QuantityControl/QuantityControl";
import CartUndo from "../CartUndo/CartUndo";
import "./Cart.scss";

const Cart = ({ open }) => {
  const products = useSelector(selectCartItems);
  const quantity = useSelector(selectCartQuantity);
  const subtotal = useSelector(selectCartSubtotal);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const close = () => dispatch(handleCart(false));
  const goTo = (url) => { close(); navigate(url); };

  return (
    <Drawer anchor="right" open={Boolean(open)} onClose={close}
      transitionDuration={reducedMotion ? 0 : 250}
      PaperProps={{ className: "miniCart", role: "dialog", "aria-modal": true, "aria-labelledby": "bag-title" }}>
      <div className="miniCart__header">
        <div>
          <span className="miniCart__eyebrow">Your selection</span>
          <h2 id="bag-title">Your bag <span>({quantity})</span></h2>
        </div>
        <button className="miniCart__close" type="button" onClick={close} aria-label="Close shopping bag" autoFocus>
          <CloseRoundedIcon />
        </button>
      </div>
      {products.length ? (
        <>
          <div className="miniCart__items">
            {products.map((item) => {
              const key = getCartItemKey(item);
              return (
                <article className="miniCart__item" key={key} data-line-key={key}>
                  <Link to={"/product/" + item.id} onClick={close}>
                    <img src={item.img} alt={item.title} />
                  </Link>
                  <div className="miniCart__details">
                    <Link to={"/product/" + item.id} onClick={close}><h3>{item.title}</h3></Link>
                    {(item.size || item.color) && <p>{[item.size, item.color].filter(Boolean).join(" · ")}</p>}
                    <QuantityControl value={item.quantity} label={"Quantity for " + describeCartItem(item)}
                      onChange={(value) => dispatch(updateQuantity({ key, quantity: value }))} />
                    <strong>{formatMoney(item.quantity * item.price)}</strong>
                  </div>
                  <button className="miniCart__delete" type="button"
                    aria-label={"Remove " + describeCartItem(item)} onClick={() => dispatch(removeItem(key))}>
                    <DeleteOutlinedIcon />
                  </button>
                </article>
              );
            })}
          </div>
          <div className="miniCart__footer">
            <div className="miniCart__summary"><span>Subtotal</span><strong>{formatMoney(subtotal)}</strong></div>
            <button className="miniCart__primary" type="button" onClick={() => goTo("/cart")}>View bag</button>
            <button className="miniCart__reset" type="button" onClick={() => dispatch(resetCart())}>Clear bag</button>
          </div>
        </>
      ) : (
        <div className="miniCart__empty">
          <ShoppingBagOutlinedIcon />
          <h3>Your bag is empty</h3>
          <p>Find something you love in the collection.</p>
          <button className="miniCart__primary" type="button" onClick={() => goTo("/products/1")}>Explore collection</button>
        </div>
      )}
      <CartUndo inline />
    </Drawer>
  );
};

export default Cart;
