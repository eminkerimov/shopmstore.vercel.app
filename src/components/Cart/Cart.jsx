import React, { useMemo } from "react";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  handleCart,
  removeItem,
  resetCart,
} from "../../redux/cartReducer";
import "./Cart.scss";

const Cart = () => {
  const products = useSelector((state) => state.cart.products);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const totalPrice = useMemo(() => {
    return products
      .reduce(
        (total, item) => total + item.quantity * item.price,
        0
      )
      .toFixed(2);
  }, [products]);

  const handleViewCart = () => {
    dispatch(handleCart(false));
    navigate("/cart");
  };

  const handleShopping = () => {
    dispatch(handleCart(false));
    navigate("/products/1");
  };

  return (
    <aside
      className={`miniCart ${
        products.length === 0 ? "miniCart--empty" : ""
      }`}
    >
      <div className="miniCart__header">
        <div>
          <span className="miniCart__eyebrow">Your selection</span>
          <h2>Your bag</h2>
        </div>

        <span className="miniCart__count">
          {products.length} {products.length === 1 ? "item" : "items"}
        </span>
      </div>

      {products.length > 0 ? (
        <>
          <div className="miniCart__items">
            {products.map((item) => (
              <article className="miniCart__item" key={item.id}>
                <img src={item.img} alt={item.title} />

                <div className="miniCart__details">
                  <h3>{item.title}</h3>
                  <p>{item.desc?.substring(0, 65)}</p>

                  <div className="miniCart__meta">
                    <span>Qty {item.quantity}</span>

                    <strong>
                      ${(item.quantity * item.price).toFixed(2)}
                    </strong>
                  </div>
                </div>

                <button
                  className="miniCart__delete"
                  type="button"
                  aria-label={`Remove ${item.title}`}
                  onClick={() => dispatch(removeItem(item.id))}
                >
                  <DeleteOutlinedIcon />
                </button>
              </article>
            ))}
          </div>

          <div className="miniCart__footer">
            <div className="miniCart__summary">
              <span>Subtotal</span>
              <strong>${totalPrice}</strong>
            </div>

            <button
              className="miniCart__primary"
              type="button"
              onClick={handleViewCart}
            >
              View bag
            </button>

            <button
              className="miniCart__reset"
              type="button"
              onClick={() => dispatch(resetCart())}
            >
              Clear bag
            </button>
          </div>
        </>
      ) : (
        <div className="miniCart__empty">
          <div className="miniCart__emptyIcon">
            <ShoppingBagOutlinedIcon />
          </div>

          <div className="miniCart__emptyContent">
            <h3>Your bag is empty</h3>
            <p>Add something from the collection to continue.</p>
          </div>

          <button
            className="miniCart__emptyAction"
            type="button"
            onClick={handleShopping}
          >
            Start shopping
            <ArrowForwardIcon />
          </button>
        </div>
      )}
    </aside>
  );
};

export default Cart;