import React, { useEffect, useState } from "react";
import WestOutlinedIcon from "@mui/icons-material/WestOutlined";
import EastOutlinedIcon from "@mui/icons-material/EastOutlined";
import { Link } from "react-router-dom";
import "./Slider.scss";

const slides = [
  {
    image:
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
    eyebrow: "New collection",
    title: "Define your everyday style",
    description:
      "Modern essentials, clean silhouettes and carefully selected pieces for every day.",
    link: "/products/1",
    buttonText: "Shop women",
  },
  {
    image:
      "https://images.unsplash.com/photo-1659857913560-cc4ceb896221",
    eyebrow: "Season essentials",
    title: "Built for every moment",
    description:
      "Discover versatile clothing designed to move effortlessly between work and weekends.",
    link: "/products/2",
    buttonText: "Shop men",
  },
  {
    image:
      "https://images.unsplash.com/photo-1615461355765-178ee45afc2a",
    eyebrow: "Fresh arrivals",
    title: "Comfort for every day",
    description:
      "Playful designs and comfortable pieces created for active everyday adventures.",
    link: "/products/3",
    buttonText: "Shop children",
  },
];

const Slider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? slides.length - 1 : prev - 1
    );
  };

  const nextSlide = () => {
    setCurrentSlide((prev) =>
      prev === slides.length - 1 ? 0 : prev + 1
    );
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === slides.length - 1 ? 0 : prev + 1
      );
    }, 6500);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="slider">
      <div
        className="sliderTrack"
        style={{
          transform: `translateX(-${currentSlide * 100}%)`,
        }}
      >
        {slides.map((slide, index) => (
          <article className="slide" key={slide.title}>
            <img
              className="slideImage"
              src={slide.image}
              alt={slide.title}
            />

            <div className="slideOverlay"></div>

            <div className="slideContent">
              <div
                className={`contentInner ${
                  currentSlide === index ? "active" : ""
                }`}
              >
                <span className="eyebrow">{slide.eyebrow}</span>

                <h1>{slide.title}</h1>

                <p>{slide.description}</p>

                <Link className="shopButton" to={slide.link}>
                  {slide.buttonText}
                  <EastOutlinedIcon />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="sliderControls">
        <button
          type="button"
          className="arrowButton"
          onClick={prevSlide}
          aria-label="Previous slide"
        >
          <WestOutlinedIcon />
        </button>

        <div className="sliderDots">
          {slides.map((slide, index) => (
            <button
              type="button"
              key={slide.title}
              className={`sliderDot ${
                currentSlide === index ? "active" : ""
              }`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Open slide ${index + 1}`}
            />
          ))}
        </div>

        <button
          type="button"
          className="arrowButton"
          onClick={nextSlide}
          aria-label="Next slide"
        >
          <EastOutlinedIcon />
        </button>
      </div>
    </section>
  );
};

export default Slider;