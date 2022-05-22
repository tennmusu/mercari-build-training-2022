import React, { useState, useEffect } from "react";
import { ItemList } from '../ItemList';
import { Listing } from '../Listing';


export const Content: React.FC<{}> = () => {

  return (
    <div>
      <header className='Title'>
        <p>
          <b>Simple Mercari</b>
        </p>
      </header>
      <div>
        <Listing/>
      </div>
      <div>
        <ItemList/>
      </div>
    </div>
  );
};
