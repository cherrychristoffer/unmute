import React, { useRef, useState } from "react";

export const Range = ({
  min = 0,
  max,
  range,
  handleChange,
  startRef,
  endRef,
  progressRef,
}) => {
  return (
    <div className="wrapper">
      <div className="slider">
        <div className="progress" ref={progressRef}></div>
      </div>
      <div className="range-input">
        <input
          ref={startRef}
          type="range"
          name="start"
          className="range-min"
          min={min}
          max={max}
          value={range.start}
          onChange={(e) => handleChange(e)}
        />
        <input
          ref={endRef}
          type="range"
          name="end"
          className="range-max"
          min={min}
          max={max}
          value={range.end}
          onChange={(e) => handleChange(e)}
        />
      </div>
    </div>
  );
};

export default Range;
