import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { handleCart } from "../../redux/cartReducer";
import QuickView from "./QuickView";

const QuickViewContext = createContext(null);
export const useQuickView = () => useContext(QuickViewContext);

const QuickViewProvider = ({ children }) => {
  const [product, setProduct] = useState(null);
  const [open, setOpen] = useState(false);
  const openCartAfterExit = useRef(false);
  const location = useLocation();
  const dispatch = useDispatch();

  const openQuickView = useCallback((item) => {
    if (item?.id == null) return;
    openCartAfterExit.current = false;
    setProduct(item);
    setOpen(true);
  }, []);
  const closeQuickView = useCallback(() => {
    openCartAfterExit.current = false;
    setOpen(false);
  }, []);
  const addedToCart = useCallback(() => {
    openCartAfterExit.current = true;
    setOpen(false);
  }, []);
  const afterExit = useCallback(() => {
    setProduct(null);
    if (openCartAfterExit.current) {
      openCartAfterExit.current = false;
      dispatch(handleCart(true));
    }
  }, [dispatch]);

  useEffect(() => {
    openCartAfterExit.current = false;
    setOpen(false);
  }, [location.key]);

  const value = useMemo(() => ({ openQuickView, activeProductId: open ? String(product?.id) : null }), [openQuickView, open, product]);
  return (
    <QuickViewContext.Provider value={value}>
      {children}
      {product && <QuickView product={product} open={open} onClose={closeQuickView} onAdd={addedToCart} onExited={afterExit} />}
    </QuickViewContext.Provider>
  );
};

export default QuickViewProvider;
