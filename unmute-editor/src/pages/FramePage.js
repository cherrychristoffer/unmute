import { React } from "react";

import { updateUnmute, updateUnmutes } from "../features/user/userSlice";
import { useDispatch } from "react-redux";

import { updateUnmuteInCart } from "../api/cart";

import { useActiveUnmute } from "../api/useUnmutes";

export const FramePage = () => {
  const dispatch = useDispatch();
  const { activeUnmute } = useActiveUnmute();

  const handleClick = (frame) => {
    dispatch(
      updateUnmute({
        ...activeUnmute,
        properties: { ...activeUnmute.properties, _frame: frame },
      })
    );

    updateUnmuteInCart({
      key: activeUnmute.key,
      properties: {
        ...activeUnmute.properties,
        _frame: frame,
      },
    }).then(({ data }) => {
      dispatch(updateUnmutes(data.items));
    });
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mt-16 flex flex-row justify-center items-center gap-4">
        {/* <%= link_to unmute_path(@unmute, { frame: :oak }), data: { "turbo-method": :patch } do %> */}
        <button onClick={() => handleClick("oak")}>
          {/* <%#= image_tag "frame/oak", class: "h-fit" %> */}
          oak
        </button>
        <button onClick={() => handleClick("black")}>
          {/* <%#= image_tag "frame/black", class: "h-fit" %> */}
          black
        </button>
        <button onClick={() => handleClick("white")}>
          {/* <%#= image_tag "frame/white", class: "h-fit" %> */}
          white
        </button>
      </div>
    </div>
  );
};
