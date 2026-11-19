import React, { useState } from "react";
import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import GlobalSearch from "./GlobalSearch";

const products = [
  { id: "11", title: "Linen shirt", sub_category: "tops", vendor: "Studio", category: "1", price: 45, img: "/linen-shirt.jpg" },
  { id: "22", title: "Linen jacket", sub_category: "outerwear", brand: "North", category: "2", price: 75, img: "/linen-jacket.jpg" },
  { id: "33", title: "Kids trainer", sub_category: "shoes", vendor: "Studio", category: "3", price: 35, img: "/kids-trainer.jpg" },
];
const initialLocation = "/products/1?sub=tops";
const originalMatchMedia = window.matchMedia;

const SearchHarness = ({ onClose, ...props }) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  return <>
    <button type="button" onClick={() => setOpen(true)}>Open product search</button>
    <output data-testid="search-location">{location.pathname}{location.search}</output>
    <GlobalSearch {...props} open={open} onClose={() => { onClose(); setOpen(false); }} />
  </>;
};

const setup = (props = {}) => {
  const onClose = jest.fn();
  const onRetry = jest.fn();
  const tree = (changes = {}) => <MemoryRouter initialEntries={[initialLocation]}>
    <SearchHarness products={products} loading={false} error={null} onRetry={onRetry} {...props} {...changes} onClose={onClose} />
  </MemoryRouter>;
  const view = render(tree());
  return { onClose, onRetry, rerenderSearch: (changes) => view.rerender(tree(changes)) };
};

const openSearch = async () => {
  const trigger = screen.getByRole("button", { name: "Open product search" });
  trigger.focus();
  fireEvent.click(trigger);
  const dialog = await screen.findByRole("dialog");
  const input = within(dialog).getByRole("searchbox", { name: "Search products" });
  return { dialog, input, trigger };
};

