import { React } from "react";

import distance from "../assets/images/audio/distance.png";
import inspiration from "../assets/images/audio/inspiration.png";
import no_headphones from "../assets/images/audio/no_headphones.png";


export const AudioIllustrations = () => {
  const ONBOARDING = [
    {
      image: no_headphones,
      label: "Do not use in-ears to record",
    },
    {
      image: distance,
      label: "Min. distance to phone 15 cm",
    },
    {
      image: inspiration,
      label: "Write some inpiration text",
    },
  ];

  return (
    <div className={"pb-[20px]"}>
      {ONBOARDING.map((item, index) => (
        <div key={index} className="text-center mt-8 max-w-sm mx-auto">
          <img src={item.image} alt="No headphones" className="w-full" />
          <div className="font-serif text-white text-center text-2xl -mt-11 leading-tight">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
};
