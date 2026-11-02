import React from "react";
import { MAX_QUANTITY } from "../../helpers/cart";
import "./QuantityControl.scss";

const QuantityControl = ({ value, onChange, label = "Quantity" }) => (
  <div className="quantityControl" role="group" aria-label={label}>
    <button type="button" aria-label={"Decrease " + label.toLowerCase()}
      disabled={value <= 1} onClick={() => onChange(value - 1)}>−</button>
    <output aria-live="polite" aria-atomic="true">{value}</output>
    <button type="button" aria-label={"Increase " + label.toLowerCase()}
      disabled={value >= MAX_QUANTITY} onClick={() => onChange(value + 1)}>+</button>
  </div>
);

export default QuantityControl;
