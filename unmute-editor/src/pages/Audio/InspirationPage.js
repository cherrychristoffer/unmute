import { React, useRef } from "react";
import { useLocation } from "wouter";

import { updateUnmute, updateUnmutes } from "../../features/user/userSlice";
import { useDispatch } from "react-redux";

import { updateUnmuteInCart } from "../../api/cart";

import { useActiveUnmute } from "../../api/useUnmutes";

export const InspirationPage = () => {
  const inspirationRef = useRef();
  const dispatch = useDispatch();
  const [_location, navigate] = useLocation();
  const { activeUnmute } = useActiveUnmute();

  const handleClick = () => {
    const inspiration = inspirationRef.current.value;

    dispatch(
      updateUnmute({
        ...activeUnmute,
        properties: { ...activeUnmute.properties, _inspiration: inspiration },
      })
    );

    updateUnmuteInCart({
      key: activeUnmute.key,
      properties: {
        ...activeUnmute.properties,
        _inspiration: inspiration,
      },
    }).then(({ data }) => {
      dispatch(updateUnmutes(data.items));
      navigate("/start-recording");
    });
  };

  return (
    <div className="flex flex-col items-center mt-24">
      <div className="text-rose-500 text-2xl text-center">
        Write the text that you <br />
        would like to record.
      </div>

      <div className="w-11/12 flex flex-col items-center">
        <textarea
          ref={inspirationRef}
          className="w-full mt-12 p-4 h-36 border border-rose-200 bg-gray-100 rounded-lg text-rose-500 font-light"
          defaultValue={activeUnmute?.properties?._inspiration}
          placeholder="Write your text here..."
        />
        <button
          onClick={handleClick}
          className="text-white bg-rose-500 border border-rose focus:outline-none hover:bg-rose-600 focus:ring-4 focus:ring-rose font-medium rounded-lg px-8 py-2.5 mt-6 cursor-pointer"
        >
          Start recording
        </button>
      </div>
    </div>
  );
};
