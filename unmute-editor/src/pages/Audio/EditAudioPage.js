import { React, useEffect, useRef, useState } from "react";

import axios from "axios";

import { deleteFile } from "../../api/aws";
import { useDispatch } from "react-redux";
import { useLocation } from "wouter";

import { updateUnmuteInCart } from "../../api/cart";
import { updateUnmutes } from "../../features/user/userSlice";

import { AudioBottomNavigation } from "../../components/AudioBottomNavigation";

import { useActiveUnmute } from "../../api/useUnmutes";

import { AudioVisualizer } from "react-audio-visualize";
import { Loader } from "../../components/Loader";

export const EditAudioPage = () => {
  const audioRef = useRef();
  const dispatch = useDispatch();
  const [_location, navigate] = useLocation();
  const cacheBust = Date.now();
  const { activeUnmute, loading } = useActiveUnmute();
  const [blobAudio, setBlobAudio] = useState();

  const audioFiles = activeUnmute?.properties?._audios || [];

  const handlePlayAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const handlePauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

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

  useEffect(() => {
    if (audioFiles.length > 0) {
      axios
        .get(`${audioFiles[0]}?c=${cacheBust}`, {
          responseType: "blob",
        })
        .then(({ data }) => setBlobAudio(data));
    }
  }, [audioFiles]);

  if (loading) {
    return <div>Loading audio...</div>;
  }

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

        <div className="w-full flex flex-col items-center mt-24">
          {!blobAudio && <Loader size={"w-24 h-24"} />}
          {blobAudio && (
            <AudioVisualizer
              blob={blobAudio}
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
          )}
        </div>
      </div>

      <AudioBottomNavigation
        isRecording={false}
        isPaused={false}
        togglePauseResume={() => {}}
        stopRecording={() => {}}
        playAudio={handlePlayAudio}
        pauseAudio={handlePauseAudio}
        deleteRecording={handleDeleteRecording}
      />
    </>
  );
};
