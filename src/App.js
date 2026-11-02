import React, { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider, Outlet, Link } from "react-router-dom";
import Footer from "./components/Footer/Footer";
import Navbar from "./components/Navbar/Navbar";
import Mobil from "./components/Mobil/Mobil";
import CartUndo from "./components/CartUndo/CartUndo";
import AsyncState from "./components/AsyncState/AsyncState";
import ScrollToTop from "./helpers/ScrollToTop";
import Home from "./pages/Home/Home";
import "./app.scss";

const Product = lazy(() => import("./pages/Product/Product"));
const Products = lazy(() => import("./pages/Products/Products"));
const About = lazy(() => import("./pages/About/About"));
const CartPage = lazy(() => import("./pages/CartPage/CartPage"));
const Payment = lazy(() => import("./pages/Payment/Payment"));
const Wishlist = lazy(() => import("./pages/Wishlist/Wishlist"));
const OrderComplete = lazy(() => import("./pages/OrderComplete/OrderComplete"));
const NotFound = lazy(() => import("./pages/NotFound/NotFound"));

const RouteError = () => (
  <main className="routeError">
    <AsyncState title="This page couldn't be opened"
      message="Try loading the page again or return to the collection."
      onRetry={() => window.location.reload()}
      action={<Link to="/products/1">Explore collection</Link>} />
  </main>
);

const Layout = () => (
  <div className="app">
    <a className="skipLink" href="#main-content">Skip to content</a>
    <Mobil />
    <Navbar />
    <div id="main-content" tabIndex={-1}>
      <Suspense fallback={<div className="routeLoading" role="status">Opening collection...</div>}>
        <Outlet />
        <ScrollToTop />
      </Suspense>
    </div>
    <Footer />
    <CartUndo />
  </div>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Home /> },
      { path: "products/:id", element: <Products /> },
      { path: "product/:id", element: <Product /> },
      { path: "about", element: <About /> },
      { path: "cart", element: <CartPage /> },
      { path: "wishlist", element: <Wishlist /> },
      { path: "payment", element: <Payment /> },
      { path: "order-complete", element: <OrderComplete /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
