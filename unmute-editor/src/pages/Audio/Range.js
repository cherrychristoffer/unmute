import React, { useRef, useState } from "react";
import "./range.css";

// const min = 0;
// const max = 10000;
const priceGap = 1;

export const Range = ({ min = 0, max, range, setRange }) => {
  console.log("mtavv");

  const progressRef = useRef(null);
  const startRef = useRef(null);
  const endRef = useRef(null);
  function calculateValues(startValue, endValue) {
    progressRef.current.style.left = (startValue / max) * 100 + "%";
    progressRef.current.style.right = 100 - (endValue / max) * 100 + "%";
  }

  const handleChange = (e) => {
    let startValue = parseInt(startRef.current.value);
    let endValue = parseInt(endRef.current.value);
    let changedValue = e.target.value;

    if (endValue - startValue < priceGap) {
      if (e.target.name === "start") {
        startValue = endValue - priceGap;
        changedValue = startValue;
      } else {
        endValue = startValue + priceGap;
        changedValue = endValue;
      }
    }

    setRange((prev) => ({
      ...prev,
      [e.target.name]: changedValue,
    }));

    calculateValues(startValue, endValue);
  };

  return (
    <div className="wrapper">
      <div className="slider">
        <div
          className="progress"
          ref={progressRef}
        ></div>
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
          onChange={handleChange}
        />
        <input
          ref={endRef}
          type="range"
          name="end"
          className="range-max"
          min={min}
          max={max}
          value={range.end}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default Range;
