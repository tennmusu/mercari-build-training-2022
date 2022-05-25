import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { styled } from "@mui/material/styles";
import Checkbox from "@mui/material/Checkbox";
import Alert from '@mui/material/Alert';
import FormControlLabel from "@mui/material/FormControlLabel";

const server = process.env.API_URL || "http://127.0.0.1:9000";
const theme = createTheme({
  palette: {
    primary: {
      main: "#eff7ff",
    },
  },
});
const Form = styled("form")(({ theme }) => ({
  display: "flex",
  gap: 5,
  marginBottom:5,
  [theme.breakpoints.up("sm")]: {
    maxHeight:30
  },
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
  },
}));
interface Category {
  id: number;
  name: string;
}
type onChangetypes = {
  (input: React.ChangeEvent<HTMLInputElement>): void;
  (select: React.ChangeEvent<HTMLSelectElement>): void;
};

export const Listing: React.FC<{}> = () => {
  const initialState = {
    name: "",
    category_id: "",
    image: new File([""], "init"),
  };
  const [values, setValues] = useState(initialState);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isjpg, setIsJpg] = useState(true);
  const onChange: onChangetypes = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (event.target instanceof HTMLSelectElement) {
      setValues({ ...values, [event.target.name]: event.target.value });
      return;
    }
    if (event.target instanceof HTMLInputElement) {
      if (event.target.type === "file") {
        if (!event.target.files) return;
        setValues({ ...values, [event.target.name]: event.target.files[0] });
      } else {
        setValues({ ...values, [event.target.name]: event.target.value });
      }
    }
  };
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(values);
    if (
      !values.image.name.includes(".") ||
      values.image.name.split(".")[1] !== "jpg"
    ) {
      console.log(values.image.name.split(".")[1]);
      setIsJpg(false);
      return;
    } else {
      setIsJpg(true);
    }

    const data = new FormData();
    data.append("name", values.name);
    data.append("category_id", values.category_id);
    data.append("image", values.image);

    fetch(server.concat("/items"), {
      method: "POST",
      mode: "cors",
      body: data,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("POST success:", data);
      })
      .catch((error) => {
        console.error("POST error:", error);
      });
  };

  const fetchCategories = () => {
    fetch(server.concat("/categories"), {
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
        setCategories(data.categories);
      })
      .catch((error) => {
        console.error("GET error:", error);
      });
  };
  useEffect(() => {
    fetchCategories();
  }, []);
  return (
    <div className="Listing">
      <Form onSubmit={onSubmit}>
        <input
          type="text"
          name="name"
          id="name"
          placeholder="name"
          onChange={onChange}
          required
        />
        <select
          name="category_id"
          id="category_id"
          placeholder="category_id"
          required
          onChange={onChange}
        >
          <option value="">--categories--</option>
          {categories.map((category) => {
            return (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            );
          })}
        </select>
        <ThemeProvider theme={theme}>
          <Button variant="contained" component="label">
            Upload File
            <input
              type="file"
              name="image"
              id="image"
              placeholder="image"
              onChange={onChange}
              accept="image/jpeg"
              required
              hidden
            />
          </Button>
          <FormControlLabel
            control={<Checkbox sx={{ color: "#eff7ff" }} />}
            label="private"
          />
          <Button type="submit" variant="contained" size="small">
            List this item
          </Button>
        </ThemeProvider>
      </Form>
      {!isjpg &&<Alert severity="error">File extension should be jpg.</Alert>}
    </div>
  );
};
