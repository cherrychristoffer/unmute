import { React } from "react";

import {CheckIcon} from "../assets/icons/icon_check";

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

  const PASSEPARTOUT = [
    {
      value: 'small',
      image: small
    },
    {
      value: 'medium',
      image: medium
    },
    {
      value: 'large',
      image: large
    },
  ];

  return (
    <div className={'pb-[60px]'}>
      <div className="mt-16 mx-6 flex flex-row justify-center items-center gap-6">
        {PASSEPARTOUT.map((item, index) =>
          <button key={index} onClick={() => handleClick(item.value)} className={`relative`}>
            <img src={item.image} alt="Small passepartout"/>
            {activeUnmute.properties._passepartout === item.value && <CheckIcon color={'fill-rose-100'} size={16} className={'absolute top-0 bottom-0 left-0 right-0 m-auto w-[25px] h-[25px] bg-rose-500 rounded-full flex items-center justify-center'}/>}
          </button>
        )}
      </div>
    </div>
  );
};
