export const DEMO_DETAILS = {
  email: "demo@example.com",
  cardNumber: "4242 4242 4242 4242",
  expiry: "12 / 30",
  cvc: "123",
  cardName: "Alex Morgan",
  country: "AZ",
};

const isValidCard = (value) => {
  const digits = value.replace(/\s/g, "");
  if (!/^\d{13,19}$/.test(digits)) return false;
  let sum = 0;
  let double = false;
  for (let index = digits.length - 1; index >= 0; index--) {
    let digit = Number(digits[index]);
    if (double) { digit *= 2; if (digit > 9) digit -= 9; }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
};

export const validateCheckout = (values, now = new Date()) => {
  const errors = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = "Enter a valid email address.";
  if (!isValidCard(values.cardNumber)) errors.cardNumber = "Enter a valid test card number.";
  const expiry = values.expiry.match(/^\s*(\d{2})\s*\/\s*(\d{2})\s*$/);
  if (!expiry) errors.expiry = "Use MM / YY.";
  else {
    const month = Number(expiry[1]);
    const year = 2000 + Number(expiry[2]);
    if (month < 1 || month > 12 || year < now.getFullYear() ||
        (year === now.getFullYear() && month < now.getMonth() + 1)) {
      errors.expiry = "Enter a future expiry date.";
    }
  }
  if (!/^\d{3,4}$/.test(values.cvc)) errors.cvc = "Enter 3 or 4 digits.";
  if (values.cardName.trim().length < 2) errors.cardName = "Enter the name on the test card.";
  if (!["AZ", "CY", "TR", "GB", "US"].includes(values.country)) errors.country = "Select a billing country.";
  return errors;
};

export const formatCardNumber = (value) =>
  value.replace(/\D/g, "").slice(0, 19).replace(/(.{4})/g, "$1 ").trim();

export const formatExpiry = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? digits.slice(0, 2) + " / " + digits.slice(2) : digits;
};
