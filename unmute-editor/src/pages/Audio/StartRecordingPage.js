import { React, useEffect, useRef, useState } from "react";

import { useDispatch } from "react-redux";
import { useLocation } from "wouter";

import { AudioBottomNavigation } from "../../components/AudioBottomNavigation";
import { useAudioRecorder } from "react-audio-voice-recorder";
import { v4 as uuid } from "uuid";

import { addUnmute, updateUnmutes } from "../../features/user/userSlice";

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
        console.log("Dataa", data?.items);
        dispatch(addUnmute({ ...data.items?.[0], id: uuid }));
        // dispatch(updateUnmutes(data.items));
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
            <div className="mx-auto flex flex-col items-center">
              <h1 className="font-serif text-muld-1000 text-[50px] mb-4">
                {formatTime(time)}
              </h1>
              {!isPaused && (
                <h2 className="font-serif text-rose-500 text-[17px] text-center leading-tight">
                  Recording
                </h2>
              )}
              {isPaused && (
                <h2 className="font-serif text-rose-500 text-[17px] text-center leading-tight">
                  Your recording is paused
                </h2>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center mt-3 h-96 w-4/5 mx-auto">
        <textarea
          disabled
          className="w-full mt-12 p-4 h-36 border border-rose-200 text-center bg-[#f3f3f3] rounded-lg text-muld-1000 font-light"
          defaultValue={activeUnmute?.properties?._inspiration}
        />
      </div>

      <audio
        ref={audioRef}
        className="hidden"
      >
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
