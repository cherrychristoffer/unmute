import { React } from "react";

import { Link } from "wouter";

import AddCheckIcon from "../assets/images/buttons/add-check.png";
import DeleteIcon from "../assets/images/buttons/delete.png";
import EditIcon from "../assets/images/buttons/edit.png";
import PauseIcon from "../assets/images/buttons/pause.png";
import PlayIcon from "../assets/images/buttons/play.png";
import RecordIcon from "../assets/images/buttons/record.png";
import RecordingIcon from "../assets/images/buttons/recording.png";

export const AudioBottomNavigation = ({
  isPaused = false,
  togglePauseResume = () => {},
  stopRecording = () => {},
  playAudio = () => {},
  pauseAudio = () => {},
  deleteRecording = () => {},
}) => {
  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-20 bg-beige-500 border-t border-beige-600">
      <div className="grid gap-2 h-full max-w-lg grid-cols-6 mx-auto font-medium">
        <button
          onClick={playAudio}
          className="inline-flex flex-col items-center justify-center px-4 group bg-beige-500 hover:bg-beige-600"
        >
          <img src={PlayIcon} alt="Play" />
          <span className="font-sans text-sm text-gray-500 group-hover:text-rose-600">
            Play
          </span>
        </button>

        <button
          onClick={pauseAudio}
          className="inline-flex flex-col items-center justify-center px-4 group bg-beige-500 hover:bg-beige-600"
        >
          <img src={PauseIcon} alt="Pause" />
          <span className="font-sans text-sm text-gray-500 group-hover:text-rose-600">
            Pause
          </span>
        </button>

        {isPaused ? (
          <button
            onClick={togglePauseResume}
            className="inline-flex flex-col items-center justify-center px-4 group bg-beige-500 hover:bg-beige-600"
          >
            <img src={RecordIcon} alt="Record" />
            <span className="font-sans text-sm text-gray-500 group-hover:text-rose-600">
              Record
            </span>
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="inline-flex flex-col items-center justify-center px-4 group bg-beige-500 hover:bg-beige-600"
          >
            <img src={RecordingIcon} alt="Recording" />
            <span className="font-sans text-sm text-gray-500 group-hover:text-rose-600">
              Recording
            </span>
          </button>
        )}

        <button className="inline-flex flex-col items-center justify-center px-4 group bg-beige-500 hover:bg-beige-600">
          <img src={EditIcon} alt="Edit" />
          <span className="font-sans text-sm text-gray-500 group-hover:text-rose-600">
            Edit
          </span>
        </button>

        <Link
          to="/orientation"
          className="inline-flex flex-col items-center justify-center px-4 group bg-beige-500 hover:bg-beige-600"
        >
          <img src={AddCheckIcon} alt="Add" />
          <span className="font-sans text-sm text-gray-500 group-hover:text-rose-600">
            Add
          </span>
        </Link>

        <button
          onClick={deleteRecording}
          className="inline-flex flex-col items-center justify-center px-4 group bg-beige-500 hover:bg-beige-600"
        >
          <img src={DeleteIcon} alt="Delete" />
          <span className="font-sans text-sm text-gray-500 group-hover:text-rose-600">
            Delete
          </span>
        </button>
      </div>
    </div>
  );
};
