import React, { useEffect, useMemo, useState } from "react";
import Card from "../Card/Card";
import { readRecentlyViewed, recordRecentlyViewed, RECENTLY_VIEWED_KEY } from "../../helpers/recentlyViewed";
import "./RecentlyViewed.scss";

const RecentlyViewed = ({ product, currentProductId }) => {
  const [history, setHistory] = useState(readRecentlyViewed);
  const products = useMemo(() => history.filter((item) => String(item.id) !== String(currentProductId)).slice(0, 4), [history, currentProductId]);

  useEffect(() => {
    if (product?.id != null && String(product.id) === String(currentProductId)) {
      setHistory(recordRecentlyViewed(product));
    }
  }, [product, currentProductId]);

  useEffect(() => {
    const syncHistory = (event) => {
      if (event.key === RECENTLY_VIEWED_KEY || event.key === null) setHistory(readRecentlyViewed());
    };
    window.addEventListener("storage", syncHistory);
    return () => window.removeEventListener("storage", syncHistory);
  }, []);

  if (!products.length) return null;
  return (
    <section className="recentlyViewed" aria-labelledby="recently-viewed-title">
      <h2 id="recently-viewed-title">Recently viewed</h2>
      <div className="recentlyViewed__grid">
        {products.map((item) => <Card key={item.id} item={item} />)}
      </div>
    </section>
  );
};

export default RecentlyViewed;
