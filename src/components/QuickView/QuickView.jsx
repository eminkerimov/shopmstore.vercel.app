import React, { useLayoutEffect, useMemo, useState } from "react";
import Dialog from "@mui/material/Dialog";
import useMediaQuery from "@mui/material/useMediaQuery";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import QuantityControl from "../QuantityControl/QuantityControl";
import { getProductDisplay, getProductVariants, formatProductPrice } from "../../helpers/product";
import { addToCart } from "../../redux/cartReducer";
import "./QuickView.scss";

const QuickView = ({ product, open, onClose, onAdd, onExited }) => {
  const dispatch = useDispatch();
  const fullscreen = useMediaQuery("(max-width: 700px)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const display = useMemo(() => getProductDisplay(product || {}), [product]);
  const variants = useMemo(() => getProductVariants(product || {}), [product]);
  const images = useMemo(() => product ? [...new Set([
    product.img,
    product.img2,
    ...(Array.isArray(product.images) ? product.images : []),
  ].filter((src) => typeof src === "string" && src.trim()))] : [], [product]);
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const currentImage = imageIndex < images.length ? imageIndex : 0;
  const hasSizes = variants.sizes.length > 0;
  const hasColors = variants.colors.length > 0;
  const selectionsComplete = (!hasSizes || variants.sizes.includes(size)) && (!hasColors || variants.colors.includes(color));
  const canAdd = Boolean(open && product?.id != null && selectionsComplete);
  const missingOptions = [hasColors && !variants.colors.includes(color) && "a color", hasSizes && !variants.sizes.includes(size) && "a size"].filter(Boolean);
  const selectionHint = missingOptions.length ? `Select ${missingOptions.join(" and ")} to add this item.` : "";

  useLayoutEffect(() => {
    if (!open) return;
    setImageIndex(0);
    setQuantity(1);
    setSize("");
    setColor("");
  }, [open, product]);

  const moveImage = (direction) => {
    if (images.length > 1) setImageIndex((current) => (current + direction + images.length) % images.length);
  };
  const handleAdd = () => {
    if (!canAdd) return;
    dispatch(addToCart({
      id: display.id,
      title: display.title,
      desc: display.desc,
      price: display.price,
      img: display.img,
      quantity,
      size,
      color,
    }));
    onAdd?.();
  };

  return (
    <Dialog open={Boolean(open && product)} onClose={onClose} maxWidth={false} fullWidth fullScreen={fullscreen}
      className="quickView" PaperProps={{ className: "quickView__paper" }}
      transitionDuration={reducedMotion ? 0 : { enter: 180, exit: 140 }} TransitionProps={{ onExited }}
      aria-labelledby="quick-view-title" aria-describedby={display.desc ? "quick-view-description" : undefined}>
      <button type="button" className="quickView__close" onClick={onClose} aria-label="Close quick view"><CloseIcon /></button>
      <div className="quickView__layout">
        <div className="quickView__content">
          <section className="quickView__media" aria-label="Product photos"
            onKeyDown={(event) => {
              if (images.length > 1 && ["ArrowLeft", "ArrowRight"].includes(event.key)) {
                event.preventDefault();
                moveImage(event.key === "ArrowLeft" ? -1 : 1);
              }
            }}>
            <div className="quickView__image">
              {images.length ? <img key={images[currentImage]} src={images[currentImage]} alt={`${display.title}, view ${currentImage + 1}`} decoding="async" /> : <div className="quickView__noImage">No photo available</div>}
              {images.length > 1 && <>
                <button type="button" className="quickView__prev" onClick={() => moveImage(-1)} aria-label="Previous quick view image"><ChevronLeftIcon /></button>
                <button type="button" className="quickView__next" onClick={() => moveImage(1)} aria-label="Next quick view image"><ChevronRightIcon /></button>
                <span className="quickView__imageCount" aria-live="polite" aria-atomic="true">{currentImage + 1} / {images.length}</span>
              </>}
            </div>
            {images.length > 1 && <div className="quickView__thumbnails" aria-label="Choose product photo">
              {images.map((src, index) => <button type="button" key={src}
                className={`quickView__thumbnail ${index === currentImage ? "quickView__thumbnail--active" : ""}`}
                aria-label={`Show quick view image ${index + 1}`} aria-pressed={index === currentImage} onClick={() => setImageIndex(index)}>
                <img src={src} alt="" loading="lazy" decoding="async" />
              </button>)}
            </div>}
          </section>

          <section className="quickView__details" aria-label="Product details">
            {display.sub_category && <span className="quickView__category">{display.sub_category}</span>}
            <h2 id="quick-view-title">{display.title || "Quick view"}</h2>
            <div className="quickView__price">
              <strong>{formatProductPrice(display.price)}</strong>
              {display.previousPrice && <del aria-label="Original price">{formatProductPrice(display.previousPrice)}</del>}
            </div>
            {display.desc && <p id="quick-view-description" className="quickView__description">{display.desc}</p>}
            {(hasSizes || hasColors) && <div className="quickView__variants">
              {hasColors && <fieldset><legend>Color {color && <span>· {color}</span>}</legend>
                <div className="quickView__options">{variants.colors.map((option) => <button type="button" key={option}
                  className={`quickView__option ${color === option ? "quickView__option--selected" : ""}`}
                  aria-pressed={color === option} onClick={() => setColor(option)}>{option}</button>)}</div>
              </fieldset>}
              {hasSizes && <fieldset><legend>Size {size && <span>· {size}</span>}</legend>
                <div className="quickView__options">{variants.sizes.map((option) => <button type="button" key={option}
                  className={`quickView__option quickView__option--size ${size === option ? "quickView__option--selected" : ""}`}
                  aria-pressed={size === option} onClick={() => setSize(option)}>{option}</button>)}</div>
              </fieldset>}
            </div>}
            <div className="quickView__quantity"><span>Quantity</span><QuantityControl value={quantity} onChange={setQuantity} /></div>
          </section>
        </div>
        <footer className="quickView__footer">
          {selectionHint && <p id="quick-view-selection-hint" className="quickView__selectionHint" role="status">{selectionHint}</p>}
          <button type="button" className="quickView__add" disabled={!canAdd} aria-describedby={selectionHint ? "quick-view-selection-hint" : undefined} onClick={handleAdd}><AddShoppingCartIcon />Add to cart</button>
          <Link className="quickView__detailsLink" to={`/product/${encodeURIComponent(display.id ?? "")}`} onClick={onClose}>View full details<ChevronRightIcon /></Link>
        </footer>
      </div>
    </Dialog>
  );
};

export default QuickView;