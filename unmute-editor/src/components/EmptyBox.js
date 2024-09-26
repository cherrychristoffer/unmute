import React, { useState } from "react";
import frame_image from "../assets/images/frame.png";
import frame_landscape_image from "../assets/images/frame_landscape.png";
import clsx from "clsx";
import { useDispatch } from "react-redux";

import { PlusIcon } from "../assets/icons/icon_plus";
import { Loader } from "./Loader";
import { addUnmuteToCart, updateUnmuteInCart } from "../api/cart";
import { addUnmute, updateUnmutes } from "../features/user/userSlice";
import { getFileUrl, uploadFile } from "../api/aws";

export const EmptyBox = ({ orientation }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const isLandscape = orientation === "landscape";
  const frame = isLandscape ? frame_landscape_image : frame_image;
  const frame_width = isLandscape
    ? "min-w-[300px] w-[55%]"
    : "min-w-[250px] w-1/2";

  const handleChange = async (event) => {
    setLoading(true);
    addUnmuteToCart({ quantity: 1, extra: true }).then(({ data }) => {
      const unmute = data.items?.[0];
      if (!unmute) return;
      dispatch(addUnmute(unmute));

      const uuid = unmute._uuid;
      const file = event.target.files[0];
      uploadFile({
        path: uuid,
        file,
      }).then(() => {
        const fileUrl = getFileUrl(`${uuid}/${file.name}`);
        updateUnmuteInCart({
          key: unmute.key,
          properties: {
            ...unmute.properties,
            _images: [fileUrl],
            _original_images: [fileUrl],
          },
        }).then(({ data }) => {
          setLoading(false);
          dispatch(updateUnmutes(data.items));
        });
      });
    });
  };

  return (
    <>
      <div className="snap-center flex items-center py-4">
        <div
          className={clsx(
            "relative flex justify-center",
            isLandscape ? "mt-0" : "mt-0"
          )}
        >
          <img
            src={frame}
            alt="Frame"
            className={clsx(
              frame_width,
              "relative top-0 z-[1] pointer-events-none"
            )}
          />
          {loading ? (
            <div className="flex items-center justify-center absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 z-10">
              <Loader size={"w-24 h-24"} />
            </div>
          ) : (
            <button className="w-[34px] h-[34px] bg-rose-500 rounded-full flex items-center justify-center absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 z-10">
              <label htmlFor={`mage-add-key`} className={'mb-0'}>
                <PlusIcon size={20} className={"fill-white"} />
              </label>
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                className="hidden"
                id={`mage-add-key`}
                onChange={handleChange}
              />
            </button>
          )}
        </div>
      </div>
      <div className="extra-box text-rose-500 text-center h-[24px]">
        Tilføj ekstra UNMUTE og spar penge
      </div>
    </>
  );
};
