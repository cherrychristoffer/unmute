import { React, useEffect, useRef, useState } from "react";

import axios from "axios";

import { deleteFile, getFileUrl, uploadFile } from "../../api/aws";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "wouter";
import { useAudioRecorder } from "react-audio-voice-recorder";

import { updateUnmuteInCart } from "../../api/cart";
import { updateUnmutes } from "../../features/user/userSlice";

import { AudioBottomNavigation } from "../../components/AudioBottomNavigation";

import { useActiveUnmute } from "../../api/useUnmutes";

import { AudioVisualizer } from "react-audio-visualize";
import { Loader } from "../../components/Loader";

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
  const [duration, setDuration] = useState(0);
  const [blobAudio, setBlobAudio] = useState([]);
  const userAudio = useSelector((state) => state.user.unmutes);

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
          _audios: [fileUrl], // TODO: Add to existing list of audios
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

  useEffect(() => {
    if (userAudio.length > 0) {
      userAudio?.map((item) =>
        axios
          .get(`${item.properties?._audios}?c=${cacheBust}`, {
            responseType: "blob",
          })
          .then(({ data }) => {
            const arr = [];
            arr.push(data);
            setBlobAudio((prevBlobAudio) => [...prevBlobAudio, ...arr]);
          })
      );
    }
  }, [userAudio]);

  if (loading) {
    return <div>Loading audio...</div>;
  }

  const goAdd = () => {
    navigate("start-recording");
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
        {userAudio?.map((item) => (
          <audio
            ref={audioRef}
            className="hidden"
            controls="controls"
            src={`${item.properties?._audios}?c=${cacheBust}`}
          ></audio>
        ))}
        <div onClick={goAdd}> click</div>
        <div className="w-full flex flex-col items-center mt-24">
          {!blobAudio && <Loader size={"w-24 h-24"} />}
          {blobAudio &&
            blobAudio?.map((item) => (
              <AudioVisualizer
                blob={item}
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
            ))}
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
