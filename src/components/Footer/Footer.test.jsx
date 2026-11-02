import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import Footer from "./Footer";

it("validates the email and confirms a local demo subscription", () => {
  render(<MemoryRouter><Footer /></MemoryRouter>);
  const email = screen.getByRole("textbox", { name: "Email address" });
  const submit = screen.getByRole("button", { name: "Subscribe" });
  fireEvent.click(submit);
  expect(email).toHaveAttribute("aria-invalid", "true");
  expect(email).toHaveFocus();
  expect(screen.getByText(/Enter a valid email address/)).toBeInTheDocument();

  fireEvent.change(email, { target: { value: "viewer@example.com" } });
  fireEvent.click(submit);
  expect(email).toHaveAttribute("aria-invalid", "false");
  expect(screen.getByText("You're on the demo list. No email was sent.")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Subscribed" })).toBeDisabled();

  fireEvent.change(email, { target: { value: "another@example.com" } });
  expect(screen.getByRole("button", { name: "Subscribe" })).toBeEnabled();
});
