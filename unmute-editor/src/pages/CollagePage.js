import { React } from "react";
import { useLocation } from "wouter";

import Collage1 from "../assets/images/collage/collage1.png";
import Collage2 from "../assets/images/collage/collage2.png";
import Collage3 from "../assets/images/collage/collage3.png";
import Collage4 from "../assets/images/collage/collage4.png";

export const CollagePage = () => {
  const [_location] = useLocation();

  const COLLAGES = [
    {
      image: Collage1,
    },
    {
      image: Collage2,
    },
    {
      image: Collage3,
    },
    {
      image: Collage4,
    },
  ];

  return (
    <div className={'offers-page flex items-center py-10'}>
      <div className="content">
        <div className="grid grid-cols-2 gap-6 mx-4">
          {COLLAGES.map((item, index) =>
            <div
                key={index}
                // onClick={() => handleClick({quantity: item.quantity})}
                className="flex flex-col items-center my-2 cursor-pointer"
            >
              <img
                  src={item.image}
                  className="w-full"
                  alt={item.title}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
