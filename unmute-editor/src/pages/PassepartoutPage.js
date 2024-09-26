import { React } from "react";

import { CheckIcon } from "../assets/icons/icon_check";

import { updateUnmute, updateUnmutes } from "../features/user/userSlice";
import { useDispatch, useSelector } from "react-redux";

import { updateUnmuteInCart } from "../api/cart";

import { useActiveUnmute } from "../api/useUnmutes";

import large from "../assets/images/passepartout/large.png";
import medium from "../assets/images/passepartout/medium.png";
import none from "../assets/images/passepartout/none.png";
import small from "../assets/images/passepartout/small.png";

export const PassepartoutPage = () => {
  const dispatch = useDispatch();
  const { activeUnmute } = useActiveUnmute();
  const { disableAllExtions } = useSelector((state) => state.image);

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

  const PASSEPARTOUT = [
    {
      value: "none",
      image: none,
      title: "Ingen",
    },
    {
      value: "small",
      image: small,
      title: "2 cm",
    },
    {
      value: "medium",
      image: medium,
      title: "5 cm",
    },
    {
      value: "large",
      image: large,
      title: "7 cm",
    },
  ];

  return (
    <div className={"pb-[80px] sm:pb-[110px] flex justify-center"}>
      <div className="mt-16 mx-6 flex flex-row justify-center items-center gap-6 max-w-sm">
        {PASSEPARTOUT.map((item, index) => (
          <div key={index} className={'text-center'}>
            <button
              key={index}
              disabled={disableAllExtions}
              onClick={() => handleClick(item.value)}
              className={`relative`}
            >
              <img
                style={{ opacity: disableAllExtions ? "0.5" : "1" }}
                src={item.image}
                alt="Small passepartout"
              />
              {activeUnmute?.properties?._passepartout === item.value && (
                <CheckIcon
                  color={"fill-rose-100"}
                  size={16}
                  className={
                    "absolute top-0 bottom-0 left-0 right-0 m-auto w-[25px] h-[25px] bg-rose-500 rounded-full flex items-center justify-center"
                  }
                />
              )}
            </button>
            <p className={'text-center text-[14px]'}>{item.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
