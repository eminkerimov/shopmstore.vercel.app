import React, { useEffect, useRef, useState } from "react";
import WestOutlinedIcon from "@mui/icons-material/WestOutlined";
import EastOutlinedIcon from "@mui/icons-material/EastOutlined";
import { useMediaQuery } from "@mui/material";
import { Link } from "react-router-dom";
import "./Slider.scss";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
    eyebrow: "New collection",
    title: "Define your everyday style",
    titleLines: ["Define your", "everyday style"],
    description: "Modern essentials, clean silhouettes and carefully selected pieces for every day.",
    link: "/products/1",
    buttonText: "Shop women",
  },
  {
    image: "https://images.unsplash.com/photo-1659857913560-cc4ceb896221",
    eyebrow: "Season essentials",
    title: "Built for every moment",
    titleLines: ["Built for", "every moment"],
    description: "Discover versatile clothing designed to move effortlessly between work and weekends.",
    link: "/products/2",
    buttonText: "Shop men",
  },
  {
    image: "https://images.unsplash.com/photo-1615461355765-178ee45afc2a",
    eyebrow: "Fresh arrivals",
    title: "Comfort for every day",
    titleLines: ["Comfort for", "every day"],
    description: "Playful designs and comfortable pieces created for active everyday adventures.",
    link: "/products/3",
    buttonText: "Shop children",
  },
];

const Slider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hasFocus, setHasFocus] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const touchStart = useRef(null);
  const autoPlaying = !hasFocus && !isHovered && !prefersReducedMotion && pageVisible;

  const selectSlide = (index) => {
    setCurrentSlide(index);
  };

  const prevSlide = () => {
    setCurrentSlide((current) => (current - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setCurrentSlide((current) => (current + 1) % slides.length);
  };

  useEffect(() => {
    if (!autoPlaying) return undefined;
    const interval = setInterval(() => {
      setCurrentSlide((current) => (current + 1) % slides.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [autoPlaying, currentSlide]);

  useEffect(() => {
    const handleVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const handleKeyDown = (event) => {
    if (!event.target.closest(".sliderControls")) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      prevSlide();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      nextSlide();
    }
  };

  const handleTouchEnd = (event) => {
    if (!touchStart.current) return;
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = touch.clientY - touchStart.current.y;
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) prevSlide();
      else nextSlide();
    }
    touchStart.current = null;
  };

  return (
    <section
      className="slider"
      aria-roledescription="carousel"
      aria-label="Featured collections"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setHasFocus(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setHasFocus(false);
      }}
      onKeyDown={handleKeyDown}
      onTouchStart={(event) => {
        const touch = event.touches[0];
        touchStart.current = { x: touch.clientX, y: touch.clientY };
      }}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={() => { touchStart.current = null; }}
    >
      <div
        className="sliderTrack"
        aria-live={autoPlaying ? "off" : "polite"}
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <article
            className="slide"
            key={slide.title}
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${slides.length}`}
            aria-hidden={currentSlide !== index}
          >
            <img
              className="slideImage"
              src={slide.image}
              alt=""
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
              fetchpriority={index === 0 ? "high" : undefined}
            />
            <div className="slideOverlay" />
            <div className="slideContent">
              <div className={`contentInner ${currentSlide === index ? "active" : ""}`}>
                <span className="eyebrow">{slide.eyebrow}</span>
                <h1>{slide.titleLines.map((line) => <span key={line}>{line}</span>)}</h1>
                <p>{slide.description}</p>
                <Link className="shopButton" to={slide.link} tabIndex={currentSlide === index ? 0 : -1}>
                  {slide.buttonText}
                  <EastOutlinedIcon />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="sliderControls">
        <div className="sliderDots" role="group" aria-label="Choose a slide">
          {slides.map((slide, index) => (
            <button
              type="button"
              key={slide.title}
              className={`sliderDot ${currentSlide === index ? "active" : ""}`}
              onClick={() => selectSlide(index)}
              aria-label={`Open slide ${index + 1}`}
              aria-current={currentSlide === index ? "true" : undefined}
            />
          ))}
        </div>
        <div className="sliderArrows">
          <button type="button" className="arrowButton" onClick={prevSlide} aria-label="Previous slide">
            <WestOutlinedIcon />
          </button>
          <button type="button" className="arrowButton" onClick={nextSlide} aria-label="Next slide">
            <EastOutlinedIcon />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Slider;
