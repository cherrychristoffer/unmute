import clsx from "clsx";
import { useRef } from "react";
import { Cropper } from "react-cropper";
import { PlusIcon } from "../assets/icons/icon_plus";
export const UnmuteFrame = ({
  unmute,
  onDelete,
  frame,
  isLandscape,
  frame_width,
  images,
  frame_padding,
  scale,
  handleCrop,
}) => {
  const cropperRef = useRef(null);

  return (
    <>
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

          <Cropper
            key={isLandscape}
            ref={cropperRef}
            src={images[images.length - 1]}
            className={clsx(
              frame_width,
              "absolute h-full object-cover overflow-hidden"
            )}
            style={frame_padding(scale, isLandscape)}
            crossOrigin="anonymous"
            checkCrossOrigin={true}
            checkOrientation={false}
            center={false}
            modal={false}
            guides={false}
            highlight={false}
            background={false}
            cropBoxResizable={false}
            cropBoxMovable={true}
            viewMode={3}
            dragMode="move"
            movable={true}
            autoCropArea={1}
            rotatable={false}
            cropend={handleCrop}
            zoom={handleCrop}
          />
          <button
            onClick={() => onDelete(unmute.key)}
            className="w-[34px] h-[34px] bg-beige-600 rounded-full flex items-center justify-center absolute -top-4 -right-4 z-10"
          >
            ✖
          </button>
        </div>
      </div>
      <div className="snap-center flex items-center p-4">
        <div
          className={clsx(
            "relative flex justify-center",
            isLandscape ? "mt-0" : "mt-0"
          )}
        >
          {console.log("Stex")}
          <img
            src={frame}
            alt="Frame"
            className={clsx(
              frame_width,
              "relative top-0 z-[1] pointer-events-none"
            )}
          />

          <button className="w-[34px] h-[34px] bg-rose-500 rounded-full flex items-center justify-center absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 z-10">
            <PlusIcon
              size={20}
              className={"fill-white"}
            />
          </button>
        </div>
      </div>
    </>
  );
};
