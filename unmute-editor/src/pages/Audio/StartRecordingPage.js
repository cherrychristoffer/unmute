import { React, useEffect, useRef, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import TextareaAutosize from "react-textarea-autosize";
import { useLocation, useParams } from "wouter";

import { AudioBottomNavigation } from "../../components/AudioBottomNavigation";
import { useAudioRecorder } from "react-audio-voice-recorder";
import { v4 as uuid } from "uuid";
import { updateUnmutes } from "../../features/user/userSlice";

import { updateUnmuteInCart } from "../../api/cart";

import { getFileUrl, uploadFile } from "../../api/aws";
import { useActiveUnmute } from "../../api/useUnmutes";
import { useInterval } from "../../hooks/useInterval";
import { convertToWav } from "./convertToWav";
import { convertMp4ToWav } from "./convertMp4ToWav";
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
  } = useAudioRecorder({ downloadFileExtension: "wav" });

  const audioRef = useRef();
  const { activeUnmute } = useActiveUnmute();
  const [isRecordingValidate, setIsRecordingValidate] = useState(0);
  const [countDown, setCountDown] = useState(3);
  const [time, setTime] = useState(0);

  const dispatch = useDispatch();
  const [_location, navigate] = useLocation();
  const { id } = useParams();
  const getQueryParams = (url) => {
    const params = new URLSearchParams(
      new URL(url, window.location.origin).search
    );
    return params.get("seconds");
  };
  const seconds = getQueryParams(location);

  useEffect(() => {
    setIsRecordingValidate(Number(seconds));
  }, []);
  useEffect(() => {
    if (isRecordingValidate >= 600) {
      stopRecording();
    }
  }, [isRecordingValidate]);
  useInterval(
    () => {
      setTime((prevTime) => prevTime + 1);
      setIsRecordingValidate((prevTime) => prevTime + 1);
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
    async function add() {
      let wavBlob = null;
      if (recordingBlob.type === "audio/mp4") {
        wavBlob = await convertMp4ToWav(recordingBlob);
      } else {
        wavBlob = await convertToWav(recordingBlob);
      }

      //"recorded.wav"
      const newUuid = uuid();
      const file = new File([wavBlob], `${newUuid}.wav`, {
        type: "audio/wav",
      });

      uploadFile({
        file,
        path: activeUnmute.properties._uuid,
      }).then(() => {
        const fileUrl = getFileUrl(
          `${activeUnmute.properties._uuid}/${newUuid}.wav`
        );

        const audio = {
          file: fileUrl,
          countdown: formatTime(time),
          // notRecorded: isRecordingValidate >= 600 ? true : false,
        };

        updateUnmuteInCart({
          key: activeUnmute.key,
          properties: {
            ...activeUnmute.properties,
            _audios: [...activeUnmute.properties._audios, audio],
          },
        }).then(({ data }) => {
          // dispatch(updateUnmutes(data.items));
          // data?.items.map((item) =>
          //   // dispatch(updateUnmute({ ...item, id: uuid }))
          //   dispatch(updateUnmutes(item.items))
          // );
          // dispatch(addAudioUnmute(data.items));
          dispatch(updateUnmutes(data.items));
          navigate(`/edit-audio/${id}`);
        });
      });
    }

    add();
  }, [recordingBlob]);

  return (
    <div className={"pb-[80px] pt-10"}>
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

      <div className="flex flex-col items-center mt-3 w-4/5 mx-auto">
        <TextareaAutosize
          disabled
          minRows={4}
          className="w-full mt-12 p-4 border border-rose-200 text-center bg-[#f3f3f3] rounded-lg text-muld-1000 font-light"
          defaultValue={activeUnmute?.properties?._inspiration}
        />

        <button
          onClick={stopRecording}
          className="text-white bg-rose-500 border border-rose transition duration-200 ease-out outline-none hover:bg-rose-900 font-medium rounded-lg px-8 py-2.5 cursor-pointer mt-10"
        >
          Stop recording
        </button>
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
    </div>
  );
};
