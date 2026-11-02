import React from "react";
import "./AsyncState.scss";

const AsyncState = ({ title, message, onRetry, action }) => (
  <div className="asyncState" role={onRetry ? "alert" : "status"}>
    <span className="asyncState__mark" aria-hidden="true">M</span>
    <h2>{title}</h2>
    {message && <p>{message}</p>}
    {onRetry && <button type="button" onClick={onRetry}>Try again</button>}
    {action}
  </div>
);

export const ProductSkeleton = ({ count = 4 }) => (
  <>
    <span className="asyncState__sr" role="status">Loading products...</span>
    {Array.from({ length: count }, (_, index) => (
      <div className="productSkeleton" key={index} aria-hidden="true">
        <div className="productSkeleton__image skeletonPulse" />
        <div className="productSkeleton__line skeletonPulse" />
        <div className="productSkeleton__line productSkeleton__line--short skeletonPulse" />
      </div>
    ))}
  </>
);

export const ProductDetailSkeleton = () => (
  <main className="productDetailSkeleton" aria-busy="true">
    <span className="asyncState__sr" role="status">Loading product...</span>
    <div className="productDetailSkeleton__image skeletonPulse" aria-hidden="true" />
    <div className="productDetailSkeleton__content" aria-hidden="true">
      <div className="productSkeleton__line skeletonPulse" />
      <div className="productSkeleton__line productSkeleton__line--short skeletonPulse" />
      <div className="productDetailSkeleton__text skeletonPulse" />
      <div className="productDetailSkeleton__button skeletonPulse" />
    </div>
  </main>
);

export default AsyncState;
