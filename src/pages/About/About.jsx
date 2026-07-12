import React from "react";
import "./About.scss";

const About = () => {
  return (
    <main className="aboutPage">
      <section className="aboutHero">
        <img
          className="aboutHero__image"
          src="https://images.unsplash.com/photo-1603798125914-7b5d27789248?ixlib=rb-4.0.3&auto=format&fit=crop&w=1800&q=85"
          alt="M-store fashion collection"
        />

        <div className="aboutHero__overlay" />

        <div className="aboutHero__content">
          <span className="aboutHero__eyebrow">About M-store</span>

          <h1>
            Style selected for
            <span> everyday life.</span>
          </h1>

          <p>
            Contemporary clothing, clean silhouettes and comfortable
            essentials selected for confidence beyond a single season.
          </p>
        </div>

        <span className="aboutHero__index">01 — Our story</span>
      </section>

      <section className="aboutProcess">
        <div className="aboutProcess__heading">
          <span>Shopping experience</span>

          <h2>
            From discovery
            <br />
            to checkout.
          </h2>

          <p>
            M-store keeps the shopping process focused: find the right category,
            narrow the selection and complete the purchase without unnecessary
            steps.
          </p>
        </div>

        <div className="aboutProcess__steps">
          <article>
            <span className="stepNumber">01</span>

            <div>
              <h3>Browse collections</h3>
              <p>
                Explore dedicated Women, Men and Children categories with
                clearly separated product selections.
              </p>
            </div>
          </article>

          <article>
            <span className="stepNumber">02</span>

            <div>
              <h3>Refine the results</h3>
              <p>
                Use product filters to reduce the catalogue and focus on the
                items that match your selection.
              </p>
            </div>
          </article>

          <article>
            <span className="stepNumber">03</span>

            <div>
              <h3>Complete the purchase</h3>
              <p>
                Add products to the cart, review the order and continue through
                the checkout process.
              </p>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
};

export default About;