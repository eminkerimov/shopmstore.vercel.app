import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
} from "react-router-dom";

import Footer from "./components/Footer/Footer";
import Navbar from "./components/Navbar/Navbar";
import Mobil from "./components/Mobil/Mobil";
import ScrollToTop from "./helpers/ScrollToTop";

import Home from "./pages/Home/Home";
import Product from "./pages/Product/Product";
import Products from "./pages/Products/Products";
import About from "./pages/About/About";
import CartPage from "./pages/CartPage/CartPage";
import Payment from "./pages/Payment/Payment";
import Wishlist from "./pages/Wishlist/Wishlist";

import "./app.scss";

const Layout = () => {
  return (
    <div className="app">
      <ScrollToTop />
      <Mobil />
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/products/:id",
        element: <Products />,
      },
      {
        path: "/product/:id",
        element: <Product />,
      },
      {
        path: "/about",
        element: <About />,
      },
      {
        path: "/cart",
        element: <CartPage />,
      },
      {
        path: "/wishlist",
        element: <Wishlist />,
      },
      {
        path: "/payment",
        element: <Payment />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;