import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Dialog from "@mui/material/Dialog";
import useMediaQuery from "@mui/material/useMediaQuery";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import StraightenIcon from "@mui/icons-material/Straighten";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import useFetch from "../../custom/useFetch";
import Card from "../../components/Card/Card";
import RecentlyViewed from "../../components/RecentlyViewed/RecentlyViewed";
import AnimatedProductGrid from "../../components/AnimatedProductGrid/AnimatedProductGrid";
import AsyncState, { ProductDetailSkeleton, ProductSkeleton } from "../../components/AsyncState/AsyncState";
import QuantityControl from "../../components/QuantityControl/QuantityControl";
import { getProductDisplay, getProductVariants, formatProductPrice } from "../../helpers/product";
import { addToCart, handleCart } from "../../redux/cartReducer";
import { toggleWishlist } from "../../redux/wishlistReducer";
import "./Product.scss";

const RelatedProducts = ({ category, currentProductId }) => {
  const { data, loading, error, refetch } = useFetch(
    category ? `/product?category=${encodeURIComponent(category)}&sortBy=price&order=asc` : null
  );
  const products = Array.isArray(data) ? data.filter((item) => String(item.id) !== String(currentProductId)).slice(0, 4) : [];
  if (!loading && !error && !products.length) return null;
  return (
    <section className="product__related" aria-labelledby="related-title">
      <div className="product__related-inner">
        <h2 id="related-title">Complete your rotation</h2>
        {error ? <AsyncState title="Recommendations unavailable" message="You can still explore the collection." onRetry={refetch} /> : (
          <AnimatedProductGrid
            className="product__related-grid"
            aria-busy={loading}
            items={loading ? [] : products}
            renderItem={(item) => <Card item={item} />}
            fallback={loading ? <ProductSkeleton count={4} /> : null}
            animateChanges={!loading}
          />
        )}
      </div>
    </section>
  );
};

const Accordion = ({ name, title, active, onToggle, children }) => (
  <div className={`product__accordion ${active ? "product__accordion--active" : ""}`}>
    <button id={`accordion-${name}`} type="button" className="product__accordion-header"
      aria-expanded={active} aria-controls={`panel-${name}`} onClick={onToggle}>
      <span>{title}</span><span className="product__accordion-icon" aria-hidden="true">+</span>
    </button>
    <div id={`panel-${name}`} className="product__accordion-content" role="region"
      aria-labelledby={`accordion-${name}`} aria-hidden={!active}>
      <div className="product__accordion-inner">{children}</div>
    </div>
  </div>
);

const SizeGuide = ({ variants }) => {
  if (variants.sizeKind === "accessory") return <p className="productDialog__copy">Available product sizes: {variants.sizes.join(", ")}. Refer to the sizing details supplied for this accessory.</p>;
  const shoeRows = [["37", "23.5"], ["38", "24"], ["39", "24.5"], ["40", "25.5"], ["41", "26"], ["42", "26.5"], ["43", "27.5"], ["44", "28"]];
  const kidsShoeRows = [["28", "17"], ["29", "17.5"], ["30", "18.5"], ["31", "19"], ["32", "19.5"], ["33", "20.5"]];
  const apparelRows = [["XS", "82–87", "66–71"], ["S", "88–93", "72–77"], ["M", "94–99", "78–83"], ["L", "100–105", "84–89"], ["XL", "106–111", "90–95"]];
  const kidsRows = [["4Y", "98–104"], ["6Y", "110–116"], ["8Y", "122–128"], ["10Y", "134–140"], ["12Y", "146–152"]];
  const rows = variants.sizeKind === "shoes" ? (variants.sizes.some((size) => Number(size) < 35) ? kidsShoeRows : shoeRows)
    : variants.sizeKind === "kids" ? kidsRows : apparelRows;
  const headers = variants.sizeKind === "shoes" ? ["EU size", "Foot length, cm"] : variants.sizeKind === "kids" ? ["Size / age", "Height, cm"] : ["Size", "Chest, cm", "Waist, cm"];
  return (
    <>
      <p className="productDialog__copy">General size reference. These illustrative measurements are not a product-specific fit chart or a list of available sizes.</p>
      <div className="productDialog__table-wrap"><table>
        <caption className="product__sr-only">{variants.sizeKind === "shoes" ? "Shoe" : "Clothing"} size reference</caption>
        <thead><tr>{headers.map((header) => <th key={header} scope="col">{header}</th>)}</tr></thead>
        <tbody>{rows.map(([size, ...values]) => <tr key={size}><th scope="row">{size}</th>{values.map((value) => <td key={value}>{value}</td>)}</tr>)}</tbody>
      </table></div>
      <p className="productDialog__copy">{variants.sizeKind === "shoes" ? "Measure from your heel to your longest toe." : variants.sizeKind === "kids" ? "Measure height without shoes, standing straight." : "Measure around the fullest part of your chest and your natural waist."}</p>
      <p className="productDialog__copy">Available product sizes: {variants.sizes.join(", ")}. This reference is independent of brand sizing.</p>
    </>
  );
};

