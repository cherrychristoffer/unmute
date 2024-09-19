import { React, useEffect, useRef, useState } from "react";

import axios from "axios";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import { deleteFile, getFileUrl, uploadFile } from "../../api/aws";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "wouter";
import { useAudioRecorder } from "react-audio-voice-recorder";

import { updateUnmuteInCart } from "../../api/cart";
import {
  setAudioBlob,
  updateUnmute,
  updateUnmutes,
} from "../../features/user/userSlice";
import { v4 as uuid } from "uuid";
import { AudioBottomNavigation } from "../../components/AudioBottomNavigation";

import { useActiveUnmute } from "../../api/useUnmutes";

import { AudioVisualizer } from "react-audio-visualize";
import { Loader } from "../../components/Loader";
import Range from "./Range";
import audioBufferToWav from "./AudioBuffer";

export const EditAudioPage = () => {
  const {
    startRecording,
    stopRecording,
    togglePauseResume,
    recordingBlob,
    isRecording,
    isPaused,
  } = useAudioRecorder();
  const audioRef = useRef();
  const dispatch = useDispatch();
  const [_location, navigate] = useLocation();
  const cacheBust = Date.now();
  const { activeUnmute, loading } = useActiveUnmute();
  const [audioBlob, setAudioBlob] = useState([]);
  const [duration, setDuration] = useState(10);
  const [range, setRange] = useState({
    start: 0,
    end: 0,
  });
  const userAudio = useSelector((state) => state.user.unmutes);
  // const audioBlob = useSelector((state) => state.user.audioBlob);
  const refAudio = useRef(false);

  const audioFiles = activeUnmute?.properties?._audios || [];

  const handlePlayAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
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

  useEffect(() => {
    const audioElement = audioRef.current;

    // Get the duration when metadata is loaded
    const handleLoadedMetadata = () => {
      setDuration(audioElement.duration); // duration in seconds
    };

    if (audioElement) {
      audioElement.addEventListener("loadedmetadata", handleLoadedMetadata);
    }

    // Clean up the event listener when component unmounts
    return () => {
      if (audioElement) {
        audioElement.removeEventListener(
          "loadedmetadata",
          handleLoadedMetadata
        );
      }
    };
  }, [audioFiles]);
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

  useEffect(() => {
    if (userAudio.length > 0) {
      userAudio?.map((item) => {
        if (item.properties._audios?.length > 0) {
          item.properties._audios.map((state) =>
            axios
              .get(`${state.file}?c=${cacheBust}`, {
                responseType: "blob",
              })
              .then(({ data }) => {
                console.log("data", data);

                const [minutes, seconds] = state.countdown
                  ?.split(":")
                  ?.map(Number);
                const dataSeconds = minutes * 60 + seconds;

                setRange({
                  start: 0,
                  end: String(dataSeconds),
                });
                const newData = {
                  blob: data,
                  seconds: dataSeconds,
                };

                const dataArray = [...audioBlob];

                dataArray.push(newData);
                setAudioBlob(dataArray);
                // dispatch((prevState) => setAudioBlob(...prevState, dataArray));
              })
              .catch((error) => {
                console.error("Error fetching audio:", error);
              })
          );
        }
      });
    }
  }, [userAudio]);
  console.log("auti", audioBlob);

  if (loading) {
    return <div>Loading audio...</div>;
  }
  const handleCropAudio = async () => {
    if (audioBlob && range.start < range.end) {
      const croppedAudioBlob = await cropAudio(
        audioBlob[0].blob,
        range.start,
        range.end
      );

      // Now you have the cropped audio blob, and you can upload it or play it
      uploadFile({
        file: new File([croppedAudioBlob], "cropped-recording.wav", {
          type: "audio/wav",
        }),
        path: activeUnmute.properties._uuid,
      }).then(() => {
        const fileUrl = getFileUrl(
          `${activeUnmute.properties._uuid}/cropped-recording.wav`
        );

        updateUnmuteInCart({
          key: activeUnmute.key,
          properties: {
            ...activeUnmute.properties,
            _audios: [fileUrl],
          },
        }).then(({ data }) => {
          dispatch(updateUnmute({ ...data, id: uuid }));
        });
      });
    }
  };
  const dataDrag = [
    { id: 1, text: "fewfwefewfwe" },
    { id: 2, text: "fewftttttwefewfwe" },
    { id: 3, text: "fewfweffeggggewfwe" },
  ];
  const goAdd = () => {
    navigate("start-recording");
  };
  const onDragEnd = (result) => {
    console.log("result", result);

    const { destination, source } = result;
    if (!destination) return;

    const reorderedItems = Array.from(audioBlob);
    const [removed] = reorderedItems.splice(source.index, 1);
    reorderedItems.splice(destination.index, 0, removed);

    setAudioBlob(reorderedItems);
  };
  return (
    <>
      <div className="flex flex-col items-center">
        <h1 className="font-serif text-muld-500 text-6xl mb-4 mt-24">Edit</h1>
        {audioFiles.length > 0 && (
          <audio
            ref={audioRef}
            className="hidden"
            controls="controls"
            src={`${audioFiles[0]}?c=${cacheBust}`}
          ></audio>
        )}
        {/* {userAudio?.map((item) => (
          <audio
            ref={audioRef}
            className="hidden"
            controls="controls"
            src={`${item.properties?._audios}?c=${cacheBust}`}
          ></audio>
        ))} */}
        <div onClick={goAdd}> click</div>
        <div className="w-full flex flex-col items-center mt-24">
          {!audioBlob && <Loader size={"w-24 h-24"} />}

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="audioList">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef} // Important to pass the ref
                  style={{ padding: "10px" }} // Optional: Add any styling you want
                >
                  {audioBlob.map((item, index) => (
                    <Draggable
                      key={index}
                      draggableId={`item-${index}`}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef} // Important to pass the ref
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="audio-crop"
                        >
                          <div onClick={handleCropAudio}>Save{index}</div>
                          <div className="handle">
                            {range.end !== 0 && (
                              <Range
                                max={duration}
                                range={range}
                                setRange={setRange}
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
      </div>

      <AudioBottomNavigation
        isRecording={false}
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
