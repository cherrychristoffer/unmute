import { React } from "react";

export const CropPage = () => {
  return (
    <div className="mt-16 flex flex-row justify-center items-center">
      <input
        type="range"
        defaultValue="50"
        min="0"
        max="100"
        className="w-3/4 h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  );
};
