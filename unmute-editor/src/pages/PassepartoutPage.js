import { React } from "react";

import { updateUnmute, updateUnmutes } from "../features/user/userSlice";
import { useDispatch } from "react-redux";

import { updateUnmuteInCart } from "../api/cart";

import { useActiveUnmute } from "../api/useUnmutes";

import large from "../assets/images/passepartout/large.png";
import medium from "../assets/images/passepartout/medium.png";
import small from "../assets/images/passepartout/small.png";

export const PassepartoutPage = () => {
  const dispatch = useDispatch();
  const { activeUnmute } = useActiveUnmute();

  const handleClick = (passepartout) => {
    dispatch(
      updateUnmute({
        ...activeUnmute,
        properties: { ...activeUnmute.properties, _passepartout: passepartout },
      })
    );

    updateUnmuteInCart({
      key: activeUnmute.key,
      properties: {
        ...activeUnmute.properties,
        _passepartout: passepartout,
      },
    }).then(({ data }) => {
      dispatch(updateUnmutes(data.items));
    });
  };

  return (
    <div className="mt-16 mx-6 flex flex-row justify-center items-center gap-6">
      <button onClick={() => handleClick("small")}>
        <img src={small} alt="Small passepartout" />
      </button>

      <button onClick={() => handleClick("medium")}>
        <img src={medium} alt="Medium passepartout" />
      </button>

      <button onClick={() => handleClick("large")}>
        <img src={large} alt="Large passepartout" />
      </button>
    </div>
  );
};
