import clsx from "clsx";
import { PlusIcon } from "../assets/icons/icon_plus";
import CropperComponent from "./Cropper";

export const UnmuteFrame = ({
  unmute,
  onDelete,
  frame,
  isLandscape,
  frame_width,
  images,
  frame_padding,
  scale,
}) => {
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
          <CropperComponent
            images={images}
            frame_padding={frame_padding}
            scale={scale}
            frame_width={frame_width}
            isLandscape={isLandscape}
            unmute={unmute}
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
          <img
            src={frame}
            alt="Frame"
            className={clsx(
              frame_width,
              "relative top-0 z-[1] pointer-events-none"
            )}
          />

          <button className="w-[34px] h-[34px] bg-rose-500 rounded-full flex items-center justify-center absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 z-10">
            <PlusIcon size={20} className={"fill-white"} />
          </button>
        </div>
      </div>
    </>
  );
};
