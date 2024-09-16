import React from "react";
import { MinusIcon } from "../assets/icons/icon_minus";
import { PlusIcon } from "../assets/icons/icon_plus";
import { useSelector } from "react-redux";

export const CropPage = () => {
  const { zoomValue, imageRef, minValue, ratio } = useSelector(
    (state) => state.image
  );

  const handleIncrease = () => {
    if (zoomValue < 30) {
      const cropper = imageRef.cropper;
      if (minValue === 0) {
        const cropper = imageRef.cropper;
        const canvasData = cropper.getCanvasData();
        const minZoomRatio = canvasData.width / canvasData.naturalWidth;
        return cropper.zoomTo(minZoomRatio * 1.1);
      }
      cropper.zoomTo((ratio || minValue) * 1.1);
    }
  };

  const handleDecrease = () => {
    if (zoomValue > 0) {
      const cropper = imageRef.cropper;
      cropper.zoomTo(ratio / 1.1);
    }
  };

  const handleRangeChange = (event) => {
    const newValue = parseInt(event.target.value, 10);
    if (zoomValue > newValue) {
      handleDecrease();
    } else {
      handleIncrease();
    }
  };

  return (
    <div className={"pb-[67px]"}>
      <div className="mt-16 flex flex-row justify-center items-center gap-4">
        <button
          onClick={handleDecrease}
          className="w-[34px] h-[34px] bg-beige-600 rounded-full flex items-center justify-center"
        >
          <MinusIcon size={20} className={"fill-white"} />
        </button>
        <input
          type="range"
          value={zoomValue}
          min="0"
          max="30"
          onChange={handleRangeChange}
          className="w-96 h-3 bg-beige-600 rounded-lg appearance-none cursor-pointer"
        />
        <button
          onClick={handleIncrease}
          className="w-[34px] h-[34px] bg-beige-600 rounded-full flex items-center justify-center"
        >
          <PlusIcon size={20} className={"fill-white"} />
        </button>
      </div>

      <p
        className={
          "font-serif text-rose-500 text-[12px] text-center leading-tight mt-6"
        }
      >
        Pinch to zoom, drag to move.
      </p>
    </div>
  );
};
