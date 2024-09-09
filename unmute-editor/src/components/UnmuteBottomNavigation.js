import { React } from "react";

import clsx from "clsx";

import { Link } from "wouter";

import AddIcon from "../assets/images/buttons/add.png";
import CropIcon from "../assets/images/buttons/crop.png";
import FrameIcon from "../assets/images/buttons/oak-frame.png";
import OrientationIcon from "../assets/images/buttons/orientation.png";
import PassepartoutIcon from "../assets/images/buttons/passepartout.png";
import ReplaceIcon from "../assets/images/buttons/replace.png";

export const UnmuteBottomNavigation = () => {
  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-20 bg-beige-500 border-t border-beige-200">
      <div className="grid gap-2 h-full max-w-lg grid-cols-6 mx-auto font-medium">
        <Link
          to="/orientation"
          className={(active) =>
            clsx(
              "inline-flex flex-col items-center justify-center px-4 group hover:bg-beige-600",
              active ? "bg-beige-600" : "bg-beige-500"
            )
          }
        >
          <img src={OrientationIcon} alt="Orientation" />
          <span className="font-sans text-sm text-gray-500 group-hover:text-rose-600">
            Orientation
          </span>
        </Link>

        <Link
          to="/frame"
          className={(active) =>
            clsx(
              "inline-flex flex-col items-center justify-center px-4 group hover:bg-beige-600",
              active ? "bg-beige-600" : "bg-beige-500"
            )
          }
        >
          <img src={FrameIcon} alt="Frame" />
          <span className="font-sans text-sm text-gray-500 group-hover:text-rose-600">
            Oak&nbsp;Frame
          </span>
        </Link>

        <Link
          to="/passepartout"
          className={(active) =>
            clsx(
              "inline-flex flex-col items-center justify-center px-4 group hover:bg-beige-600",
              active ? "bg-beige-600" : "bg-beige-500"
            )
          }
        >
          <img src={PassepartoutIcon} alt="Passepartout" />
          <span className="font-sans text-sm text-gray-500 group-hover:text-rose-600">
            Passepartout
          </span>
        </Link>

        <Link
          to="/crop"
          className={(active) =>
            clsx(
              "inline-flex flex-col items-center justify-center px-4 group hover:bg-beige-600",
              active ? "bg-beige-600" : "bg-beige-500"
            )
          }
        >
          <img src={CropIcon} alt="Crop" />
          <span className="font-sans text-sm text-gray-500 group-hover:text-rose-600">
            Crop
          </span>
        </Link>

        <Link
          to="/upload-image"
          className={(active) =>
            clsx(
              "inline-flex flex-col items-center justify-center px-4 group hover:bg-beige-600",
              active ? "bg-beige-600" : "bg-beige-500"
            )
          }
        >
          <img src={ReplaceIcon} alt="Replace" />
          <span className="font-sans text-sm text-gray-500 group-hover:text-rose-600">
            Replace
          </span>
        </Link>

        <Link
          to="/add"
          className={(active) =>
            clsx(
              "inline-flex flex-col items-center justify-center px-4 group hover:bg-beige-600",
              active ? "bg-beige-600" : "bg-beige-500"
            )
          }
        >
          <img src={AddIcon} alt="Add" />
          <span className="font-sans text-sm text-gray-500 group-hover:text-rose-600">
            Add
          </span>
        </Link>
      </div>
    </div>
  );
};
