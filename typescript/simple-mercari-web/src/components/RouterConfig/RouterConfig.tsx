import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes
} from "react-router-dom";
import { Login } from '../Login';
import {SignUp} from  '../SignUp';
import { Home } from '../Home';
import { Content } from '../Content';
import { RouteAuthGuard } from "../RouteAuthGuard";
import { RoleType } from "../../types";

export const RouterConfig: React.FC<{}> = () => {

  return (
    <Router>
      <Routes>
        <Route  path="/" element={<Home/>}/>
        <Route  path="/login" element={<Login/>}/>
        <Route  path="/signup" element={<SignUp/>}/>
        <Route path="/content" element={
                <RouteAuthGuard component={<Content />} redirect="/" 
                        allowroles={[RoleType.User]} />} ></Route>
      </Routes>
  </Router>
  )
};
