import React, { memo, useRef, useState } from "react";
import { AudioTag } from "./AudioTag";
import { Draggable } from "react-beautiful-dnd";

import { PauseIcon } from "../../assets/icons/icon_pause";
import { PlayIcon } from "../../assets/icons/icon_play";
import Range from "./Range";
import { AudioVisualizer } from "react-audio-visualize";
import { CheckIcon } from "../../assets/icons/icon_check";
import { CloseIcon } from "../../assets/icons/icon_close";
import { deleteFile, getFileUrl, uploadFile } from "../../api/aws";
import audioBufferToWav from "./AudioBuffer";
import { useParams } from "wouter";
import { updateUnmuteInCart } from "../../api/cart";
import { updateUnmute, updateUnmutes } from "../../features/user/userSlice";
import { useDispatch } from "react-redux";

export const AudioComponent = ({
  item,
  pauseAllAudios,
  index,
  allAudioRefs,
  cacheBust,
  setActiveAudio,
  activeAudio,
  activeUnmute,
  setAudioBlob,
  updateRef,
}) => {
  const dispatch = useDispatch();
  const audioRef = useRef(null);
  const progressRefs = useRef(null);
  const startRef = useRef(null);
  const endRef = useRef(null);
  const [isCropping, setIsCropping] = useState(false);
  const { id: unmuteId } = useParams();
  const [canPlay, setCanPlay] = useState(false);

  const [rangeMap, setRangeMap] = useState({
    start: 0,
    end: item?.seconds * 1000,
  });
  const priceGap = 1;

  function timeupdate(e) {
    const element = e.target;
    if (element.currentTime >= rangeMap?.end / 1000) {
      audioRef.current?.pause();
      setActiveAudio((prev) => ({ ...prev, [item.uuid]: false }));
    }
  }

  const handleAudioEnded = () => {
    setActiveAudio((prev) => ({ ...prev, [item.uuid]: false }));
    audioRef.current?.removeEventListener("timeupdate", timeupdate);
  };

  const handlePlayAudio = () => {
    if (!audioRef.current) return;
    pauseAllAudios();
    setActiveAudio((prev) => ({ ...prev, [item.uuid]: true }));
    if (rangeMap?.start)
      audioRef.current.currentTime = rangeMap?.start
        ? rangeMap?.start / 1000
        : 0;
    audioRef.current.play();
    if (rangeMap?.end) {
      audioRef.current.addEventListener("timeupdate", timeupdate);
    }
  };

  const handlePauseAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef?.current?.removeEventListener("timeupdate", timeupdate);

    setActiveAudio((prev) => ({ ...prev, [item.uuid]: false }));
  };

  function calculateValues(startValue, endValue, max, id) {
    const progressElement = progressRefs.current;

    if (progressElement) {
      progressElement.style.left = (startValue / max) * 100 + "%";
      progressElement.style.right = 100000 - (endValue / max) * 100 + "%";
    }
  }

  const handleChange = (e, id) => {
    const { name, value } = e.target;
    const startValue = parseInt(startRef.current?.value);
    const endValue = parseInt(endRef.current?.value);
    setIsCropping(true);
    let updatedStartValue = startValue;
    let updatedEndValue = endValue;

    if (endValue - startValue < priceGap) {
      if (name === "start") {
        updatedStartValue = endValue - priceGap;
      } else {
        updatedEndValue = startValue + priceGap;
      }
    }

    setRangeMap((prev) => ({
      start: name === "start" ? updatedStartValue : startValue,
      end: name === "end" ? updatedEndValue : endValue,
    }));

    if (progressRefs.current) {
      calculateValues(updatedStartValue, updatedEndValue, item?.seconds, id);
    }
  };

  const cropAudio = async (blob, start, end) => {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const arrayBuffer = await blob.arrayBuffer();

    return new Promise((resolve, reject) => {
      audioContext.decodeAudioData(
        arrayBuffer,
        (audioBuffer) => {
          const sampleRate = audioBuffer.sampleRate;
          const startSample = Math.floor(start * sampleRate);
          const endSample = Math.floor(end * sampleRate);

          const croppedBuffer = audioContext.createBuffer(
            audioBuffer.numberOfChannels,
            endSample - startSample,
            sampleRate
          );

          for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
            croppedBuffer.copyToChannel(
              audioBuffer.getChannelData(i).subarray(startSample, endSample),
              i
            );
          }

          audioContext.createBufferSource().buffer = croppedBuffer;

          const offlineAudioContext = new OfflineAudioContext(
            croppedBuffer.numberOfChannels,
            croppedBuffer.length,
            croppedBuffer.sampleRate
          );

          const source = offlineAudioContext.createBufferSource();
          source.buffer = croppedBuffer;
          source.connect(offlineAudioContext.destination);
          source.start();

          offlineAudioContext.startRendering().then((renderedBuffer) => {
            const wavBlob = bufferToWaveBlob(renderedBuffer);
            resolve(wavBlob);
          });
        },
        reject
      );
    });
  };

  const bufferToWaveBlob = (buffer) => {
    const wavBuffer = audioBufferToWav(buffer);
    return new Blob([wavBuffer], { type: "audio/wav" });
  };
  const formatTime = (time) => {
    let minutes = Math.floor(time / 60);
    let seconds = time % 60;

    if (seconds < 10) {
      seconds = `0${seconds}`;
    }

    return `${minutes}:${seconds}`;
  };

  const onErrorHandle = (e) => {
    setActiveAudio((prev) => ({ ...prev, [item.uuid]: false }));
  };

  const handleCropAudio = async (item, id) => {
    if (Number(rangeMap.start) < Number(rangeMap.end)) {
      const startAudio = rangeMap.start / 1000;
      const endAudio = rangeMap.end / 1000;
      setIsCropping(false);
      const croppedAudioBlob = await cropAudio(item.blob, startAudio, endAudio);
      uploadFile({
        file: new File(
          [croppedAudioBlob],
          item.fileData.file.split("/").at(-1)
        ),
        path: unmuteId,
      }).then(() => {
        const fileUrl = getFileUrl(
          `${unmuteId}/${item.fileData.file.split("/").at(-1)}`
        );

        const audios = activeUnmute.properties._audios?.map((state) => {
          if (item.fileData.file === state.file) {
            return {
              file: fileUrl,
              countdown: formatTime(endAudio - startAudio),
              notRecorded: state?.notRecorded,
            };
          }
          return state;
        });
        updateUnmuteInCart({
          key: activeUnmute.key,
          properties: {
            ...activeUnmute.properties,
            _audios: audios,
          },
        }).then(({ data }) => {
          setAudioBlob([]);

          setTimeout(() => {
            dispatch(updateUnmutes(data.items));
            updateRef.current = false;
          }, 500);
        });
      });
    }
  };

  function convertSeconds(seconds) {
    if (!seconds) return null;
    seconds = Math.round(seconds);
    if (seconds < 60) {
      return `${seconds} sek`;
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}min ${remainingSeconds.toString().padStart(2, "0")}sek`;
  }

  return (
    <>
      <AudioTag
        audioRef={audioRef}
        setCanPlay={setCanPlay}
        allAudioRefs={allAudioRefs}
        uuid={item.uuid}
        onErrorHandle={onErrorHandle}
        handleAudioEnded={handleAudioEnded}
        file={`${item.fileData.file}?c=${cacheBust}`}
      />
      <Draggable
        key={item.uuid}
        draggableId={item.uuid}
        index={index}
        filter="input"
        preventOnFilter="false"
      >
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="audio-crop mb-5"
          >
            <div>{convertSeconds(item?.seconds)}</div>

            <div className="handle">
              {item?.seconds !== undefined && (
                <Range
                  min={0}
                  max={item?.seconds * 1000}
                  range={rangeMap}
                  handleChange={(e) => handleChange(e, item.uuid)}
                  startRef={(ref) => (startRef.current = ref)}
                  endRef={(ref) => (endRef.current = ref)}
                  progressRef={(ref) => (progressRefs.current = ref)}
                />
              )}
              <AudioVisualizer
                blob={item.blob}
                width={250}
                height={82}
                barWidth={1}
                gap={4}
                backgroundColor="#F3F3F3"
                barColor="#B0928C"
                style={{
                  borderRadius: 4,
                  maxWidth: "100%",
                  borderWidth: "1px",
                  borderColor: "#B0928C",
                }}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="relative">
                {activeAudio[item.uuid] ? (
                  <button
                    onClick={() => handlePauseAudio()}
                    className={"block"}
                  >
                    <PauseIcon
                      color={"fill-rose-100"}
                      size={16}
                      className={
                        "w-[25px] h-[25px] bg-rose-500 rounded-full flex items-center justify-center"
                      }
                    />
                  </button>
                ) : (
                  <button
                    onClick={() => handlePlayAudio()}
                    disabled={!canPlay}
                    className={"block"}
                    style={{ opacity: canPlay ? "1" : "0.5" }}
                  >
                    <PlayIcon
                      color={"fill-rose-100"}
                      size={16}
                      className={
                        "w-[25px] h-[25px] bg-rose-500 rounded-full flex items-center justify-center"
                      }
                    />
                  </button>
                )}
              </div>
              <div className="ml-auto relative">
                {isCropping && (
                  <button
                    className={
                      "px-4 h-[25px] py-1 bg-rose-500 rounded-lg flex items-center justify-center text-white text-[12px]"
                    }
                    onClick={() => handleCropAudio(item, item.uuid)}
                  >
                    <span>OK</span>
                  </button>
                )}

                {/* <button
                onClick={() => handleDeleteRecording(item)}
              >
                <CloseIcon
                  color={"fill-rose-100"}
                  size={16}
                  className={
                    "w-[25px] h-[25px] bg-rose-500 rounded-full flex items-center justify-center"
                  }
                />
              </button> */}
              </div>
            </div>
          </div>
        )}
      </Draggable>
    </>
  );
};
