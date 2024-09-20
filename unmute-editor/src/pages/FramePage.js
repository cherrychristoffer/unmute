import { React } from "react";
import {CheckIcon} from "../assets/icons/icon_check";

import black from "../assets/images/frames/black.png";
import oak from "../assets/images/frames/oak.png";
import white from "../assets/images/frames/white.png";

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

  const OAK_FRAMES = [
    {
      value: 'oak',
      image: oak
    },
    // {
    //   value: 'black',
    //   image: black
    // },
    // {
    //   value: 'white',
    //   image: white
    // }
  ];

  return (
    <div className={'pb-[67px]'}>
      <div className="flex flex-col items-center">
        <div className="mt-16 flex flex-row justify-center items-center gap-6 max-w-sm">
          {OAK_FRAMES.map((item, index) =>
            <button key={index} onClick={() => handleClick(item.value)} className={'relative'}>
              <img src={item.image} className="w-[70px] h-[70px] rounded-md" alt={item.value}/>
              {activeUnmute?.properties?._frame === item.value && <CheckIcon color={'fill-rose-100'} size={16} className={'absolute top-0 bottom-0 left-0 right-0 m-auto w-[25px] h-[25px] bg-rose-500 rounded-full flex items-center justify-center'}/>}
            </button>
          )}
        </div>
      </div>
    </div>

  );
};
