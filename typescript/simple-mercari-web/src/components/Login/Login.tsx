import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserType, RoleType } from "../../types";
import { AuthUserContextType, useAuthUserContext } from "../../providers";
const server = process.env.API_URL || "http://127.0.0.1:9000";


export const Login: React.FC<{}> = () => {
  const initialState = {
    id: "",
    password: "",
  };
  const navigate = useNavigate();
  const authUser: AuthUserContextType = useAuthUserContext();
  const signin = (role: RoleType) => {
    const user: UserType = {
      name: values.id,
      role: role,
    };
    authUser.signin(user, () => {
      navigate("./content", { replace: true });
    });
  };
  const [values, setValues] = useState(initialState);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(values);
    signin(RoleType.User);
  };

  return (
    <div className="Login">
      <form className="Form" onSubmit={onSubmit}>
        <input
          type="text"
          name="id"
          id="id"
          placeholder="id"
          onChange={onChange}
          required
        />
        <input
          type="text"
          name="password"
          id="password"
          placeholder="password"
          onChange={onChange}
          required
        />
        <button type="submit">Login</button>
      </form>
      <div>
        <p>New here?</p>
        <button type="submit">Sign Up</button>
      </div>
    </div>
  );
};