const EnlargedGallery = ({ open, onClose, images, imageIndex, title, onMove, onTouchStart, onTouchEnd }) => {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const viewportRef = useRef(null);
  const imageRef = useRef(null);
  const dragRef = useRef(null);
  const wasOpen = useRef(false);
  const anchor = useRef({ x: 0.5, y: 0.5 });
  const [fit, setFit] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);

  const measure = useCallback(() => {
    const viewport = viewportRef.current;
    const image = imageRef.current;
    const bounds = viewport?.getBoundingClientRect();
    if (!bounds?.width || !bounds.height || !image?.naturalWidth || !image.naturalHeight) return;
    const ratio = image.naturalWidth / image.naturalHeight;
    const width = Math.min(bounds.width, bounds.height * ratio);
    const nextFit = { width, height: width / ratio };
    setFit((current) => current?.width === nextFit.width && current?.height === nextFit.height ? current : nextFit);
  }, []);

  useLayoutEffect(() => {
    if (!open) { wasOpen.current = false; return undefined; }
    if (!wasOpen.current) setZoom(1);
    wasOpen.current = true;
    anchor.current = { x: 0.5, y: 0.5 };
    const frame = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(frame);
  }, [open, imageIndex, measure]);

  useEffect(() => {
    if (!open) return undefined;
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    if (viewportRef.current) observer?.observe(viewportRef.current);
    window.addEventListener("resize", measure);
    return () => { observer?.disconnect(); window.removeEventListener("resize", measure); };
  }, [open, measure]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!open || !fit || !viewport) return;
    viewport.scrollLeft = anchor.current.x * Math.max(viewport.clientWidth, fit.width * zoom) - viewport.clientWidth / 2;
    viewport.scrollTop = anchor.current.y * Math.max(viewport.clientHeight, fit.height * zoom) - viewport.clientHeight / 2;
  }, [open, fit, zoom, imageIndex]);

  const changeZoom = (nextZoom) => {
    const viewport = viewportRef.current;
    if (nextZoom === 1 || !viewport || !fit) anchor.current = { x: 0.5, y: 0.5 };
    else anchor.current = {
      x: (viewport.scrollLeft + viewport.clientWidth / 2) / Math.max(viewport.clientWidth, fit.width * zoom),
      y: (viewport.scrollTop + viewport.clientHeight / 2) / Math.max(viewport.clientHeight, fit.height * zoom),
    };
    if (nextZoom <= 1 || nextZoom >= 4) viewport?.focus({ preventScroll: true });
    setZoom(Math.min(4, Math.max(1, nextZoom)));
  };
  const endDrag = (event) => {
    if (viewportRef.current?.hasPointerCapture?.(event.pointerId)) viewportRef.current.releasePointerCapture(event.pointerId);
    dragRef.current = null;
    setDragging(false);
  };
  const handleKeys = (event) => {
    if (event.shiftKey && zoom > 1 && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
      event.preventDefault();
      const viewport = viewportRef.current;
      if (!viewport) return;
      if (event.key === "ArrowLeft") viewport.scrollLeft -= 80;
      if (event.key === "ArrowRight") viewport.scrollLeft += 80;
      if (event.key === "ArrowUp") viewport.scrollTop -= 80;
      if (event.key === "ArrowDown") viewport.scrollTop += 80;
    } else if (images.length > 1 && ["ArrowLeft", "ArrowRight"].includes(event.key)) {
      event.preventDefault();
      onMove(event.key === "ArrowLeft" ? -1 : 1);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth={false} fullWidth fullScreen
      transitionDuration={reducedMotion ? 0 : undefined} TransitionProps={{ onEntered: measure }}
      aria-labelledby="gallery-title" className="productDialog productDialog--gallery" onKeyDown={handleKeys}>
      <h2 id="gallery-title" className="product__sr-only">{title}</h2>
      <button type="button" className="productDialog__close productDialog__gallery-close" onClick={onClose} aria-label="Close product gallery"><CloseIcon /></button>
      <div className="productDialog__photo">
        <div ref={viewportRef} className={`productDialog__viewport ${zoom > 1 ? "productDialog__viewport--zoomed" : ""} ${dragging ? "productDialog__viewport--dragging" : ""}`}
          role="region" aria-label="Product image" aria-describedby="gallery-instructions" tabIndex={0}
          style={{ touchAction: zoom > 1 ? "pan-x pan-y" : "pan-y" }}
          onTouchStart={zoom === 1 ? onTouchStart : undefined} onTouchEnd={zoom === 1 ? onTouchEnd : undefined}
          onPointerDown={(event) => {
            if (zoom <= 1 || event.pointerType !== "mouse" || event.button !== 0) return;
            event.preventDefault();
            dragRef.current = { x: event.clientX, y: event.clientY, left: event.currentTarget.scrollLeft, top: event.currentTarget.scrollTop };
            event.currentTarget.setPointerCapture?.(event.pointerId);
            setDragging(true);
          }}
          onPointerMove={(event) => {
            const drag = dragRef.current;
            if (!drag) return;
            event.currentTarget.scrollLeft = drag.left + drag.x - event.clientX;
            event.currentTarget.scrollTop = drag.top + drag.y - event.clientY;
          }}
          onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={() => { dragRef.current = null; setDragging(false); }}>
          <div className="productDialog__canvas" style={fit ? { width: fit.width * zoom, height: fit.height * zoom } : undefined}>
            <img key={images[imageIndex]} ref={imageRef} src={images[imageIndex]} alt={`${title}, enlarged view ${imageIndex + 1}`} draggable={false}
              onLoad={measure} style={fit ? { width: fit.width * zoom, height: fit.height * zoom } : undefined} />
          </div>
        </div>
        {images.length > 1 && <><button type="button" className="productDialog__prev" onClick={() => onMove(-1)} aria-label="Previous enlarged image"><ChevronLeftIcon /></button><button type="button" className="productDialog__next" onClick={() => onMove(1)} aria-label="Next enlarged image"><ChevronRightIcon /></button></>}
      </div>
      <div className="productDialog__toolbar" role="group" aria-label="Image zoom controls">
        <button type="button" onClick={() => changeZoom(1)} disabled={zoom === 1} aria-label="Fit image to screen">Fit</button>
        <button type="button" onClick={() => changeZoom(zoom - 0.5)} disabled={zoom <= 1} aria-label="Zoom out">−</button>
        <output aria-label="Image zoom" aria-live="polite">{Math.round(zoom * 100)}%</output>
        <button type="button" onClick={() => changeZoom(zoom + 0.5)} disabled={zoom >= 4} aria-label="Zoom in">+</button>
        <span className="productDialog__counter" aria-live="polite"><span className="product__sr-only">Image </span>{imageIndex + 1} / {images.length}</span>
      </div>
      <p id="gallery-instructions" className="product__sr-only">{zoom > 1 ? "Drag or scroll to explore. Shift + arrows pan. Use Fit to see the whole photo." : "The whole photo fits on screen. Swipe or use arrow keys to change photo. Use Zoom in to inspect details."}</p>
    </Dialog>
  );
};
const Product = () => {
  const { id } = useParams();
  const { state: navigationState } = useLocation();
  const entryImage = navigationState?.productImageTransition?.id === String(id) ? navigationState.productImageTransition.src : null;
  const dispatch = useDispatch();
  const wishlist = useSelector((state) => state.wishlist.products);
  const { data, loading, error, refetch } = useFetch(`/product/${encodeURIComponent(id)}`);
  const product = useMemo(() => data && !Array.isArray(data) && data.id != null ? getProductDisplay(data) : null, [data]);
  const variants = useMemo(() => getProductVariants(product || {}), [product]);
  const images = useMemo(() => product ? [...new Set([product.img, product.img2, ...(Array.isArray(product.images) ? product.images : [])].filter((src) => typeof src === "string" && src.trim()))] : [], [product]);
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [activeAccordion, setActiveAccordion] = useState("description");
  const [guideOpen, setGuideOpen] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);
  const purchaseRef = useRef(null);
  const touchStart = useRef(null);
  const isInWishlist = wishlist.some((item) => String(item.id) === String(product?.id));
  const hasSizes = variants.sizes.length > 0;
  const hasColors = variants.colors.length > 0;
  const selectionsComplete = (!hasSizes || variants.sizes.includes(size)) && (!hasColors || variants.colors.includes(color));
  const missingOptions = [hasColors && !variants.colors.includes(color) && "a color", hasSizes && !variants.sizes.includes(size) && "a size"].filter(Boolean);
  const selectionHint = missingOptions.length ? `Select ${missingOptions.join(" and ")} to add this item.` : "";
  const selectedVariantCaption = [size, color].filter(Boolean).join(" · ");

  useEffect(() => {
    setQuantity(1);
    setActiveAccordion("description");
    setGuideOpen(false);
    setZoomOpen(false);
    setStickyVisible(false);
  }, [id]);

  useEffect(() => {
    const preferred = entryImage ? images.indexOf(entryImage) : -1;
    setImageIndex(preferred >= 0 ? preferred : 0);
  }, [images, entryImage]);

  useEffect(() => {
    setSize("");
    setColor("");
  }, [variants]);

  useEffect(() => {
    const purchase = purchaseRef.current;
    if (!purchase) return undefined;
    const mobileQuery = window.matchMedia?.("(max-width: 820px)");
    let frame = null;
    const measure = () => {
      frame = null;
      if (!(mobileQuery ? mobileQuery.matches : window.innerWidth <= 820)) {
        setStickyVisible(false);
        return;
      }
      const headerBottom = Math.max(0, document.querySelector(".navbar")?.getBoundingClientRect().bottom || 0);
      setStickyVisible(purchase.getBoundingClientRect().bottom <= headerBottom);
    };
    const scheduleMeasure = () => {
      if (frame === null) frame = requestAnimationFrame(measure);
    };
    // A direct jump can skip both IntersectionObserver thresholds entirely.
    window.addEventListener("scroll", scheduleMeasure, { passive: true });
    window.addEventListener("resize", scheduleMeasure, { passive: true });
    scheduleMeasure();
    return () => {
      window.removeEventListener("scroll", scheduleMeasure);
      window.removeEventListener("resize", scheduleMeasure);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [product, loading, error]);

  const moveImage = (direction) => setImageIndex((current) => (current + direction + images.length) % images.length);
  const onTouchStart = (event) => { touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; };
  const onTouchEnd = (event) => {
    if (!touchStart.current || !event.changedTouches.length || images.length < 2) return;
    const dx = event.changedTouches[0].clientX - touchStart.current.x;
    const dy = event.changedTouches[0].clientY - touchStart.current.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) moveImage(dx < 0 ? 1 : -1);
    touchStart.current = null;
  };
  const handleAdd = () => {
    if (!product || !selectionsComplete) return;
    dispatch(addToCart({ id: product.id, title: product.title, desc: product.desc, price: product.price, img: product.img, quantity, size, color }));
    dispatch(handleCart(true));
  };
  const handleWishlist = () => product && dispatch(toggleWishlist({ ...product }));
  const toggleAccordion = (name) => setActiveAccordion((current) => current === name ? null : name);
  const notFound = error?.status === 404 || error?.response?.status === 404 || (!loading && !error && !product);
  const catalogLink = <Link className="product__back" to="/products/1">Explore the collection</Link>;

  if (loading) return <ProductDetailSkeleton />;
  if (notFound) return <main className="product product--state"><AsyncState title="Product not found" message="This item may have moved. Find your next favourite in the collection." action={catalogLink} /></main>;
  if (error) return <main className="product product--state"><AsyncState title="We couldn't load this product" message="Check your connection and give it another try." onRetry={refetch} action={catalogLink} /></main>;

  return (
    <main className="product">
      <div className="product__container">
        <section className={`product__gallery ${images.length < 2 ? "product__gallery--single" : ""}`} aria-label="Product gallery">
          {images.length > 1 && <div className="product__thumbnails">
            {images.map((src, index) => <button key={src} type="button"
              className={`product__thumbnail ${index === imageIndex ? "product__thumbnail--active" : ""}`}
              aria-label={`Show product image ${index + 1}`} aria-pressed={index === imageIndex} onClick={() => setImageIndex(index)}>
              <img src={src} alt="" loading={index ? "lazy" : "eager"} />
            </button>)}
          </div>}
          <div className="product__main-image" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} onTouchCancel={() => { touchStart.current = null; }}>
            {product.isNew && <span className="product__badge">New</span>}
            {images.length ? <button type="button" className="product__zoom-trigger" onClick={() => setZoomOpen(true)} aria-label={`Enlarge ${product.title} image`}>
              <img key={images[imageIndex]} src={images[imageIndex]} data-product-image={String(product.id)} alt={`${product.title}, view ${imageIndex + 1}`} fetchpriority="high" />
              <span className="product__zoom-label"><ZoomInIcon /> Enlarge photo</span>
            </button> : <div className="product__image-empty">No product photos available</div>}
            {images.length > 1 && <div className="product__gallery-controls">
              <button type="button" onClick={() => moveImage(-1)} aria-label="Previous product image"><ChevronLeftIcon /></button>
              <span aria-live="polite" aria-atomic="true">{imageIndex + 1} / {images.length}</span>
              <button type="button" onClick={() => moveImage(1)} aria-label="Next product image"><ChevronRightIcon /></button>
            </div>}
          </div>
        </section>

        <section className="product__details" aria-labelledby="product-title">
          <div className="product__heading">
            {product.sub_category && <span className="product__category">{product.sub_category}</span>}
            <h1 id="product-title">{product.title}</h1>
          </div>
          <div className="product__buy-panel">
            <div className="product__price">
              <span>{formatProductPrice(product.price)}</span>
              {product.previousPrice && <del>{formatProductPrice(product.previousPrice)}</del>}
              <small>USD</small>
            </div>
            {(hasSizes || hasColors) && <div className="product__variants">
              {hasColors && <fieldset><legend>Color {color && <span>· {color}</span>}</legend>
                <div className="product__options">{variants.colors.map((option) => <button key={option} type="button"
                  className={`product__option ${color === option ? "product__option--selected" : ""}`} aria-pressed={color === option} onClick={() => setColor(option)}>{option}</button>)}</div>
              </fieldset>}
              {hasSizes && <fieldset><legend>Size {size && <span>· {size}</span>}</legend>
                <div className="product__options">{variants.sizes.map((option) => <button key={option} type="button"
                  className={`product__option product__option--size ${size === option ? "product__option--selected" : ""}`} aria-pressed={size === option} onClick={() => setSize(option)}>{option}</button>)}</div>
              </fieldset>}
            </div>}
            <div className="product__purchase" ref={purchaseRef}>
              <div className="product__quantity-wrapper"><span className="product__label">Quantity</span><QuantityControl value={quantity} onChange={setQuantity} /></div>
              <button type="button" className="product__add" disabled={!selectionsComplete} aria-describedby={selectionHint ? "product-selection-hint" : undefined} onClick={handleAdd}><AddShoppingCartIcon />Add to cart</button>
            </div>
            {selectionHint && <p id="product-selection-hint" className="product__selection-hint" role="status">{selectionHint}</p>}
            <div className="product__actions">
              <button type="button" className={`product__wishlist ${isInWishlist ? "product__wishlist--active" : ""}`} aria-pressed={isInWishlist} onClick={handleWishlist}>
                {isInWishlist ? <FavoriteIcon /> : <FavoriteBorderIcon />}{isInWishlist ? "Saved to wishlist" : "Add to wishlist"}
              </button>
              {hasSizes && <button type="button" onClick={() => setGuideOpen(true)} aria-haspopup="dialog"><StraightenIcon />Size guide</button>}
            </div>
          </div>
          <div className="product__accordions">
            <Accordion name="description" title="Description" active={activeAccordion === "description"} onToggle={() => toggleAccordion("description")}><p>{product.desc}</p></Accordion>
            <Accordion name="information" title="Details & fit" active={activeAccordion === "information"} onToggle={() => toggleAccordion("information")}>
              <div className="product__specifications">{size && <div><span>Selected size</span><strong>{size}</strong></div>}{color && <div><span>Selected color</span><strong>{color}</strong></div>}{product.vendor && <div><span>Brand</span><strong>{product.vendor}</strong></div>}{product.sub_category && <div><span>Product type</span><strong>{product.sub_category}</strong></div>}{product.type && <div><span>Collection</span><strong>{product.type}</strong></div>}<div><span>Product ID</span><strong>{String(product.id)}</strong></div></div>
            </Accordion>
            <Accordion name="faq" title="Shopping with M-store" active={activeAccordion === "faq"} onToggle={() => toggleAccordion("faq")}>
              <div className="product__faq"><div><strong>Can I try the full purchase flow?</strong><p>Yes. Add this item, edit your bag and complete a demo order. No payment is taken.</p></div><div><strong>Will my selections be saved?</strong><p>Your bag and wishlist stay on this device when you return.</p></div></div>
            </Accordion>
          </div>
        </section>
      </div>
      <RelatedProducts category={product.category} currentProductId={product.id} />
      <RecentlyViewed product={data} currentProductId={id} />
      {stickyVisible && <div className="product__mobile-buy"><div><strong>{formatProductPrice(product.price)}</strong>{selectedVariantCaption && <span>{selectedVariantCaption}</span>}</div><button type="button" className="product__add" onClick={handleAdd} disabled={!selectionsComplete} aria-describedby={selectionHint ? "product-selection-hint" : undefined}><AddShoppingCartIcon />Add to cart</button></div>}

      <Dialog open={guideOpen && hasSizes} onClose={() => setGuideOpen(false)} maxWidth="sm" fullWidth aria-labelledby="size-guide-title" className="productDialog">
        <div className="productDialog__heading"><h2 id="size-guide-title">Find your fit</h2><button type="button" className="productDialog__close" onClick={() => setGuideOpen(false)} aria-label="Close size guide"><CloseIcon /></button></div>
        <div className="productDialog__body"><SizeGuide variants={variants} /></div>
      </Dialog>
      <EnlargedGallery open={zoomOpen} onClose={() => setZoomOpen(false)} images={images} imageIndex={imageIndex}
        title={product.title} onMove={moveImage} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} />
    </main>
  );
};

export default Product;