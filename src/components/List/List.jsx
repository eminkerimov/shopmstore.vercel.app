import React, { useState, useEffect } from "react";
import "./List.scss";
import Card from "../Card/Card";
import useFetch from "../../custom/useFetch";

const List = ({ subCats, maxPrice, sort, catId }) => {
  const [filteredData, setFilteredData] = useState([]);

  const { data, loading } = useFetch(
    `/product?category=${catId}&sortBy=price&order=${sort}`
  );

useEffect(() => {
  setFilteredData(data);

  if (data?.length) {
    if (subCats.length) {
      const newData = data.filter(
        (item) =>
          subCats.includes(item.sub_category) &&
          item.price <= maxPrice
      );

      setFilteredData(newData);
    } else {
      const newData = data.filter(
        (item) => item.price <= maxPrice
      );

      setFilteredData(newData);
    }
  }
}, [data, subCats, maxPrice, catId]);

  return (
    <div className="list">
      {loading
        ? "loading"
        : filteredData?.map((item) => <Card item={item} key={item.id} />)}
    </div>
  );
};

export default List;
