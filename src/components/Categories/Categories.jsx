import React from "react";
import { Link } from "react-router-dom";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import "./Categories.scss";

const collections = [
  {
    key: "sale",
    title: "Sale",
    to: "/products/all?collection=sale",
    direction: "right",
    image: "https://images.unsplash.com/photo-1511556820780-d912e42b4980?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80",
  },
  {
    key: "women",
    title: "Women",
    to: "/products/1",
    direction: "left",
    image: "https://wallpapercosmos.com/w/full/8/6/5/1224722-2560x1600-desktop-hd-fashion-model-background.jpg",
  },
  {
    key: "new",
    title: "New arrivals",
    to: "/products/all?collection=new",
    direction: "right",
    image: "https://images.unsplash.com/photo-1617922001439-4a2e6562f328?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8d29tZW4lMjBmYXNoaW9ufGVufDB8fDB8fA%3D%3D&w=1000&q=80",
  },
  {
    key: "men",
    title: "Men",
    to: "/products/2",
    direction: "left",
    image: "https://t4.ftcdn.net/jpg/02/49/74/73/360_F_249747366_kn4j6KaeMctSSmEtiy5JRuZOV71ixkNY.jpg",
  },
  {
    key: "shoes",
    title: "Shoes",
    to: "/products/all?sub=shoes",
    direction: "left",
    image: "https://cdn.dsmcdn.com/ty374/product/media/images/20220328/10/76982078/185505707/2/2_org_zoom.jpg",
  },
  {
    key: "accessories",
    title: "Accessories",
    to: "/products/all?sub=accessories",
    direction: "right",
    image: "https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

const Categories = () => (
  <section className="categories" aria-labelledby="categories-title">
    <header className="categories__header">
      <div>
        <span className="categories__eyebrow">Shop by category</span>
        <h2 id="categories-title">Find your next favourite.</h2>
      </div>
      <p>Everyday staples. New perspectives.<br />{" "}Make the collection your own.</p>
    </header>

    <div className="categories__grid">
      {collections.map((collection) => (
        <Link
          key={collection.key}
          className={`categories__tile categories__tile--${collection.key} categories__tile--${collection.direction}`}
          to={collection.to}
          aria-label={`Explore ${collection.title.toLowerCase()}`}
        >
          <img src={collection.image} alt="" loading="lazy" decoding="async" />
          <span className="animated-border">{collection.title}</span>
          <span className="categories__caption" aria-hidden="true">
            <span>Explore collection</span>
            <span className="categories__arrow"><ArrowOutwardRoundedIcon /></span>
          </span>
        </Link>
      ))}
    </div>
  </section>
);

export default Categories;
