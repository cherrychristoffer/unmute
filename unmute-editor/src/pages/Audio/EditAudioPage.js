import { Fragment, React, memo, useEffect, useRef, useState } from "react";

import axios from "axios";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { deleteFile, getFileUrl, uploadFile } from "../../api/aws";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useParams } from "wouter";
import { useAudioRecorder } from "react-audio-voice-recorder";

import { updateUnmuteInCart } from "../../api/cart";
import { updateUnmute, updateUnmutes } from "../../features/user/userSlice";
import { v4 as uuid } from "uuid";
import { AudioBottomNavigation } from "../../components/AudioBottomNavigation";

import { useActiveUnmute } from "../../api/useUnmutes";

import { Loader } from "../../components/Loader";
import { mergeAudio } from "../../api/inspiration";
import { AudioComponent } from "./AudioComponent";

export const EditAudioPage = () => {
  const {
    startRecording,
    stopRecording,
    togglePauseResume,
    recordingBlob,
    isRecording,
    isPaused,
  } = useAudioRecorder();
  const audioRef = useRef({});
  const dispatch = useDispatch();
  const [_location, navigate] = useLocation();
  const updateRef = useRef(false);
  const cacheBust = Date.now();
  const { loading } = useActiveUnmute();
  const [audioBlob, setAudioBlob] = useState([]);
  const { id: unmuteId } = useParams();
  const { unmutes, isLoadingUnmutes } = useSelector((state) => state.user);
  const [activeAudio, setActiveAudio] = useState(null);
  const [isLoading, setIsLoading] = useState({});
  const activeAudioRef = useRef(null);
  const allAudioRefs = useRef({});

  const [rangeMap, setRangeMap] = useState({});

  const activeUnmute = unmutes?.find(
    (item) => item.properties?._uuid === unmuteId
  );
  const audioFiles = activeUnmute?.properties?._audios || [];

  const dontShowAddTrack = audioFiles?.find((item) => item.notRecorded);

  const handlePlayAudio = (id) => {
    if (!audioRef.current) return;
    const audios = { ...audioRef.current };

    for (let key in audios) {
      const item = audioRef.current?.[key];

      if (key === id) {
        setActiveAudio(id);
        activeAudioRef.current = id;
        if (rangeMap[key]?.start) item.currentTime = rangeMap[key]?.start ?? 0;

        item.play();
        // console.log("key", key);
        // console.log("rangeMap[key]?.end", rangeMap[key]?.end);
        // if (rangeMap[key]?.end) {
        //   item.addEventListener("timeupdate", function () {
        //     if (item.currentTime >= rangeMap[key]?.end) {
        //       console.log(`Paus ${key} ${item.currentTime}`);
        //       item?.pause();
        //       setActiveAudio(null);
        //     }
        //   });
        // }
      } else {
        item?.pause();
      }
    }
  };

  const handlePauseAudio = (id) => {
    if (audioRef.current[id]) {
      audioRef.current[id].pause();
      setActiveAudio(null);
    }
  };

  function convertToTimeFormat(seconds) {
    const roundedSeconds = Math.floor(seconds);

    const minutes = Math.floor(roundedSeconds / 60);
    const remainingSeconds = roundedSeconds % 60;

    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(remainingSeconds).padStart(2, "0");

    return `${formattedMinutes}:${formattedSeconds}`;
  }

  const mergeAudioData = async () => {
    if (audioFiles?.length > 1) {
      setIsLoading((prev) => ({ ...prev, isMerged: true }));
      const sortedData = audioBlob.sort((a, b) => a.index - b.index);

      const result = sortedData.map((item) => {
        const fileParts = item.fileData.file.split("/");

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
            const audio = {
              file: responseData.url,
              countdown: convertToTimeFormat(responseData.duration),
            };
            const newData = {
              blob: data,
              fileData: audio,
              seconds: dataSeconds,
              uuid: uuid(),
            };

            updateUnmuteInCart({
              key: activeUnmute.key,
              properties: {
                ...activeUnmute.properties,
                _audios: [audio],
              },
            }).then(({ data }) => {
              setIsLoading((prev) => ({ ...prev, isMerged: false }));
              const dataArray = [];
              dataArray.push(newData);
              setAudioBlob(dataArray);
              const activeItem = data.items.find(
                (item) =>
                  item.properties._uuid === activeUnmute.properties._uuid
              );
              dispatch(updateUnmute(activeItem));
            });
          })

          .catch((error) => {
            console.error("Error fetching audio:", error);
            setIsLoading((prev) => ({ ...prev, isMerged: true }));
          });
      } catch (e) {}
    }
    navigate("/orientation");
  };

  const handleAllDeleteRecording = () => {
    updateUnmuteInCart({
      key: activeUnmute.key,
      properties: {
        ...activeUnmute.properties,
        _audios: [],
      },
    }).then(({ data }) => {
      const activeItem = data.items.find(
        (item) => item.properties._uuid === activeUnmute.properties._uuid
      );
      dispatch(updateUnmute(activeItem));
      setAudioBlob([]);
    });
  };

  // const handleDeleteRecording = (item) => {
  //   if (confirm("Slet LYDFIL? Dette kan ikke gøres om")) {
  //     deleteFile({
  //       path: item?.fileData?.file,
  //     }).then(() => {
  //       updateUnmuteInCart({
  //         key: activeUnmute.key,
  //         properties: {
  //           ...activeUnmute.properties,
  //           _audios: activeUnmute.properties?._audios.filter(
  //             (audio) => audio.file !== item.fileData.file
  //           ),
  //         },
  //       }).then(({ data }) => {
  //         const activeItem = data.items.find(
  //           (item) => item.properties._uuid === activeUnmute.properties._uuid
  //         );
  //         dispatch(updateUnmute(activeItem));
  //         // dispatch(updateUnmutes(data.items));
  //         setAudioBlob((prev) =>
  //           prev.filter((audio) => audio.uuid !== item.uuid)
  //         );
  //       });
  //     });
  //   }
  // };

  // const cropAudio = async (blob, start, end) => {
  //   const audioContext = new (window.AudioContext ||
  //     window.webkitAudioContext)();
  //   const arrayBuffer = await blob.arrayBuffer();

  //   return new Promise((resolve, reject) => {
  //     audioContext.decodeAudioData(
  //       arrayBuffer,
  //       (audioBuffer) => {
  //         const sampleRate = audioBuffer.sampleRate;
  //         const startSample = Math.floor(start * sampleRate);
  //         const endSample = Math.floor(end * sampleRate);

  //         const croppedBuffer = audioContext.createBuffer(
  //           audioBuffer.numberOfChannels,
  //           endSample - startSample,
  //           sampleRate
  //         );

  //         for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
  //           croppedBuffer.copyToChannel(
  //             audioBuffer.getChannelData(i).subarray(startSample, endSample),
  //             i
  //           );
  //         }

  //         audioContext.createBufferSource().buffer = croppedBuffer;

  //         const offlineAudioContext = new OfflineAudioContext(
  //           croppedBuffer.numberOfChannels,
  //           croppedBuffer.length,
  //           croppedBuffer.sampleRate
  //         );

  //         const source = offlineAudioContext.createBufferSource();
  //         source.buffer = croppedBuffer;
  //         source.connect(offlineAudioContext.destination);
  //         source.start();

  //         offlineAudioContext.startRendering().then((renderedBuffer) => {
  //           const wavBlob = bufferToWaveBlob(renderedBuffer);
  //           resolve(wavBlob);
  //         });
  //       },
  //       reject
  //     );
  //   });
  // };

  // const bufferToWaveBlob = (buffer) => {
  //   const wavBuffer = audioBufferToWav(buffer);
  //   return new Blob([wavBuffer], { type: "audio/wav" });
  // };
  // const formatTime = (time) => {
  //   let minutes = Math.floor(time / 60);
  //   let seconds = time % 60;

  //   if (seconds < 10) {
  //     seconds = `0${seconds}`;
  //   }

  //   return `${minutes}:${seconds}`;
  // };
  const getMyUserAudio = () => {
    updateRef.current = true;
    audioFiles?.map((item, i) => {
      setIsLoading((prev) => ({ ...prev, [item.file]: true }));
      axios
        .get(`${item.file}?c=${cacheBust}`, {
          responseType: "blob",
        })
        .then(({ data }) => {
          const [minutes, seconds] = item.countdown?.split(":")?.map(Number);
          const dataSeconds = minutes * 60 + seconds;

          const id = uuid();

          const newData = {
            blob: data,
            fileData: item,
            seconds: dataSeconds,
            uuid: id,
            index: i,
          };

          setRangeMap((prev) => ({
            ...prev,
            start: 0,
            end: Number(dataSeconds),
            [id]: {
              start: 0,
              end: Number(dataSeconds) * 1000,
            },
          }));

          setAudioBlob((prev) => [...prev, newData]);
          setIsLoading((prev) => ({ ...prev, [item.file]: false }));
        })
        .catch((error) => {
          setIsLoading((prev) => ({ ...prev, [item.file]: false }));
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

  // const handleCropAudio = async (item, id) => {
  //   if (Number(rangeMap.start) < Number(rangeMap.end)) {
  //     const croppedAudioBlob = await cropAudio(
  //       item.blob,
  //       rangeMap[id].start,
  //       rangeMap[id].end / 1000
  //     );

  //     uploadFile({
  //       file: new File(
  //         [croppedAudioBlob],
  //         item.fileData.file.split("/").at(-1)
  //       ),
  //       path: unmuteId,
  //     }).then(() => {
  //       const fileUrl = getFileUrl(
  //         `${unmuteId}/${item.fileData.file.split("/").at(-1)}`
  //       );

  //       const audios = activeUnmute.properties._audios?.map((state) => {
  //         if (item.fileData.file === state.file) {
  //           return {
  //             file: fileUrl,
  //             countdown: formatTime(rangeMap[id].end - rangeMap[id].start),
  //             notRecorded: state?.notRecorded,
  //           };
  //         }
  //         return state;
  //       });
  //       updateUnmuteInCart({
  //         key: activeUnmute.key,
  //         properties: {
  //           ...activeUnmute.properties,
  //           _audios: audios,
  //         },
  //       }).then(({ data }) => {
  //         setAudioBlob([]);

  //         setTimeout(() => {
  //           dispatch(updateUnmutes(data.items));
  //           updateRef.current = false;
  //         }, 500);
  //       });
  //     });
  //   }
  // };
  const newSecond = audioBlob.reduce((acc, item) => acc + item.seconds, 0);

  const goAdd = () => {
    navigate(`start-recording/${unmuteId}?seconds=${newSecond}`);
  };

  const goEditorPage = () => {
    navigate(`audio-upload/${unmuteId}`);
  };

  const onDragEnd = (result) => {
    const { destination, source } = result;
    if (!destination) return;

    const reorderedItems = Array.from(audioBlob);
    const [removed] = reorderedItems.splice(source.index, 1);
    reorderedItems.splice(destination.index, 0, removed);
    const sortedItems = reorderedItems.map((item, index) => ({
      ...item,
      index,
    }));
    const fileDataArray = sortedItems.map((item) => item.fileData);

    updateUnmuteInCart({
      key: activeUnmute.key,
      properties: {
        ...activeUnmute.properties,
        _audios: fileDataArray,
      },
    }).then(({ data }) => {
      const activeItem = data.items.find(
        (item) => item.properties._uuid === activeUnmute.properties._uuid
      );
      dispatch(updateUnmute(activeItem));
    });
    setAudioBlob(sortedItems);
  };

  // function calculateValues(startValue, endValue, max, id) {
  //   const progressElement = progressRefs.current[id];

  //   if (progressElement) {
  //     progressElement.style.left = (startValue / max) * 100 + "%";
  //     progressElement.style.right = 100000 - (endValue / max) * 100 + "%";
  //   }
  // }
  // const handleChange = (e, id) => {
  //   const { name, value } = e.target;
  //   const startValue = parseInt(startRefs.current[id].value);
  //   const endValue = parseInt(endRefs.current[id].value);
  //   setCropId(id);
  //   let updatedStartValue = startValue;
  //   let updatedEndValue = endValue;

  //   if (endValue - startValue < priceGap) {
  //     if (name === "start") {
  //       updatedStartValue = endValue - priceGap;
  //     } else {
  //       updatedEndValue = startValue + priceGap;
  //     }
  //   }

  //   setRangeMap((prev) => ({
  //     ...prev,
  //     [id]: {
  //       start: name === "start" ? updatedStartValue : startValue,
  //       end: name === "end" ? updatedEndValue : endValue,
  //     },
  //   }));

  //   if (progressRefs.current[id]) {
  //     calculateValues(
  //       updatedStartValue,
  //       updatedEndValue,
  //       audioBlob[id]?.seconds,
  //       id
  //     );
  //   }
  // };

  const showLoading = () => {
    if (isLoadingUnmutes) return true;
    for (let key in isLoading) {
      if (isLoading[key]) return true;
    }
    return false;
  };

  const sortedData = audioBlob.sort((a, b) => a.index - b.index);

  const pauseAllAudios = () => {
    if (!allAudioRefs.current) return;
    console.log("allAudioRefs.current", allAudioRefs.current);
    const audios = { ...allAudioRefs.current };
    for (let key in audios) {
      allAudioRefs.current?.[key]?.pause();
    }
  };

  return (
    <div className={"pb-[90px]"}>
      <div className="flex flex-col items-center">
        <h1 className="font-serif text-muld-500 text-6xl mb-4 mt-24">
          Rediger
        </h1>
        <p className="font-serif text-muld-400 text-3xl mb-4">(max 10min)</p>
        <div className="w-full flex flex-col items-center pt-24">
          {!audioBlob && <Loader size={"w-24 h-24"} />}
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable type="group" droppableId="audioList">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={{ padding: "10px" }}
                >
                  {sortedData.map((item, index) => (
                    <AudioComponent
                      cacheBust={cacheBust}
                      activeAudio={activeAudio}
                      setActiveAudio={setActiveAudio}
                      item={item}
                      allAudioRefs={allAudioRefs}
                      index={index}
                      key={item.uuid}
                      pauseAllAudios={pauseAllAudios}
                      activeUnmute={activeUnmute}
                      setAudioBlob={setAudioBlob}
                      updateRef={updateRef}
                    />
                  ))}
                  {provided.placeholder}{" "}
                  {/* Ensures space is reserved when dragging */}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {showLoading() && (
          <div>
            <Loader size={"w-24 h-24"} />
          </div>
        )}

        <div className="mt-16 flex flex-row justify-center items-center gap-4">
          <button
            className={`font-serif text-white bg-black border border-rose transition duration-200 ease-out focus:outline-none hover:bg-gray-800 focus:ring-4 focus:ring-rose font-medium rounded-lg px-4 py-2.5 cursor-pointer 
              ${dontShowAddTrack ? " cursor-default" : ""}`}
            onClick={goAdd}
            style={{ opacity: dontShowAddTrack ? "0.5" : "1" }}
            disabled={dontShowAddTrack}
          >
            Tilføj en optagelse mere
          </button>
          {/* {audioFiles?.length > 1 && (
            <button
              onClick={mergeAudioData}
              className="font-serif text-white bg-rose-500 border border-rose focus:outline-none hover:bg-rose-600 focus:ring-4 focus:ring-rose font-medium rounded-lg px-8 py-2.5 cursor-pointer"
            >
              Merge
            </button>
          )} */}
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
        deleteRecording={handleAllDeleteRecording}
        goEditorPage={goEditorPage}
        mergeAudio={mergeAudioData}
      />
    </div>
  );
};
