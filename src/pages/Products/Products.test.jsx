import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Link, MemoryRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Categories from "../../components/Categories/Categories";
import Products from "./Products";
import useFetch from "../../custom/useFetch";

jest.mock("../../custom/useFetch", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("../../components/List/List", () => ({ products }) => (
  <div data-testid="matching-products">{products.map((item) => item.title).join(", ")}</div>
));

const items = [
  { id: 1, title: "Linen shirt", sub_category: "shirts", category: 1, price: 90, previousPrice: 120, isNew: true },
  { id: 2, title: "Cotton shirt", sub_category: "shirts", category: 1, price: 40, isNew: false },
  { id: 3, title: "Linen shoes", sub_category: "shoes", category: 2, price: 80, isNew: "true" },
  { id: 4, title: "Everyday shoes", sub_category: "shoes", category: 3, price: 120, isNew: false },
  { id: 5, title: "Leather bag", sub_category: "accessories", category: 2, price: 70, compareAtPrice: 100 },
];

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  return <>
    <output data-testid="location">{location.pathname + location.search}</output>
    <Link to="/products/2">Open men</Link>
    <button onClick={() => navigate(-1)}>Go back</button>
  </>;
};

beforeEach(() => {
  useFetch.mockClear();
  useFetch.mockImplementation((url) => ({
    data: !url ? null : url.startsWith("/category/") ? { subCategories: ["shirts", "shoes"] }
      : url === "/product" ? items
      : items.filter((item) => String(item.category) === new URLSearchParams(url.split("?")[1]).get("category")),
    loading: false,
    error: null,
    refetch: jest.fn(),
  }));
});

const renderCatalog = (url) => render(
  <MemoryRouter initialEntries={[url]}>
    <Routes><Route path="/products/:id" element={<><Navigation /><Products /></>} /></Routes>
  </MemoryRouter>
);

test("category navigation and Back restore search, filters and sort from the URL", () => {
  renderCatalog("/products/1?q=linen&sub=shirts&max=100&sort=desc");
  expect(screen.getByLabelText("Search this collection").value).toBe("linen");
  expect(screen.getByRole("checkbox", { name: "shirts" }).checked).toBe(true);
  expect(screen.getByLabelText("Sort by price").value).toBe("desc");
  expect(screen.getByTestId("matching-products").textContent).toBe("Linen shirt");

  fireEvent.click(screen.getByText("Open men"));
  expect(screen.getByLabelText("Search this collection").value).toBe("");
  expect(screen.getByRole("checkbox", { name: "shirts" }).checked).toBe(false);
  expect(screen.getByLabelText("Sort by price").value).toBe("asc");

  fireEvent.click(screen.getByText("Go back"));
  expect(screen.getByLabelText("Search this collection").value).toBe("linen");
  expect(screen.getByRole("checkbox", { name: "shirts" }).checked).toBe(true);
  expect(screen.getByLabelText("Maximum price").value).toBe("100");
  expect(screen.getByLabelText("Sort by price").value).toBe("desc");
  expect(screen.getByTestId("matching-products").textContent).toBe("Linen shirt");
});

test("typing and clearing search update the shareable URL and visible results", () => {
  renderCatalog("/products/1");
  fireEvent.change(screen.getByLabelText("Search this collection"), { target: { value: "cotton" } });
  expect(screen.getByTestId("location").textContent).toContain("q=cotton");
  expect(screen.getByTestId("matching-products").textContent).toBe("Cotton shirt");
  fireEvent.click(screen.getByLabelText("Clear search"));
  expect(screen.getByTestId("location").textContent).toBe("/products/1");
  expect(screen.getByTestId("matching-products").textContent).toContain("Linen shirt");
});

test("unknown categories do not construct a MockAPI request", () => {
  renderCatalog("/products/1abc");
  expect(screen.getByText("Collection not found")).toBeTruthy();
  expect(useFetch.mock.calls.every(([url]) => url === null)).toBe(true);
});

test.each([
  ["sale", "/products/all?collection=sale", "Sale", "Leather bag, Linen shirt"],
  ["new arrivals", "/products/all?collection=new", "New arrivals", "Linen shoes, Linen shirt"],
  ["shoes", "/products/all?sub=shoes", "Shoes", "Linen shoes, Everyday shoes"],
  ["accessories", "/products/all?sub=accessories", "Accessories", "Leather bag"],
])("the %s home tile opens the matching all-product selection", (tile, url, title, matchingProducts) => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<Categories />} />
        <Route path="/products/:id" element={<><Navigation /><Products /></>} />
      </Routes>
    </MemoryRouter>
  );
  const link = screen.getByRole("link", { name: "Explore " + tile });
  expect(link.getAttribute("href")).toBe(url);
  fireEvent.click(link);
  expect(screen.getByTestId("location").textContent).toBe(url);
  expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(title);
  expect(screen.getByTestId("matching-products").textContent).toBe(matchingProducts);
  expect(useFetch.mock.calls.some(([request]) => request === "/product")).toBe(true);
  expect(useFetch.mock.calls.some(([request]) => request?.startsWith("/category/"))).toBe(false);
});

test("all-product filters derive from the API and a removed collection restores through Back", () => {
  renderCatalog("/products/all?collection=new&sub=shoes&sort=desc");
  expect(screen.getByRole("checkbox", { name: "accessories" })).toBeTruthy();
  expect(screen.getByRole("checkbox", { name: "shirts" })).toBeTruthy();
  expect(screen.getByRole("checkbox", { name: "shoes" }).checked).toBe(true);
  expect(screen.getByTestId("matching-products").textContent).toBe("Linen shoes");

  fireEvent.click(screen.getByLabelText("Remove New arrivals filter"));
  expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Shoes");
  expect(screen.getByTestId("matching-products").textContent).toBe("Everyday shoes, Linen shoes");

  fireEvent.click(screen.getByText("Go back"));
  expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("New arrivals");
  expect(screen.getByTestId("matching-products").textContent).toBe("Linen shoes");

  fireEvent.click(screen.getByText("Clear all"));
  expect(screen.getByTestId("location").textContent).toBe("/products/all?sort=desc");
  expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("All products");
  expect(screen.getByLabelText("Sort by price").value).toBe("desc");
});

test("sale remains empty when the API provides no reduced prices and can be cleared", () => {
  const fullPriceItems = items.map(({ previousPrice, oldPrice, compareAtPrice, ...item }) => item);
  useFetch.mockImplementation(() => ({ data: fullPriceItems, loading: false, error: null, refetch: jest.fn() }));
  renderCatalog("/products/all?collection=sale");
  expect(screen.getByTestId("matching-products").textContent).toBe("");
  expect(screen.getByText("0 products").getAttribute("role")).toBe("status");
  fireEvent.click(screen.getByLabelText("Remove Sale filter"));
  expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("All products");
  expect(screen.getByTestId("matching-products").textContent).toContain("Linen shirt");
});
