import React, { memo } from "react";

export const AudioTag = memo(
  ({
    audioRef,
    onErrorHandle,
    handleAudioEnded,
    setCanPlay,
    allAudioRefs,
    uuid,
    file,
  }) => {
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
        onError={onErrorHandle}
        src={file}
      ></audio>
    );
  },
  (oldProps, newProps) => {
    if (oldProps.file !== newProps.file) return true;
    return false;
  }
);
