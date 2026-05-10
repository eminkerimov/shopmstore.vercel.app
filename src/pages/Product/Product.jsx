import React, { useState } from "react";
import "./Product.scss";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import BalanceIcon from "@mui/icons-material/Balance";
import { useParams } from "react-router-dom";
import useFetch from "../../custom/useFetch";
import { useDispatch } from "react-redux";
import { addToCart, handleCart } from "../../redux/cartReducer.js";

const Product = () => {
  const id = useParams().id;
  const [selectedImg, setSelectedImg] = useState("img");
  const [quantity, setQuantity] = useState(1);

  const dispatch = useDispatch();

  const { data, loading } = useFetch(`/product/${id}`);

  const handleAdd = () => {
    dispatch(
      addToCart({
        id: data.id,
        title: data.title,
        desc: data.desc,
        price: data.price,
        img: data.img,
        quantity,
      })
    );
    dispatch(handleCart(true))
  };

  return (
    <div className="product">
      {loading ? (
        "loading"
      ) : (
        <>
          <div className="left">
            <div className="images">
              <img
                src={data?.img}
                alt=""
                onClick={(e) => setSelectedImg("img")}
              />
              <img
                src={data?.img2}
                alt=""
                onClick={(e) => setSelectedImg("img2")}
              />
            </div>
            <div className="mainImg">
              <img src={data?.[selectedImg]} alt="" />
            </div>
          </div>
          <div className="right">
            <h1>{data?.title}</h1>
            <span className="price">${data?.price}</span>
            <p>{data?.desc}</p>
            <div className="quantity">
              <button
                onClick={() =>
                  setQuantity((prev) => (prev === 1 ? 1 : prev - 1))
                }
              >
                -
              </button>
              {quantity}
              <button onClick={() => setQuantity((prev) => prev + 1)}>+</button>
            </div>
            <button
              className="add"
              onClick={handleAdd}
            >
              <AddShoppingCartIcon /> ADD TO CART
            </button>
            <div className="links">
              <div className="item">
                <FavoriteBorderIcon /> ADD TO WISH LIST
              </div>
              <div className="item">
                <BalanceIcon /> ADD TO COMPARE
              </div>
            </div>
            <div className="info">
              <span>Vendor: Polo</span>
              <span>Product Type: {data?.sub_category}</span>
              <span>
                Tag: {data?.sub_category}, {data?.type}
              </span>
            </div>
            <hr />
            <div className="info">
              <span>DESCRIPTION</span>
              <hr />
              <span>ADDITIONAL INFORMATION</span>
              <hr />
              <span>FAQ</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Product;
