import { React, useEffect, useRef, useState } from "react";

import { useDispatch } from "react-redux";
import { useLocation } from "wouter";

import { AudioBottomNavigation } from "../../components/AudioBottomNavigation";
import { useAudioRecorder } from "react-audio-voice-recorder";

import { updateUnmutes } from "../../features/user/userSlice";

import { updateUnmuteInCart } from "../../api/cart";

import { getFileUrl, uploadFile } from "../../api/aws";
import { useActiveUnmute } from "../../api/useUnmutes";
import { useInterval } from "../../hooks/useInterval";

const formatTime = (time) => {
  let minutes = Math.floor(time / 60);
  let seconds = time % 60;

  if (seconds < 10) {
    seconds = `0${seconds}`;
  }

  return `${minutes}:${seconds}`;
};

export const StartRecordingPage = () => {
  const {
    startRecording,
    stopRecording,
    togglePauseResume,
    recordingBlob,
    isRecording,
    isPaused,
  } = useAudioRecorder();

  const audioRef = useRef();
  const { activeUnmute } = useActiveUnmute();
  const [countDown, setCountDown] = useState(3);
  const [time, setTime] = useState(0);
  const dispatch = useDispatch();
  const [_location, navigate] = useLocation();

  useInterval(
    () => {
      setTime((prevTime) => prevTime + 1);
    },
    isRecording && !isPaused ? 1000 : null
  );

  useInterval(
    () => {
      setCountDown((prevCountDown) => {
        if (prevCountDown - 1 === 0) {
          startRecording();
        }

        return prevCountDown - 1;
      });
    },
    countDown > 0 ? 1000 : null
  );

  useEffect(() => {
    if (!recordingBlob) return;

    const file = new File([recordingBlob], "recorded.wav", {
      type: "audio/wav",
    });

    uploadFile({
      file,
      path: activeUnmute.properties._uuid,
    }).then(() => {
      const fileUrl = getFileUrl(
        `${activeUnmute.properties._uuid}/recorded.wav`
      );

      updateUnmuteInCart({
        key: activeUnmute.key,
        properties: {
          ...activeUnmute.properties,
          _audios: [fileUrl], // TODO: Add to existing list of audios
        },
      }).then(({ data }) => {
        dispatch(updateUnmutes(data.items));
        navigate("/edit-audio");
      });
    });
  }, [recordingBlob]);

  return (
    <>
      <div className="flex flex-col items-center">
        <div className="mt-6">
          {!isRecording && (
            <div className="relative top-0 flex justify-center mb-3">
              <div className="bg-rose-500 rounded-full w-32 h-32 relative top-0">
                &nbsp;
              </div>
              <div className="mx-2 absolute top-8 text-6xl text-white">
                {countDown}
              </div>
            </div>
          )}

          {isRecording && (
            <div className="text-center">
              <div className="text-8xl text-muld-500 tabular-nums mb-4">
                {formatTime(time)}
              </div>
              {!isPaused && <div className="text-muld-500">Recording</div>}
              {isPaused && (
                <div className="text-muld-500">Your recording is paused</div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center mt-3 h-96">
        <textarea
          disabled
          className="w-11/12 p-4 mt-12 h-full border border-rose-200 bg-gray-100 rounded-lg text-rose-500"
          defaultValue={activeUnmute?.properties?._inspiration}
        />
      </div>

      <audio ref={audioRef} className="hidden">
        <source />
      </audio>

      <AudioBottomNavigation
        isRecording={isRecording}
        isPaused={isPaused}
        togglePauseResume={togglePauseResume}
        stopRecording={stopRecording}
      />
    </>
  );
};
