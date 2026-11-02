import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import Slider from "./Slider";

const mockMotion = (reduced) => {
  window.matchMedia = jest.fn().mockImplementation((query) => ({
    matches: reduced && query.includes("prefers-reduced-motion"),
    media: query,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
};

beforeEach(() => {
  jest.useFakeTimers();
  mockMotion(false);
});

afterEach(() => {
  jest.useRealTimers();
});

it("rotates automatically, pauses on keyboard focus, and excludes hidden slide links from tab order", () => {
  render(<MemoryRouter><Slider /></MemoryRouter>);
  expect(screen.getByText("Shop women").closest("a")).toHaveAttribute("tabindex", "0");
  expect(screen.getByText("Shop men").closest("a")).toHaveAttribute("tabindex", "-1");

  act(() => { jest.advanceTimersByTime(6500); });
  expect(screen.getByText("Shop men").closest("a")).toHaveAttribute("tabindex", "0");

  fireEvent.focus(screen.getByRole("button", { name: "Next slide" }));
  act(() => { jest.advanceTimersByTime(13000); });
  expect(screen.getByText("Shop men").closest("a")).toHaveAttribute("tabindex", "0");
  expect(screen.queryByRole("button", { name: /slideshow/ })).not.toBeInTheDocument();

  fireEvent.keyDown(screen.getByRole("button", { name: "Next slide" }), { key: "ArrowRight" });
  expect(screen.getByText("Shop children").closest("a")).toHaveAttribute("tabindex", "0");
  fireEvent.blur(screen.getByRole("button", { name: "Next slide" }), { relatedTarget: document.body });
  act(() => { jest.advanceTimersByTime(6500); });
  expect(screen.getByText("Shop women").closest("a")).toHaveAttribute("tabindex", "0");
});

it("keeps reduced-motion users in control without autoplay", () => {
  mockMotion(true);
  render(<MemoryRouter><Slider /></MemoryRouter>);
  act(() => { jest.advanceTimersByTime(20000); });
  expect(screen.getByText("Shop women").closest("a")).toHaveAttribute("tabindex", "0");
  expect(screen.queryByRole("button", { name: /slideshow/ })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Next slide" }));
  expect(screen.getByText("Shop men").closest("a")).toHaveAttribute("tabindex", "0");
});
