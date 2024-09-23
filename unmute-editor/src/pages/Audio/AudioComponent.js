import React, { memo } from "react";

export const AudioComponent = memo(
  ({ audioRef, handleAudioEnded, uuid, file }) => {
    return (
      <audio
        ref={(el) => (audioRef.current[uuid] = el)}
        className="hidden"
        controls="controls"
        onEnded={() => handleAudioEnded(uuid)}
        src={file}
      ></audio>
    );
  },
  (oldProps, newProps) => {
    if (oldProps.file !== newProps.file) return true;
    return false;
  }
);
