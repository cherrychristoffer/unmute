import { React } from "react";
import clsx from "clsx";

import { Link, useLocation } from "wouter";

import { NavCloseIcon } from "../../assets/icons/icon_nav_close";
import { useActiveUnmute } from "../../api/useUnmutes";

import MultipleRecordings from "../../assets/images/audio/multiple-recordings.png";
import OneRecording from "../../assets/images/audio/one-recording.png";

export const AudioApproachPage = () => {
  const { activeUnmute } = useActiveUnmute();
  const [_location, navigate] = useLocation();

  if (activeUnmute?.properties?._audios?.length > 0) {
    navigate("/edit-audio");
    return;
  }

  const ONBOARDING = [
    {
      image: MultipleRecordings,
      label: "Multiple recordings",
    },
    {
      image: OneRecording,
      label: "One recording",
    },
  ];

  return (
    <div className={"pb-[80px] sm:pb-[110px] pt-10"}>
      <div className="mx-auto flex flex-col items-center pb-10">
        <h1 className="font-serif text-muld-1000 text-[50px] mb-4">Select</h1>
        <h2 className="font-serif text-muld-1000 text-[17px] text-center leading-tight">
          Audio approached
        </h2>
      </div>

      {ONBOARDING.map((item, index) => (
        <div
          key={index}
          className="text-center mt-8 max-w-sm mx-auto"
        >
          <img
            src={item.image}
            alt="No headphones"
            className="w-full"
          />
          <div className="font-serif text-white text-center text-2xl -mt-[22px] leading-tight">
            {item.label}
          </div>
        </div>
      ))}

      <div className="fixed bottom-0 left-0 z-50 w-full bg-beige-300 border-t border-beige-200 sm:max-w-max sm:p-3 sm:rounded-xl sm:mx-auto sm:left-0 sm:right-0 sm:bottom-4">
        <div className="grid sm:gap-2 h-full max-w-2xl grid-cols-6 mx-auto font-medium">
          <div>&nbsp;</div>
          <div>&nbsp;</div>
          <div>&nbsp;</div>
          <div>&nbsp;</div>
          <div>&nbsp;</div>
          <Link
            to="/edit-audio"
            className={(active) =>
              clsx(
                "inline-flex flex-col items-center justify-center py-3 group transition duration-200 ease-out hover:bg-beige-400 sm:px-4 sm:rounded-lg ",
                active ? "bg-beige-400" : ""
              )
            }
          >
            <NavCloseIcon/>
            <span className="font-sans text-[10px] text-muld-1000 text-center mt-2">
              Close
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};
