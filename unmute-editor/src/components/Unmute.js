import { React, useEffect, useRef, useState } from "react";

import clsx from "clsx";

import { useDispatch, useSelector } from "react-redux";
import { CloseIcon } from "../assets/icons/icon_close";
import { ExclamationIcon } from "../assets/icons/icon_exclamation";
import { PlusIcon } from "../assets/icons/icon_plus";

import { Loader } from "./Loader";

import { getFileUrl, uploadFile } from "../api/aws";
import { updateUnmuteInCart } from "../api/cart";
import { updateUnmutes } from "../features/user/userSlice";

import frame_image from "../assets/images/frame.png";
import frame_landscape_image from "../assets/images/frame_landscape.png";

import CropperComponent from "./Cropper";
import { setDisableAllActions } from "../features/image/imageSlice";

const frame_padding = (scale, landscape) => {
  // for landscape it was 17

  return {
    paddingTop: `${10 * scale}px`,
    paddingRight: `${10 * scale}px`,
    paddingBottom: `${10 * scale}px`,
    paddingLeft: `${10 * scale}px`,
  };
};

const Unmute = ({
  unmute,
  onDelete,
  length,
  activeUnmute,
  index,
  swiperRef,
}) => {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [smallImage, setSmallImage] = useState(false);
  const replaceIndex = useSelector((state) => state.replace.replaceIndex);
  const replaceMode = useSelector((state) => state.replace.replaceMode);
  const beforeImage = useSelector((state) => state.replace.beforeImage);
  const afterImage = useSelector((state) => state.replace.afterImage);

  const [frameWidth, setFrameWidth] = useState();
  const frameRef = useRef();

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
          _original_images: [fileUrl],
        },
      }).then(({ data }) => {
        setLoading(false);
        setSmallImage(false);
        dispatch(updateUnmutes(data.items));
      });
    });
  };

  const {
    properties: {
      _passepartout: passepartout,
      _orientation: orientation,
      _original_images: images,
    },
  } = unmute;

  const scale = { none: 1, small: 3.5, medium: 5.5, large: 7 }[passepartout];
  const isLandscape = orientation === "landscape";

  const frame = isLandscape ? frame_landscape_image : frame_image;
  const frame_width = isLandscape
    ? "min-w-[300px] w-[55%]"
    : "min-w-[250px] w-1/2";

  useEffect(() => {
    if (activeUnmute) {
      dispatch(setDisableAllActions(smallImage));
    }
  }, [activeUnmute, smallImage]);

  const handleImageLoad = (event) => {
    const { naturalWidth, naturalHeight } = event.target;
    if (naturalWidth < 637 && naturalHeight < 850) {
      setSmallImage(true);
    }
  };

  useEffect(() => {
    setFrameWidth(frameRef.current.offsetWidth);
  }, [frame]);

  return (
    <>
      <div className={clsx(isLandscape ? 'w-[300px]' : 'w-[250px]', "snap-center flex items-center py-4")}>
        <div
          className={clsx(
            "relative flex justify-center",
            isLandscape ? "mt-0" : "mt-0"
          )}
        >
          <img
            ref={frameRef}
            src={frame}
            alt="Frame"
            className={clsx(
              frame_width,
              "relative top-0 z-[2] pointer-events-none"
            )}
          />
          <img
            src={images}
            alt="Frame"
            onLoad={handleImageLoad}
            className={"hidden"}
          />
          {images && images.length > 0 ? (
            <>
              {replaceIndex === index &&
                activeUnmute &&
                afterImage &&
                beforeImage && (
                  <div
                    className={clsx(
                      frame_width,
                      "absolute h-full object-cover overflow-hidden"
                    )}
                  >
                    {/*<ImgComparisonSlider className="slider-example-split-line">
                      <img slot="first" src={beforeImage}/>
                      <img slot="second" src={afterImage}/>
                    </ImgComparisonSlider>*/}

                    <div className="image-compare">
                      <div className="before-wrapper">
                        <div
                          className={"before"}
                          style={{
                            backgroundImage: `url(${beforeImage})`,
                            width: frameWidth,
                          }}
                        />
                      </div>
                      <img src={afterImage} className={"after-image"} alt="" />
                    </div>

                    <div
                      className="img-info flex justify-between absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white font-serif z-[2]"
                      style={{ width: "calc(100% - 34px)" }}
                    >
                      <span className={"w-1/2 text-center"}>Before</span>
                      <span className={"w-1/2 text-center"}>After</span>
                    </div>
                  </div>
                )}

              {(replaceIndex !== index || !replaceMode) && (
                <CropperComponent
                  images={images}
                  frame_padding={frame_padding}
                  scale={scale}
                  frame_width={frame_width}
                  isLandscape={isLandscape}
                  unmute={unmute}
                  activeUnmute={activeUnmute}
                  index={index}
                  swiperRef={swiperRef}
                />
              )}
              {smallImage ? (
                <button
                  onClick={() => onDelete(unmute.key)}
                  className="w-[34px] h-[34px] bg-beige-600 rounded-full flex items-center justify-center absolute -top-4 -right-4 z-10"
                >
                  <ExclamationIcon size={20} />
                </button>
              ) : (
                <button
                  onClick={() => onDelete(unmute.key)}
                  className="w-[34px] h-[34px] bg-beige-600 rounded-full flex items-center justify-center absolute -top-4 -right-4 z-10"
                >
                  <CloseIcon />
                </button>
              )}
            </>
          ) : loading ? (
            <div className="flex items-center justify-center absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 z-10">
              <Loader size={"w-24 h-24"} />
            </div>
          ) : (
            <button className="w-[34px] h-[34px] bg-rose-500 rounded-full flex items-center justify-center absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 z-10">
              <label htmlFor={`mage-add-${unmute.key}`}>
                <PlusIcon size={20} className={"fill-white"} />
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

      {smallImage && (
        <div>
          <div className="text-rose-500 text-center pt-8">
            For lav opløsning
          </div>
          <div className="flex justify-center">
            <label
              htmlFor={`mage-add-${unmute.key}`}
              onClick={() => onDelete(unmute.key)}
              className="text-label font-serif text-white bg-rose-500 border border-rose focus:outline-none hover:bg-rose-600 focus:ring-4 focus:ring-rose font-medium rounded-lg px-8 py-2.5 cursor-pointer text-center"
            >
              Tilføj nyt foto
            </label>
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              className="hidden"
              id={`mage-add-${unmute.key}`}
              onChange={handleChange}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Unmute;
