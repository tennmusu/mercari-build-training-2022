import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
interface Item {
  name: string;
  category: string;
  image: string;
}

const server = process.env.API_URL || "http://127.0.0.1:9000";
//const placeholderImage = process.env.PUBLIC_URL + '/logo192.png';

export const ItemDetail: React.FC<{}> = () => {
  const initialState = {
    name: "",
    category: "",
    image: "",
  };
  const [item, setItem] = useState<Item>(initialState);
  let { id } = useParams();

  const fetchItem = () => {
    fetch(server.concat("/items/" + id), {
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
        setItem(data);
      })
      .catch((error) => {
        console.error("GET error:", error);
      });
  };

  const fetchImage = (item: Item): string => {
    return server + "/image/" + item.image;
  };

  useEffect(() => {
    fetchItem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="ItemList">
      {item.image === "" ? (
        <></>
      ) : (
        <>
          <div className="ItemList_image">
            <img alt={"image of"+item.name} src={fetchImage(item)} />
          </div>
          <p>
            <span>Name: {item.name}</span>
            <br />
            <span>Category: {item.category}</span>
          </p>
        </>
      )}
      <button onClick={() => navigator.clipboard.writeText(document.URL)}>
        copy the link
      </button>
    </div>
  );
};
