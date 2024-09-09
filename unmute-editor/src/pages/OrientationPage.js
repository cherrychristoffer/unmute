import { React } from "react";

import { updateUnmute, updateUnmutes } from "../features/user/userSlice";
import { useDispatch } from "react-redux";

import { updateUnmuteInCart } from "../api/cart";

import { useActiveUnmute } from "../api/useUnmutes";

import landscape from "../assets/images/orientation/landscape.png";
import portrait from "../assets/images/orientation/portrait.png";

export const OrientationPage = () => {
  const dispatch = useDispatch();
  const { activeUnmute } = useActiveUnmute();

  const handleClick = (orientation) => {
    dispatch(
      updateUnmute({
        ...activeUnmute,
        properties: { ...activeUnmute.properties, _orientation: orientation },
      })
    );

    updateUnmuteInCart({
      key: activeUnmute.key,
      properties: {
        ...activeUnmute.properties,
        _orientation: orientation,
      },
    }).then(({ data }) => {
      dispatch(updateUnmutes(data.items));
    });
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mt-16 flex flex-row justify-center items-center gap-8 w-2/3">
        <button onClick={() => handleClick("landscape")}>
          <img src={landscape} className="h-fit" alt="Landscape" />
        </button>

        <button onClick={() => handleClick("portrait")}>
          <img src={portrait} className="h-fit" alt="Portrait" />
        </button>
      </div>
    </div>
  );
};