beforeEach(() => {
  window.matchMedia = jest.fn((query) => ({
    matches: query === "(prefers-reduced-motion: reduce)",
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
});

afterEach(() => {
  window.matchMedia = originalMatchMedia;
});

test("searches across catalog categories and API fields, reports no matches, and clears the query", async () => {
  setup();
  const { dialog, input } = await openSearch();
  fireEvent.change(input, { target: { value: "linen" } });
  let results = await within(dialog).findByRole("list", { name: "Search results" });
  expect(within(results).getByRole("link", { name: /Linen shirt/ })).toBeInTheDocument();
  expect(within(results).getByRole("link", { name: /Linen jacket/ })).toBeInTheDocument();
  expect(within(results).queryByRole("link", { name: /Kids trainer/ })).not.toBeInTheDocument();

  fireEvent.change(input, { target: { value: "studio shoes" } });
  results = await within(dialog).findByRole("list", { name: "Search results" });
  await waitFor(() => expect(within(results).getAllByRole("link")).toHaveLength(1));
  expect(within(results).getByRole("link", { name: /Kids trainer/ })).toBeInTheDocument();
  expect(screen.getByTestId("search-location")).toHaveTextContent(initialLocation);

  fireEvent.change(input, { target: { value: "unmatched product" } });
  await waitFor(() => expect(within(dialog).queryByRole("list", { name: "Search results" })).not.toBeInTheDocument());
  expect(within(dialog).getByRole("status")).toHaveTextContent("0 results");
  fireEvent.click(within(dialog).getByRole("button", { name: "Clear search" }));
  expect(input).toHaveValue("");
  expect(input).toHaveFocus();
  expect(within(dialog).queryByRole("list", { name: "Search results" })).not.toBeInTheDocument();
});

test("shows loading without stale results and recovers from a retryable error without losing the query", async () => {
  const { onRetry, rerenderSearch } = setup({ loading: true });
  const { dialog, input } = await openSearch();
  fireEvent.change(input, { target: { value: "linen" } });
  expect(within(dialog).getByText(/loading/i)).toBeInTheDocument();
  expect(within(dialog).queryByRole("list", { name: "Search results" })).not.toBeInTheDocument();

  rerenderSearch({ loading: false, error: new Error("Connection unavailable") });
  fireEvent.click(within(dialog).getByRole("button", { name: "Retry", exact: true }));
  expect(onRetry).toHaveBeenCalledTimes(1);
  expect(input).toHaveValue("linen");
  expect(within(dialog).queryByRole("list", { name: "Search results" })).not.toBeInTheDocument();

  rerenderSearch({ loading: false, error: null });
  const results = await within(dialog).findByRole("list", { name: "Search results" });
  expect(within(results).getAllByRole("link")).toHaveLength(2);
  expect(input).toHaveValue("linen");
  expect(within(dialog).queryByRole("button", { name: "Retry", exact: true })).not.toBeInTheDocument();
});

test("a result navigates to the exact product and closes search", async () => {
  const { onClose } = setup();
  const { dialog, input } = await openSearch();
  fireEvent.change(input, { target: { value: "trainer" } });
  const result = await within(dialog).findByRole("link", { name: /Kids trainer/ });
  expect(result).toHaveAttribute("href", "/product/33");
  fireEvent.click(result);
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(screen.getByTestId("search-location")).toHaveTextContent("/product/33");
  expect(onClose).toHaveBeenCalledTimes(1);
});

test("Arrow keys move between the search field and real result links, with Home and End reaching the bounds", async () => {
  setup();
  const { dialog, input } = await openSearch();
  fireEvent.change(input, { target: { value: "linen" } });
  const results = await within(dialog).findByRole("list", { name: "Search results" });
  const links = within(results).getAllByRole("link");
  input.focus();
  fireEvent.keyDown(input, { key: "ArrowDown" });
  expect(links[0]).toHaveFocus();
  fireEvent.keyDown(links[0], { key: "ArrowDown" });
  expect(links[1]).toHaveFocus();
  fireEvent.keyDown(links[1], { key: "ArrowUp" });
  expect(links[0]).toHaveFocus();
  fireEvent.keyDown(links[0], { key: "ArrowUp" });
  expect(input).toHaveFocus();
  fireEvent.keyDown(input, { key: "ArrowUp" });
  expect(links[1]).toHaveFocus();
  fireEvent.keyDown(links[1], { key: "Home" });
  expect(links[0]).toHaveFocus();
  fireEvent.keyDown(links[0], { key: "End" });
  expect(links[1]).toHaveFocus();
  fireEvent.keyDown(links[1], { key: "ArrowDown" });
  expect(input).toHaveFocus();
});

test("Escape returns focus to the search trigger and reopening starts with an empty focused input", async () => {
  const { onClose } = setup();
  let { dialog, input, trigger } = await openSearch();
  await waitFor(() => expect(input).toHaveFocus());
  fireEvent.change(input, { target: { value: "linen" } });
  const result = await within(dialog).findByRole("link", { name: /Linen shirt/ });
  result.focus();
  fireEvent.keyDown(result, { key: "Escape", code: "Escape" });
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(trigger).toHaveFocus();
  expect(onClose).toHaveBeenCalledTimes(1);
  expect(screen.getByTestId("search-location")).toHaveTextContent(initialLocation);

  ({ dialog, input } = await openSearch());
  expect(input).toHaveValue("");
  await waitFor(() => expect(input).toHaveFocus());
  expect(within(dialog).queryByRole("list", { name: "Search results" })).not.toBeInTheDocument();
});

test("returns fallback dialog focus to the search input while preserving intentional result focus", async () => {
  setup();
  const { dialog, input } = await openSearch();
  await waitFor(() => expect(input).toHaveFocus());
  const container = dialog.closest(".MuiDialog-container");
  container.focus();
  expect(input).toHaveFocus();
  fireEvent.change(input, { target: { value: "linen" } });
  const link = await within(dialog).findByRole("link", { name: /Linen shirt/ });
  link.focus();
  expect(link).toHaveFocus();
});
