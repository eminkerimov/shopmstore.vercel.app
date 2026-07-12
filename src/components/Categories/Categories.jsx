import React from "react";
import { Link } from "react-router-dom";
import "./Categories.scss";

const Categories = () => {
  return (
    <section className="categories">
      <div className="col">
        <div className="row animationR">
          <img
            src="https://images.unsplash.com/photo-1511556820780-d912e42b4980?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80"
            alt="Women's sale collection"
          />

          <Link className="link animated-border" to="/products/1">
              Sale
          </Link>
        </div>

        <div className="row animationL">
          <img
            src="https://wallpapercosmos.com/w/full/8/6/5/1224722-2560x1600-desktop-hd-fashion-model-background.jpg"
            alt="Women's collection"
          />

          <Link className="link animated-border" to="/products/1">
            Women
          </Link>
        </div>
      </div>

      <div className="col">
        <div className="row animationR">
          <div className="row">
            <img
              src="https://images.unsplash.com/photo-1617922001439-4a2e6562f328?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8d29tZW4lMjBmYXNoaW9ufGVufDB8fDB8fA%3D%3D&w=1000&q=80"
              alt="New women's collection"
            />

            <Link className="link animated-border" to="/products/1">
              New Arrivals
            </Link>
          </div>
        </div>
      </div>

      <div className="col col-l">
        <div className="row">
          <div className="col">
            <div className="row animationL">
              <div className="row">
                <img
                  src="https://t4.ftcdn.net/jpg/02/49/74/73/360_F_249747366_kn4j6KaeMctSSmEtiy5JRuZOV71ixkNY.jpg"
                  alt="Men's collection"
                />

                <Link className="link animated-border" to="/products/2">
                  Men
                </Link>
              </div>
            </div>
          </div>

          <div className="col">
            <div className="row animationL">
              <div className="row">
                <img
                  src="https://cdn.dsmcdn.com/ty374/product/media/images/20220328/10/76982078/185505707/2/2_org_zoom.jpg"
                  alt="Men's shoes"
                />
                  <Link className="link animated-border" to="/products/1">
                    Shoes
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="row animationR">
          <div className="row">
            <img
              src="https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Women's accessories"
            />

            <Link className="link animated-border" to="/products/1">
              Accessories
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Categories;