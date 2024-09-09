import { React } from "react";

import { Link, useLocation } from "wouter";

import { useActiveUnmute } from "../../api/useUnmutes";

import distance from "../../assets/images/audio/distance.png";
import inspiration from "../../assets/images/audio/inspiration.png";
import no_headphones from "../../assets/images/audio/no_headphones.png";

import DeleteIcon from "../../assets/images/buttons/delete.png";

export const AudioPage = () => {
  const { activeUnmute } = useActiveUnmute();
  const [_location, navigate] = useLocation();

  if (activeUnmute?.properties?._audios?.length > 0) {
    navigate("/edit-audio");
    return;
  }

  return (
    <>
      <div className="flex flex-col">
        <div className="place-self-start w-3/5 ml-8 mt-6">
          <img
            src={no_headphones}
            alt="No headphones"
            className="h-full object-cover"
          />
          <div className="text-rose-500 text-center -mt-10 ml-12 leading-tight">
            Do not use your <br />
            headphones to record
          </div>
        </div>

        <div className="place-self-end w-3/5 mr-8 mt-3">
          <img src={distance} alt="Distance" className="h-full object-cover" />
          <div className="text-rose-500 text-right">
            Distance to the phone 15 cm
          </div>
        </div>

        <div className="place-self-start w-3/5 ml-8 mt-3">
          <img
            src={inspiration}
            alt="Inspiration"
            className="h-full object-cover"
          />
          <div className="text-rose-500">Write some inspiration text</div>
        </div>
      </div>

      <div className="flex flex-row justify-center gap-4">
        <Link className="text-white bg-rose-500 border border-rose focus:outline-none hover:bg-white hover:text-rose-500 focus:ring-4 focus:ring-rose font-medium rounded-lg px-8 py-2.5 mt-12 cursor-pointer">
          Get inspiration
        </Link>

        <Link
          to="/inspiration"
          className="text-white bg-rose-500 border border-rose focus:outline-none hover:bg-white hover:text-rose-500 focus:ring-4 focus:ring-rose font-medium rounded-lg px-8 py-2.5 mt-12 cursor-pointer"
        >
          Start recording
        </Link>
      </div>

      <div className="fixed bottom-0 left-0 z-50 w-full h-20 bg-beige-500 border-t border-beige-600">
        <div className="grid h-full max-w-lg grid-cols-6 mx-auto font-medium">
          <div>&nbsp;</div>
          <div>&nbsp;</div>
          <div>&nbsp;</div>
          <div>&nbsp;</div>
          <div>&nbsp;</div>
          <Link
            to="/orientation"
            className="inline-flex flex-col items-center justify-center px-4 group bg-beige-500 hover:bg-beige-600"
          >
            <img src={DeleteIcon} alt="DeleteIcon" />
            <span className="text-sm text-gray-500 group-hover:text-rose-600">
              Close
            </span>
          </Link>
        </div>
      </div>
    </>
  );
};
