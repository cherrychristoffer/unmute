import { React } from "react";

import { CheckIcon } from "../assets/icons/icon_check";

import { updateUnmute, updateUnmutes } from "../features/user/userSlice";
import { useDispatch, useSelector } from "react-redux";

import { updateUnmuteInCart } from "../api/cart";

import { useActiveUnmute } from "../api/useUnmutes";

import landscape from "../assets/images/orientation/landscape.png";
import portrait from "../assets/images/orientation/portrait.png";

export const OrientationPage = () => {
  const dispatch = useDispatch();
  const { activeUnmute } = useActiveUnmute();

  const activeIndex = useSelector((state) => state.user.activeIndex);

  const handleClick = (orientation) => {
    dispatch(
      updateUnmute({
        ...activeUnmute,
        properties: {
          ...activeUnmute.properties,
          _orientation: orientation,
          _activeIndex: activeIndex,
        },
      })
    );

    updateUnmuteInCart({
      key: activeUnmute.key,
      properties: {
        ...activeUnmute.properties,
        _orientation: orientation,
        _activeIndex: activeIndex,
      },
    })
      .catch((err) => {
        console.error(err);
      })
      .then(({ data }) => {
        dispatch(updateUnmutes(data.items));
      });
  };

  const ORIENTATION = [
    {
      value: "portrait",
      image: portrait,
    },
    {
      value: "landscape",
      image: landscape,
    },
  ];

  return (
    <div className={"pb-[67px]"}>
      <div className="flex flex-col items-center">
        <div className="mt-16 flex flex-row justify-center items-center gap-8 w-2/3 max-w-xs">
          {ORIENTATION.map((item, index) => (
            <button
              key={index}
              onClick={() => handleClick(item.value)}
              className={"relative"}
            >
              <img
                src={item.image}
                className=""
                alt={item.value}
              />
              {activeUnmute?.properties?._orientation === item.value && (
                <CheckIcon
                  color={"fill-rose-100"}
                  size={16}
                  className={
                    "absolute top-0 bottom-0 left-0 right-0 m-auto w-[25px] h-[25px] bg-rose-500 rounded-full flex items-center justify-center"
                  }
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
