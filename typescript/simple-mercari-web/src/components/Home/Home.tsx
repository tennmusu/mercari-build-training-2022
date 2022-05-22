import React, { useState, useEffect } from "react";
import { Login } from '../Login';



export const Home: React.FC<{}> = () => {
  
    
    
  

  return (
    <div>
      <header className='Title'>
        <p>
          <b>Simple Mercari</b>
        </p>
      </header>
      <div>
        <Login/>
      </div>
    </div>
  );
};
