import clsx from "clsx";
import { React } from "react";

import { Link, useLocation, useParams } from "wouter";

import { useActiveUnmute } from "../../api/useUnmutes";
import { NavCloseIcon } from "../../assets/icons/icon_nav_close";

import distance from "../../assets/images/audio/distance.png";
import inspiration from "../../assets/images/audio/inspiration.png";
import no_headphones from "../../assets/images/audio/no_headphones.png";

import DeleteIcon from "../../assets/images/buttons/delete.png";

export const AudioPage = () => {
  const { activeUnmute } = useActiveUnmute();
  const [_location, navigate] = useLocation();
  const { id } = useParams();

  if (activeUnmute?.properties?._audios?.length > 0) {
    navigate(`/edit-audio/${id}}`);
    return;
  }

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
    <div className={"pb-[80px]"}>
      {ONBOARDING.map((item, index) => (
        <div key={index} className="text-center mt-8 max-w-sm mx-auto">
          <img src={item.image} alt="No headphones" className="w-full" />
          <div className="font-serif text-white text-center text-2xl -mt-11 leading-tight">
            {item.label}
          </div>
        </div>
      ))}

      <div className="flex flex-row justify-center gap-4 mt-16">
        <Link
          to={"/inspirations"}
          className="text-white bg-black border border-rose transition duration-200 ease-out focus:outline-none hover:bg-gray-800 focus:ring-4 focus:ring-rose font-medium rounded-lg px-8 py-2.5 cursor-pointer"
        >
          Get inspiration
        </Link>

        <Link
          to={`/audio-upload/${id}`}
          className="text-white bg-rose-500 border border-rose transition duration-200 ease-out focus:outline-none hover:bg-rose-900 focus:ring-4 focus:ring-rose font-medium rounded-lg px-8 py-2.5 cursor-pointer"
        >
          Start recording
        </Link>
      </div>

      <div className="fixed bottom-0 left-0 z-50 w-full bg-beige-300 border-t border-beige-200">
        <div className="grid gap-2 h-full max-w-2xl grid-cols-6 mx-auto font-medium">
          <div>&nbsp;</div>
          <div>&nbsp;</div>
          <div>&nbsp;</div>
          <div>&nbsp;</div>
          <div>&nbsp;</div>
          <Link
            to="/orientation"
            className={(active) =>
              clsx(
                "inline-flex flex-col items-center justify-center py-3 group transition duration-200 ease-out hover:bg-beige-400",
                active ? "bg-beige-400" : ""
              )
            }
          >
            <NavCloseIcon />
            <span className="font-sans text-sm text-muld-1000 text-center mt-2">
              Close
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};
