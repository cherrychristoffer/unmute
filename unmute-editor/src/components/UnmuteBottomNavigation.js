import { React } from "react";

import clsx from "clsx";

import { Link } from "wouter";

import {NavAddIcon} from "../assets/icons/icon_nav_add";
import {NavCropIcon} from "../assets/icons/icon_nav_crop";
import {NavFrameIcon} from "../assets/icons/icon_nav_frame";
import {NavOrientationIcon} from "../assets/icons/icon_nav_orientation";
import {NavPassepartoutIcon} from "../assets/icons/icon_nav_passepartout";
import {NavReplaceIcon} from "../assets/icons/icon_nav_replace";

const NAVIGATION = [
  {
    to: '/orientation',
    label: 'Orientation',
    icon: <NavOrientationIcon/>
  },
  {
    to: '/frame',
    label: <>Oak&nbsp;Frame</>,
    icon: <NavFrameIcon/>
  },
  {
    to: '/passepartout',
    label: 'Passepartout',
    icon: <NavPassepartoutIcon/>
  },
  {
    to: '/crop',
    label: 'Crop',
    icon: <NavCropIcon/>
  },
  {
    to: '/upload-image',
    label: 'Replace',
    icon: <NavReplaceIcon/>
  },
  {
    to: '/add',
    label: 'Add',
    icon: <NavAddIcon/>
  },
]

export const UnmuteBottomNavigation = () => {
  return (
    <div className="fixed bottom-0 left-0 z-50 w-full bg-beige-300 border-t border-beige-200">
      <div className="grid gap-2 h-full max-w-2xl grid-cols-6 mx-auto font-medium">
        {NAVIGATION.map((item, index) =>
          <Link
            key={index}
            to={item.to}
            className={(active) =>
              clsx(
                "inline-flex flex-col items-center justify-center py-3 group transition duration-200 ease-out hover:bg-beige-400",
                active ? "bg-beige-400" : ""
              )
            }
          >
            {item.icon}
            <p className="font-sans text-sm text-muld-1000 text-center mt-2">
              {item.label}
            </p>
          </Link>
        )}
      </div>
    </div>
  );
};
