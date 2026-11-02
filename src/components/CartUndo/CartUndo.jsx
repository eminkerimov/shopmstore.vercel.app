import React, { useEffect } from "react";
import Snackbar from "@mui/material/Snackbar";
import { useDispatch, useSelector } from "react-redux";
import { dismissUndo, undoRemove } from "../../redux/cartReducer";
import { getCartItemKey } from "../../helpers/cart";
import "./CartUndo.scss";

const CartUndo = ({ inline = false }) => {
  const removed = useSelector((state) => state.cart.lastRemoved);
  const cartOpen = useSelector((state) => state.cart.cartOpen);
  const dispatch = useDispatch();
  const active = Boolean(removed) && (inline ? cartOpen : !cartOpen);

  useEffect(() => {
    if (!inline || !active) return undefined;
    const timer = setTimeout(() => dispatch(dismissUndo()), 7000);
    return () => clearTimeout(timer);
  }, [inline, active, removed, dispatch]);

  const action = <button type="button" className="undoButton" onClick={() => dispatch(undoRemove())}>Undo</button>;

  if (inline) {
    return active ? (
      <div className="cartUndo" role="status">
        <span>Product removed</span>{action}
      </div>
    ) : null;
  }
  return (
    <Snackbar key={removed ? getCartItemKey(removed.item) : "empty"} open={active} autoHideDuration={7000}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      message="Product removed from your bag"
      onClose={(_, reason) => { if (reason !== "clickaway") dispatch(dismissUndo()); }}
      action={action}
    />
  );
};

export default CartUndo;
