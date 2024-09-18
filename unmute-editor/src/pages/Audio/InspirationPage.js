import { React, useRef } from "react";
import {Link, useLocation} from "wouter";

import { updateUnmute, updateUnmutes } from "../../features/user/userSlice";
import { useDispatch } from "react-redux";

import { updateUnmuteInCart } from "../../api/cart";

import { useActiveUnmute } from "../../api/useUnmutes";

import TextareaAutosize from 'react-textarea-autosize';

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
      <div className="flex flex-col items-center py-20">
        <div className="mx-auto flex flex-col items-center">
          <h1 className="font-serif text-muld-1000 text-[50px] mb-4">Write text</h1>
          <h2 className="font-serif text-rose-500 text-[17px] text-center leading-tight">
            Write down ideas or a script
            <br/> on what you would like to say.
          </h2>
        </div>

        <div className="w-11/12 flex flex-col items-center mx-auto">
        <TextareaAutosize
            ref={inspirationRef}
            minRows={4}
            className="w-full mt-12 p-4 h-36 border border-rose-200 text-center bg-[#f3f3f3] rounded-lg text-muld-1000 font-light"
            defaultValue={activeUnmute?.properties?._inspiration}
            placeholder="Write your text here..."
        />
        </div>

        <div className="flex flex-row justify-center gap-4 mt-16">
          <Link
              to={'/inspirations'}
              className="text-white bg-black border border-rose transition duration-200 ease-out focus:outline-none hover:bg-gray-800 focus:ring-4 focus:ring-rose font-medium rounded-lg px-8 py-2.5 cursor-pointer">
            Get inspiration
          </Link>

          <button
              onClick={handleClick}
              className="text-white bg-rose-500 border border-rose transition duration-200 ease-out focus:outline-none hover:bg-rose-900 focus:ring-4 focus:ring-rose font-medium rounded-lg px-8 py-2.5 cursor-pointer"
          >
            Start recording
          </button>
        </div>
      </div>
  );
};
