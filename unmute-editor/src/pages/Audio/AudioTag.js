import React, { memo } from "react";

export const AudioTag = memo(
  ({ audioRef, handleAudioEnded, setCanPlay, allAudioRefs, uuid, file }) => {
    return (
      <audio
        ref={(el) => {
          audioRef.current = el;
          allAudioRefs.current[uuid] = el;
        }}
        onCanPlay={(e) => {
          setCanPlay(true);
        }}
        onEnded={() => handleAudioEnded(uuid)}
        // onError={(e) => {
        //   alert("Error in audio");
        // }}
        src={file}
      ></audio>
    );
  },
  (oldProps, newProps) => {
    if (oldProps.file !== newProps.file) return true;
    return false;
  }
);
