import React, {useState} from "react";
import {MinusIcon} from "../assets/icons/icon_minus";
import {PlusIcon} from "../assets/icons/icon_plus";

export const CropPage = () => {
  const [rangeValue, setRangeValue] = useState(50);

  const handleIncrease = () => {
    if (rangeValue < 100) {
      setRangeValue(rangeValue + 1);
    }
  };

  const handleDecrease = () => {
    if (rangeValue > 0) {
      setRangeValue(rangeValue - 1);
    }
  };

  const handleRangeChange = (event) => {
    setRangeValue(parseInt(event.target.value, 10));
  };

  return (
    <div className={'pb-[67px]'}>
      <div className="mt-16 flex flex-row justify-center items-center gap-4">
        <button
            onClick={handleDecrease}
            className="w-[34px] h-[34px] bg-beige-600 rounded-full flex items-center justify-center"
        >
          <MinusIcon size={20} className={'fill-white'}/>
        </button>
        <input
            type="range"
            value={rangeValue}
            min="0"
            max="100"
            onChange={handleRangeChange}
            className="w-96 h-3 bg-beige-600 rounded-lg appearance-none cursor-pointer"
        />
        <button
            onClick={handleIncrease}
            className="w-[34px] h-[34px] bg-beige-600 rounded-full flex items-center justify-center"
        >
          <PlusIcon size={20} className={'fill-white'}/>
        </button>
      </div>

      <p className={'font-serif text-rose-500 text-[12px] text-center leading-tight mt-6'}>Pinch to zoom, drag to move.</p>
    </div>
  );
};
