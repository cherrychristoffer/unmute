import { React, useRef, useState } from "react";

import clsx from "clsx";

import { useDispatch } from "react-redux";
import { PlusIcon } from "../assets/icons/icon_plus";

import { Loader } from "./Loader";

import { getFileUrl, uploadFile } from "../api/aws";
import { updateUnmuteInCart } from "../api/cart";
import { updateUnmutes } from "../features/user/userSlice";

import frame_image from "../assets/images/frame.png";
import frame_landscape_image from "../assets/images/frame_landscape.png";
import { UnmuteFrame } from "./Frame-first";

import CropperComponent from "./Cropper";

const frame_padding = (scale, landscape) => {
  if (landscape) {
    return {
      paddingTop: `${17 * scale}px`,
      paddingRight: `${17 * scale}px`,
      paddingBottom: `${17 * scale}px`,
      paddingLeft: `${17 * scale}px`,
    };
  }

  return {
    paddingTop: `${13 * scale}px`,
    paddingRight: `${13 * scale}px`,
    paddingBottom: `${13 * scale}px`,
    paddingLeft: `${13 * scale}px`,
  };
};

const Unmute = ({ unmute, onDelete, length, activeUnmute, index }) => {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);

  const handleChange = async (event) => {
    setLoading(true);
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
        },
      }).then(({ data }) => {
        setLoading(false);
        dispatch(updateUnmutes(data.items));
      });
    });
  };

  const {
    properties: {
      _passepartout: passepartout,
      _orientation: orientation,
      _images: images,
      _activeIndex: activeIndex,
    },
  } = unmute;

  const scale = { none: 1, small: 1.7, medium: 2, large: 3 }[passepartout];
  const isLandscape = orientation === "landscape";

  const frame = isLandscape ? frame_landscape_image : frame_image;
  const frame_width = isLandscape
    ? "min-w-[300px] w-[55%]"
    : "min-w-[250px] w-1/2";

  return (
    <>
      {length === 1 ? (
        <UnmuteFrame
          unmute={unmute}
          onDelete={onDelete}
          frame={frame}
          isLandscape={isLandscape}
          frame_width={frame_width}
          images={images}
          frame_padding={frame_padding}
          scale={scale}
          activeUnmute={activeUnmute}
          index={index}
        />
      ) : (
        <div className="snap-center flex items-center p-4">
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
            {images && images.length > 0 ? (
              <>
                <CropperComponent
                  images={images}
                  frame_padding={frame_padding}
                  scale={scale}
                  frame_width={frame_width}
                  isLandscape={isLandscape}
                  unmute={unmute}
                  activeUnmute={activeUnmute}
                  index={index}
                />
                <button
                  onClick={() => onDelete(unmute.key)}
                  className="w-[34px] h-[34px] bg-beige-600 rounded-full flex items-center justify-center absolute -top-4 -right-4 z-10"
                >
                  ✖
                </button>
              </>
            ) : (
              <button className="w-[34px] h-[34px] bg-rose-500 rounded-full flex items-center justify-center absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 z-10">
                <label htmlFor={`mage-add-${unmute.key}`}>
                  {loading ? (
                    <h2 className="mt-56 font-serif text-rose-500 text-3xl text-center flex flex-col items-center justify-center">
                      Uploading...
                      <Loader size={"w-24 h-24"} />
                    </h2>
                  ) : (
                    <PlusIcon size={20} className={"fill-white"} />
                  )}
                </label>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  className="hidden"
                  id={`mage-add-${unmute.key}`}
                  onChange={handleChange}
                />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Unmute;
