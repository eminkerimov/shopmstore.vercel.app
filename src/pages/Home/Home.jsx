import React, { useRef } from "react";
import Categories from "../../components/Categories/Categories";
import FeaturedProducts from "../../components/FeaturedProducts/FeaturedProducts";
import Slider from "../../components/Slider/Slider";
import useScrollReveal from "../../custom/useScrollReveal";
import "./Home.scss";

const Home = () => {
  const homeRef = useRef(null);
  useScrollReveal(homeRef);

  return (
    <div className="home" ref={homeRef}>
      <Slider />
      <FeaturedProducts type="featured" />
      <Categories />
      <FeaturedProducts type="trending" />
    </div>
  );
};

export default Home;