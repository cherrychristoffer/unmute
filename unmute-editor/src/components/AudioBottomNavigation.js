import clsx from "clsx";

import { React } from "react";

import { Link, useLocation } from "wouter";
import { NavCheckIcon } from "../assets/icons/icon_nav_check";
import { NavCloseIcon } from "../assets/icons/icon_nav_close";
import { NavEditIcon } from "../assets/icons/icon_nav_edit";
import { NavPauseIcon } from "../assets/icons/icon_nav_pause";
import { NavPlayIcon } from "../assets/icons/icon_nav_play";
import { NavRecordingIcon } from "../assets/icons/icon_nav_recording";
import { setScrolltoActive } from "../features/image/imageSlice";
import { useDispatch } from "react-redux";
import { NavAddIcon } from "../assets/icons/icon_nav_add";
import { UploadIcon } from "../assets/icons/icon_audio";

export const AudioBottomNavigation = ({
  isPaused = false,
  togglePauseResume = () => {},
  goAdd = () => {},
  goEditorPage = () => {},
  playAudio = () => {},
  pauseAudio = () => {},
  deleteRecording = () => {},
  mergeAudio = () => {},
}) => {
  const dispatch = useDispatch();
  const [_location, navigate] = useLocation();

  const NAVIGATION = [
    {
      label: "Slet",
      action: deleteRecording,
      icon: <NavCloseIcon />,
    },
    {
      label: "Afspil",
      action: playAudio,
      icon: <NavPlayIcon />,
    },
    {
      label: "Pause",
      action: pauseAudio,
      icon: <NavPauseIcon />,
    },
    {
      label: "Tilføj",

      icon: <NavAddIcon />,
      action: goAdd,
      // action: () => {
      //   // dispatch(setScrolltoActive());
      //   // navigate("/orientation");
      //   goEditorPage
      // },
    },
    // {
    //   label: isPaused ? "Record" : "Recording",
    //   action: isPaused ? togglePauseResume : stopRecording,
    //   icon: <NavRecordingIcon color={isPaused ? "#231F20" : "#d5695a"} />,
    // },
    // {
    //   label: "Edit",
    //   to: "/edit-audio/:id",
    //   icon: <NavEditIcon />,
    // },
    // {
    //   label: isPaused ? "Record" : "Recording",
    //   action: isPaused ? togglePauseResume : stopRecording,
    //   icon: <NavRecordingIcon color={isPaused ? "#231F20" : "#d5695a"} />,
    // },
    {
      label: "Upload",
      // to: "/edit-audio/:id",
      icon: <UploadIcon />,
      action: goEditorPage,
    },

    {
      label: "Færdig",
      // to: "/orientation",
      action: mergeAudio,
      icon: <NavCheckIcon />,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full bg-beige-300 border-t border-beige-200 sm:max-w-max sm:p-3 sm:rounded-xl sm:mx-auto sm:left-0 sm:right-0 sm:bottom-4">
      <div className="grid sm:gap-2 h-full max-w-2xl grid-cols-6 mx-auto font-medium">
        {NAVIGATION.map((item, index) =>
          item.action ? (
            <button
              key={index}
              onClick={item.action}
              className={
                "inline-flex flex-col items-center justify-center py-3 group transition duration-200 ease-out hover:bg-beige-400 sm:px-4 sm:rounded-lg"
              }
            >
              {item.icon}
              <p className="font-sans text-[10px] text-muld-1000 text-center mt-2">
                {item.label}
              </p>
            </button>
          ) : (
            <Link
              key={index}
              to={item.to}
              className={(active) =>
                clsx(
                  "inline-flex flex-col items-center justify-center py-3 group transition duration-200 ease-out hover:bg-beige-400 sm:px-4 sm:rounded-lg",
                  active ? "bg-beige-400" : ""
                )
              }
            >
              {item.icon}
              <p className="font-sans text-[10px] text-muld-1000 text-center mt-2">
                {item.label}
              </p>
            </Link>
          )
        )}
      </div>
    </div>
  );
};
