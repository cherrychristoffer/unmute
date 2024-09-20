import { React, useEffect, useRef, useState } from "react";

import axios from "axios";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { CheckIcon } from "../../assets/icons/icon_check";
import { CloseIcon } from "../../assets/icons/icon_close";
import { deleteFile, getFileUrl, uploadFile } from "../../api/aws";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useParams } from "wouter";
import { useAudioRecorder } from "react-audio-voice-recorder";

import { updateUnmuteInCart } from "../../api/cart";
import {PauseIcon} from "../../assets/icons/icon_pause";
import {PlayIcon} from "../../assets/icons/icon_play";
import { updateUnmutes } from "../../features/user/userSlice";
import { v4 as uuid } from "uuid";
import { AudioBottomNavigation } from "../../components/AudioBottomNavigation";

import { useActiveUnmute } from "../../api/useUnmutes";

import { AudioVisualizer } from "react-audio-visualize";
import { Loader } from "../../components/Loader";
import Range from "./Range";
import audioBufferToWav from "./AudioBuffer";
import { mergeAudio } from "../../api/inspiration";

export const EditAudioPage = () => {
  const {
    startRecording,
    stopRecording,
    togglePauseResume,
    recordingBlob,
    isRecording,
    isPaused,
  } = useAudioRecorder();
  const audioRef = useRef([]);
  const priceGap = 1;
  const dispatch = useDispatch();
  const [_location, navigate] = useLocation();
  const startRefs = useRef([]);
  const endRefs = useRef([]);
  const progressRefs = useRef([]);
  const updateRef = useRef(false);
  const cacheBust = Date.now();
  const { loading } = useActiveUnmute();
  const [audioBlob, setAudioBlob] = useState([]);
  const [duration, setDuration] = useState(10);
  const { id } = useParams();
  const { unmutes } = useSelector((state) => state.user);

  const [rangeMap, setRangeMap] = useState({});

  const userAudio = useSelector((state) => state.user.unmutes);

  const activeUnmute = unmutes?.find((item) => item.properties?._uuid === id);
  const audioFiles = activeUnmute?.properties?._audios || [];

  const handlePlayAudio = (index) => {
    if (audioRef.current[index]) {
      audioRef.current[index].play();
    }
  };

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
          _audios: [fileUrl],
        },
      }).then(({ data }) => {
        dispatch(updateUnmutes(data.items));
        // navigate("/edit-audio");
      });
    });
  }, [recordingBlob]);
  const handlePauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };
  function convertToTimeFormat(seconds) {
    // Round down the seconds to the nearest whole number
    const roundedSeconds = Math.floor(seconds);

    // Calculate minutes and remaining seconds
    const minutes = Math.floor(roundedSeconds / 60);
    const remainingSeconds = roundedSeconds % 60;

    // Format the minutes and seconds with leading zeroes if necessary
    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(remainingSeconds).padStart(2, "0");

    return `${formattedMinutes}:${formattedSeconds}`;
  }

  const mergeAudioData = async () => {
    const result = audioFiles.map((item) => {
      const fileParts = item.file.split("/");

      const folder = fileParts[fileParts.length - 2];
      const fileName = fileParts[fileParts.length - 1];
      return `${folder}/${fileName}`;
    });

    try {
      const responseData = await mergeAudio(result);

      axios
        .get(`${responseData.url}?c=${cacheBust}`, {
          responseType: "blob",
        })
        .then(({ data }) => {
          const minuteData = convertToTimeFormat(responseData.duration);
          const [minutes, seconds] = minuteData?.split(":")?.map(Number);
          const dataSeconds = minutes * 60 + seconds;

          setRangeMap({
            start: 0,
            end: String(dataSeconds),
          });
          const newData = {
            blob: data,
            seconds: dataSeconds,
          };
          const dataArray = [];
          dataArray.push(newData);
          setAudioBlob(dataArray);
          const audio = {
            file: responseData.url,
            countdown: convertToTimeFormat(responseData.duration),
          };

          updateUnmuteInCart({
            key: activeUnmute.key,
            properties: {
              ...activeUnmute.properties,
              _audios: [audio],
            },
          }).then(({ data }) => {
            dispatch(updateUnmutes(data.items));
          });
        })

        .catch((error) => {
          console.error("Error fetching audio:", error);
        });

      // const dataAudio = response
    } catch (e) {
      // console.log("e", e?.response?.data);
    }
  };
  // useEffect(() => {
  //   audioRef.current = audioRef.current || [];

  //   // Set up event listeners for each audio element
  //   audioRef.current.forEach((audioElement, index) => {
  //     const handleLoadedMetadata = () => {
  //       setDurations((prevDurations) => {
  //         const newDurations = [...prevDurations];
  //         newDurations[index] = audioElement.duration;
  //         return newDurations;
  //       });
  //     };

  //     if (audioElement) {
  //       audioElement.addEventListener("loadedmetadata", handleLoadedMetadata);
  //     }

  //     return () => {
  //       if (audioElement) {
  //         audioElement.removeEventListener(
  //           "loadedmetadata",
  //           handleLoadedMetadata
  //         );
  //       }
  //     };
  //   });
  // }, [audioFiles]);

  // useEffect(() => {
  //   const audioElement = audioRef.current;

  //   const handleLoadedMetadata = () => {
  //     setDuration(audioElement.duration);
  //   };

  //   if (audioElement) {
  //     audioElement.addEventListener("loadedmetadata", handleLoadedMetadata);
  //   }

  //   return () => {
  //     if (audioElement) {
  //       audioElement.removeEventListener(
  //         "loadedmetadata",
  //         handleLoadedMetadata
  //       );
  //     }
  //   };
  // }, [audioFiles]);
  const handleDeleteRecording = () => {
    if (audioFiles.length > 0) {
      if (confirm("Are you sure you want to delete this recording?")) {
        deleteFile({
          path: audioFiles[0],
        }).then(() => {
          updateUnmuteInCart({
            key: activeUnmute.key,
            properties: {
              ...activeUnmute.properties,
              _audios: [],
            },
          }).then(({ data }) => {
            dispatch(updateUnmutes(data.items));
            navigate("/orientation");
          });
        });
      }
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

          // Convert the cropped audio buffer to a Blob
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

  // Helper function to convert audio buffer to WAV Blob
  const bufferToWaveBlob = (buffer) => {
    const wavBuffer = audioBufferToWav(buffer); // You'll need an external utility function to convert audio buffer to WAV format
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
  const getMyUserAudio = () => {
    updateRef.current = true;
    audioFiles?.map((item) => {
      axios
        .get(`${item.file}?c=${cacheBust}`, {
          responseType: "blob",
        })
        .then(({ data }) => {
          const [minutes, seconds] = item.countdown?.split(":")?.map(Number);
          const dataSeconds = minutes * 60 + seconds;

          setRangeMap({
            start: 0,
            end: String(dataSeconds),
          });
          const newData = {
            blob: data,
            seconds: dataSeconds,
          };

          const dataArray = [...audioBlob];
          dataArray.push(newData);
          setAudioBlob((prev) => [...prev, newData]);
        })

        .catch((error) => {
          console.error("Error fetching audio:", error);
        });
    });
  };

  useEffect(() => {
    if (audioFiles.length > 0 && !updateRef.current) {
      getMyUserAudio();
    }
  }, [audioFiles, updateRef]);

  if (loading) {
    return <div>Loading audio...</div>;
  }
  const handleCropAudio = async (item, index) => {
    // const myAudio = userAudio.map(state)find((item, index) => item.index == index);
    const myAudio = userAudio.map((state) =>
      state.properties._audios.find(
        (stateIndex, indexData) => index === indexData
      )
    );
    const findActive = userAudio.find(
      (item) => item.properties?._audios?.length > 0
    );

    const myAudioData = myAudio.find((item) => item !== undefined);

    if (myAudioData && Number(rangeMap.start) < Number(rangeMap.end)) {
      const croppedAudioBlob = await cropAudio(
        item.blob,
        rangeMap[index].start,
        rangeMap[index].end
      );

      const regex = /\/([a-f0-9\-]{36})\.wav$/;

      const match = myAudioData.file.match(regex);

      if (match) {
        const identifier = match[1];

        const fileData = new File([croppedAudioBlob], `${identifier}.wav`, {
          type: "audio/wav",
        });

        uploadFile({
          file: new File([croppedAudioBlob], `${identifier}.wav`, {
            type: "audio/wav",
          }),
          path: findActive.properties._uuid,
        }).then(() => {
          const fileUrl = getFileUrl(
            `${findActive.properties._uuid}/${identifier}.wav`
          );

          const dataFind = findActive.properties._audios?.map((item) => {
            if (myAudioData.file === item.file) {
              return {
                file: fileUrl,
                countdown: formatTime(rangeMap[index].end),
              };
            }
            return item;
          });

          updateUnmuteInCart({
            key: activeUnmute.key,
            properties: {
              ...activeUnmute.properties,
              _audios: dataFind,
            },
          }).then(({ data }) => {
            setAudioBlob([]);

            setTimeout(() => {
              dispatch(updateUnmutes(data.items));
              updateRef.current = false;
            }, 500);
          });
        });
      } else {
        console.log("Identifier not found.");
      }
    }
  };
  const goAdd = () => {
    navigate(`start-recording/${id}`);
  };

  const onDragEnd = (result) => {
    const { destination, source } = result;
    if (!destination) return;

    const reorderedItems = Array.from(items);
    const [removed] = reorderedItems.splice(source.index, 1);
    reorderedItems.splice(destination.index, 0, removed);

    setAudioBlob(reorderedItems);
  };
  function calculateValues(startValue, endValue, max, index) {
    const progressElement = progressRefs.current[index];

    if (progressElement) {
      progressElement.style.left = (startValue / max) * 100 + "%";
      progressElement.style.right = 100 - (endValue / max) * 100 + "%";
    }
  }
  const handleChange = (e, index) => {
    const { name, value } = e.target;
    const startValue = parseInt(startRefs.current[index].value);
    const endValue = parseInt(endRefs.current[index].value);

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
      ...prev,
      [index]: {
        start: name === "start" ? updatedStartValue : startValue,
        end: name === "end" ? updatedEndValue : endValue,
      },
    }));

    if (progressRefs.current[index]) {
      calculateValues(
        updatedStartValue,
        updatedEndValue,
        audioBlob[index]?.seconds,
        index
      );
    }
  };

  console.log("audioFiles", audioFiles);

  return (
    <>
      <div className="flex flex-col items-center">
        <h1 className="font-serif text-muld-500 text-6xl mb-4 mt-24">Edit</h1>
        {/* {audioFiles.length > 0 && (
          <audio
            ref={audioRef}
            className="hidden"
            controls="controls"
            src={`${audioFiles[0].file}?c=${cacheBust}`}
          ></audio>
        )} */}

        {audioFiles?.map((item, index) => (
          <audio
            ref={(el) => (audioRef.current[index] = el)}
            className="hidden"
            controls="controls"
            src={`${item.file}?c=${cacheBust}`}
          ></audio>
        ))}
        {audioFiles?.map((item, index) => (
          <div onClick={() => handlePlayAudio(index)}>play</div>
        ))}
        {/* {userAudio?.map((item) => (
          <audio
            ref={audioRef}
            className="hidden"
            controls="controls"
            src={`${item.properties?._audios}?c=${cacheBust}`}
          ></audio>
        ))} */}
        <div className="w-full flex flex-col items-center mt-24">
          {!audioBlob && <Loader size={"w-24 h-24"} />}
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="audioList">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={{ padding: "10px" }}
                >
                  {audioBlob.map((item, index) => (
                    <Draggable
                      key={index}
                      draggableId={`item-${index}`}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="audio-crop mb-5"
                        >
                          <div onClick={() => handleCropAudio(item, index)}>
                            Save{item.seconds}
                          </div>
                          <div className="absolute top-0 bottom-0 -left-[40px] h-full">
                            <PlayIcon
                              onClick={() => handlePlayAudio(index)}
                              color={"fill-rose-100"}
                              size={16}
                              className={
                                "w-[25px] h-[25px] bg-rose-500 rounded-full flex items-center justify-center"
                              }
                            />
                            <PauseIcon
                              onClick={() => handlePlayAudio(index)}
                              color={"fill-rose-100"}
                              size={16}
                              className={
                                "w-[25px] h-[25px] bg-rose-500 rounded-full flex items-center justify-center"
                              }
                            />
                          </div>
                          <div className="absolute top-0 bottom-0 -right-[40px] h-full flex flex-col justify-between">
                            <CheckIcon
                              color={"fill-rose-100"}
                              size={16}
                              className={
                                "w-[25px] h-[25px] bg-rose-500 rounded-full flex items-center justify-center"
                              }
                            />
                            <CloseIcon
                              color={"fill-rose-100"}
                              size={16}
                              className={
                                "w-[25px] h-[25px] bg-rose-500 rounded-full flex items-center justify-center"
                              }
                            />
                          </div>
                          <div className="handle">
                            {item.seconds !== undefined && (
                              <Range
                                min={0}
                                max={item.seconds}
                                range={
                                  rangeMap[index] || {start: 0, end: 100}
                                }
                                handleChange={(e) => handleChange(e, index)}
                                startRef={(ref) =>
                                  (startRefs.current[index] = ref)
                                }
                                endRef={(ref) => (endRefs.current[index] = ref)}
                                progressRef={(ref) =>
                                  (progressRefs.current[index] = ref)
                                }
                              />
                            )}
                            <AudioVisualizer
                              blob={item.blob}
                              width={300}
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
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}{" "}
                  {/* Ensures space is reserved when dragging */}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <div className="mt-16 flex flex-row justify-center items-center gap-4">
          <button
            className="font-serif text-white bg-black border border-rose transition duration-200 ease-out focus:outline-none hover:bg-gray-800 focus:ring-4 focus:ring-rose font-medium rounded-lg px-4 py-2.5 cursor-pointer"
            onClick={goAdd}
          >
            Add new recording
          </button>
          <button
            onClick={mergeAudioData}
            className="font-serif text-white bg-rose-500 border border-rose focus:outline-none hover:bg-rose-600 focus:ring-4 focus:ring-rose font-medium rounded-lg px-8 py-2.5 cursor-pointer"
          >
            Merge
          </button>
        </div>
      </div>

      <AudioBottomNavigation
        isRecording={startRecording}
        isPaused={false}
        togglePauseResume={() => {}}
        // stopRecording={() => {}}
        stopRecording={stopRecording}
        playAudio={handlePlayAudio}
        pauseAudio={handlePauseAudio}
        deleteRecording={handleDeleteRecording}
      />
    </>
  );
};
