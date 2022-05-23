import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Item {
  id: number;
  name: string;
  category: string;
  image: string;
}

const server = process.env.API_URL || "http://127.0.0.1:9000";
//const placeholderImage = process.env.PUBLIC_URL + '/logo192.png';

export const ItemList: React.FC<{}> = () => {
  const [items, setItems] = useState<Item[]>([]);

  const fetchItems = () => {
    fetch(server.concat("/items"), {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("GET success:", data);
        setItems(data.items);
      })
      .catch((error) => {
        console.error("GET error:", error);
      });
  };

  const fetchImage = (item: Item): string => {
    return server + "/image/" + item.image;
  };

  useEffect(() => {
    fetchItems();
  }, []);
  return (
    <div className="wrapper">
      {items.map((item) => {
        return (
          <div key={item.id} className="ItemList">
            <div className="ItemList_image">
            <img  alt={"image of"+item.name} src={fetchImage(item)} />
            </div>
            <p>
              <span>Name: {item.name}</span>
              <br />
              <span>Category: {item.category}</span>
            </p>
            <button>
              <Link  className="Link" to={"item/"+item.id}>show more details</Link>
            </button>
          </div>
        );
      })}
    </div>
  );
};
