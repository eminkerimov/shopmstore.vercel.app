import { DEMO_DETAILS, formatCardNumber, formatExpiry, validateCheckout } from "./checkout";

const now = new Date(2026, 9, 22);

test("sample details complete the demo form", () => {
  expect(validateCheckout(DEMO_DETAILS, now)).toEqual({});
});

test("all missing fields receive useful errors", () => {
  expect(Object.keys(validateCheckout({ email: "", cardNumber: "", expiry: "", cvc: "", cardName: "", country: "" }, now)))
    .toEqual(["email", "cardNumber", "expiry", "cvc", "cardName", "country"]);
});

test("invalid card checksums are rejected", () => {
  expect(validateCheckout({ ...DEMO_DETAILS, cardNumber: "4242 4242 4242 4241" }, now).cardNumber).toBeTruthy();
});

test("expiry respects the current month boundary", () => {
  expect(validateCheckout({ ...DEMO_DETAILS, expiry: "10 / 26" }, now).expiry).toBeUndefined();
  expect(validateCheckout({ ...DEMO_DETAILS, expiry: "09 / 26" }, now).expiry).toBeTruthy();
  expect(validateCheckout({ ...DEMO_DETAILS, expiry: "13 / 30" }, now).expiry).toBeTruthy();
});

test("test card formatting removes non-digits and bounds input length", () => {
  expect(formatCardNumber("4242abc424242424242")).toBe("4242 4242 4242 4242");
  expect(formatExpiry("1230")).toBe("12 / 30");
});

test("unsupported country, malformed email and short cvc are invalid", () => {
  const errors = validateCheckout({ ...DEMO_DETAILS, email: "name@", cvc: "1", country: "XX" }, now);
  expect(Object.keys(errors)).toEqual(["email", "cvc", "country"]);
});
