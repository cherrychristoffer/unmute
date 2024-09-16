import { React } from "react";
import { useLocation } from "wouter";

import Anniversary from "../assets/images/inspirations/anniversary.png";
import BDay from "../assets/images/inspirations/bday.png";
import LoveOne from "../assets/images/inspirations/love-one.png";
import ParentsDay from "../assets/images/inspirations/parents-day.png";
import Valentine from "../assets/images/inspirations/valentine.png";
import Wedding from "../assets/images/inspirations/wedding.png";

export const InspirationsPage = () => {
  const [_location, navigate] = useLocation();

  const handleClick = () => {
    navigate("/inspiration-video");
  };

  const INSPIRATIONS = [
    {
      image: BDay,
      title: 'Birthday',
    },
    {
      image: LoveOne,
      title: 'Love One',
    },
    {
      image: Wedding,
      title: 'Wedding',
    },
    {
      image: Anniversary,
      title: 'Anniversary',
    },
    {
      image: Valentine,
      title: 'Valentine',
    },
    {
      image: ParentsDay,
      title: 'Parents Day',
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
