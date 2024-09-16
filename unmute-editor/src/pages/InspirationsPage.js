import { React } from "react";
import { useLocation } from "wouter";

import { addUnmute } from "../features/user/userSlice";
import { addUnmuteToCart } from "../api/cart";
import { useDispatch } from "react-redux";

import offer1 from "../assets/images/offers/offer1.png";
import offer2 from "../assets/images/offers/offer2.png";
import offer3 from "../assets/images/offers/offer3.png";
import offer4 from "../assets/images/offers/offer4.png";

export const InspirationsPage = () => {
  const [_location, navigate] = useLocation();

  const handleClick = () => {
    navigate("/inspiration-video");
  };

  const INSPIRATIONS = [
    {
      image: 'https://i0.wp.com/www.sugar.org/wp-content/uploads/Birthday-Cake-1.png?fit=940%2C788&ssl=1',
      title: 'Birthday',
    },
    {
      image: 'https://media-api.xogrp.com/images/1e02247f-3c92-4c38-8cc6-5f0bb78f8ce0~rs_768.h',
      title: 'Love One',
    },
    {
      image: offer3,
      title: 'Wedding',
    },
    {
      image: offer4,
      title: 'Anniversary',
    },
  ];

  return (
    <div className={'offers-page flex items-center py-10'}>
      <div className="content">
        <div className="mx-auto flex flex-col items-center">
          <h1 className="font-serif text-muld-1000 text-[50px] mb-4">Inspiration</h1>
          <h2 className="font-serif text-muld-1000 text-[17px] text-center leading-tight">
            Choose your occasion
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-6 mx-4 mt-14">
          {INSPIRATIONS.map((item, index) =>
            <div
                key={index}
                onClick={() => handleClick({quantity: item.quantity})}
                className="flex flex-col items-center my-2 cursor-pointer"
            >
              <img
                  src={item.image}
                  className="rounded-[3px] aspect-square object-cover"
                  alt={item.title}
              />
              <div
                  className={`-mt-14 px-2.5 py-3 w-5/6`}>
                <div className="font-light text-gray-700">
                  <p className={`text-white text-[12px]`}>{item.title}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
