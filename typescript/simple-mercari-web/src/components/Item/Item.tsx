import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { Button, CardActionArea, CardActions } from "@mui/material";

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
    <>
      {item.image !== "" && (
        <>
          <Card sx={{ width: 250, height: 310 }}>
            <CardActionArea>
              <div className="SOLD">
                <p>SOLD</p>
              </div>
              <CardMedia
                component="img"
                height="200"
                image={fetchImage(item)}
                alt={item.name}
              />
              <CardContent>
                <Typography textAlign="center" variant="body1" component="div">
                  Name: {item.name}
                </Typography>
                <Typography  textAlign="center" variant="body1" >
                  Category: {item.category}
                </Typography>
              </CardContent>
            </CardActionArea>
            <CardActions>
              <Button
                size="small"
                color="primary"
                sx={{ mt:-1.5 }}
                onClick={() => navigator.clipboard.writeText(document.URL)}
              >
                copy the link
              </Button>
            </CardActions>
          </Card>
        </>
      )}
    </>
  );
};
