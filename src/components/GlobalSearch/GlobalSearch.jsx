import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import Dialog from "@mui/material/Dialog";
import useMediaQuery from "@mui/material/useMediaQuery";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import { Link } from "react-router-dom";
import { searchProducts } from "../../helpers/searchProducts";
import { formatProductPrice, getProductDisplay } from "../../helpers/product";
import "./GlobalSearch.scss";

const GlobalSearch = ({ open, onClose, products = [], loading = false, error, onRetry }) => {
  const fullscreen = useMediaQuery("(max-width: 600px)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const resultRefs = useRef([]);
  const searchQuery = query.trim();
  const matches = useMemo(() => searchProducts(products, query), [products, query]);
  const resultsVisible = Boolean(searchQuery && !loading && !error);

  useLayoutEffect(() => {
    if (open) setQuery("");
  }, [open]);

  const focusInput = () => inputRef.current?.focus();
  const handleDialogFocus = (event) => {
    // Route focus can arrive while a lazy page loads behind the dialog.
    const target = event.target;
    if (open && (target.classList?.contains("MuiDialog-container") || target.getAttribute?.("role") === "dialog")) focusInput();
  };
  const focusResult = (index) => {
    if (index < 0 || index >= matches.length) focusInput();
    else resultRefs.current[index]?.focus();
  };
  const handleInputKeyDown = (event) => {
    if (!resultsVisible || !matches.length || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      focusResult(event.key === "ArrowDown" ? 0 : matches.length - 1);
    }
  };
  const handleResultKeyDown = (event, index) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const targets = { ArrowDown: index + 1, ArrowUp: index - 1, Home: 0, End: matches.length - 1 };
    if (Object.prototype.hasOwnProperty.call(targets, event.key)) {
      event.preventDefault();
      focusResult(targets[event.key]);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} onFocus={handleDialogFocus} maxWidth={false} fullWidth fullScreen={fullscreen}
      className="globalSearch" PaperProps={{ className: "globalSearch__paper" }}
      aria-labelledby="global-search-title" transitionDuration={reducedMotion ? 0 : { enter: 180, exit: 140 }}
      TransitionProps={{ onEntered: focusInput }}>
      <header className="globalSearch__header">
        <div className="globalSearch__heading">
          <h2 id="global-search-title">Search</h2>
          <button type="button" className="globalSearch__close" onClick={onClose} aria-label="Close search"><CloseIcon /></button>
        </div>
        <div className="globalSearch__field">
          <SearchIcon aria-hidden="true" />
          <input ref={inputRef} className="globalSearch__input" type="search" aria-label="Search products"
            autoFocus autoComplete="off" placeholder="Search products" value={query}
            onChange={(event) => setQuery(event.target.value)} onKeyDown={handleInputKeyDown} />
          {query && <button type="button" className="globalSearch__clear" aria-label="Clear search"
            onClick={() => { setQuery(""); focusInput(); }}><CloseIcon /></button>}
        </div>
      </header>

      <div className="globalSearch__body" aria-busy={loading}>
        {loading ? <div className="globalSearch__state"><span className="globalSearch__spinner" aria-hidden="true" /><p role="status">Loading products…</p></div>
          : error ? <div className="globalSearch__state"><p role="alert">Products could not be loaded.</p><button type="button" className="globalSearch__retry" onClick={onRetry}>Retry</button></div>
            : !searchQuery ? <p className="globalSearch__prompt" role="status">Search by product name, brand or category.</p>
              : <>
                <p className="globalSearch__status" role="status">{matches.length} {matches.length === 1 ? "result" : "results"} for “{searchQuery}”</p>
                {matches.length ? <ul className="globalSearch__results" aria-label="Search results">
                  {matches.map((product, index) => {
                    const display = getProductDisplay(product);
                    const hasImage = typeof display.img === "string" && display.img.trim();
                    return <li key={display.id}>
                      <Link ref={(element) => { resultRefs.current[index] = element; }} className="globalSearch__result"
                        to={`/product/${encodeURIComponent(display.id)}`} onClick={onClose}
                        onKeyDown={(event) => handleResultKeyDown(event, index)}>
                        <div className="globalSearch__photo">{hasImage ? <img src={display.img} alt="" loading="lazy" decoding="async" /> : <ImageOutlinedIcon aria-hidden="true" />}</div>
                        <div className="globalSearch__copy"><span className="globalSearch__name">{display.title}</span>{display.sub_category && <span className="globalSearch__category">{display.sub_category}</span>}</div>
                        <div className="globalSearch__price"><strong>{formatProductPrice(display.price)}</strong>{display.previousPrice && <del aria-label="Original price">{formatProductPrice(display.previousPrice)}</del>}</div>
                      </Link>
                    </li>;
                  })}
                </ul> : <p className="globalSearch__noResults">No products found. Try a different name, brand or category.</p>}
              </>}
      </div>
    </Dialog>
  );
};

export default GlobalSearch;