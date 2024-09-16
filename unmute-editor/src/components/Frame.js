import { React, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useRoute, useRouter } from "wouter";

import clsx from "clsx";

import { useDispatch, useSelector } from "react-redux";
import { Link } from "wouter";
import { PlusIcon } from "../assets/icons/icon_plus";

import { Loader } from "./Loader";

import { deleteFile, getFileUrl, uploadFile } from "../api/aws";
import { updateUnmuteInCart } from "../api/cart";
import { updateUnmutes, updateUnmute } from "../features/user/userSlice";

import { useDebouncedCallback } from "use-debounce";

import { setActiveUnmuteIndex } from "../features/user/userSlice";

import Cropper from "react-cropper";

import frame_image from "../assets/images/frame.png";
import frame_landscape_image from "../assets/images/frame_landscape.png";
import { useActiveUnmute } from "../api/useUnmutes";
import { UnmuteFrame } from "./Frame-first";
import { updateZoomValue } from "../features/image/imageSlice";
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

const Unmute = ({ unmute, active, onDelete, length }) => {
  const dispatch = useDispatch();
  const cropperRef = useRef(null);
  const [loading, setLoading] = useState(false);
  let a = 0;
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

  const handleCrop = useDebouncedCallback((e) => {
    if (!active) return;
    const cropper = cropperRef.current?.cropper;

    cropper.getCroppedCanvas().toBlob((blob) => {
      const file = new File([blob], "cropped.png", { type: "image/png" });

      uploadFile({
        path: unmute.properties._uuid,
        file,
      }).then(() => {
        const fileUrl = getFileUrl(`${unmute.properties._uuid}/cropped.png`);

        updateUnmuteInCart({
          key: unmute.key,
          properties: {
            ...unmute.properties,
            _images: [fileUrl], // TODO: Add to existing list of images
          },
        }).then(({ data }) => {
          dispatch(updateUnmutes(data.items));
        });
      });
    });
  }, 500);

  const {
    properties: {
      _passepartout: passepartout,
      _orientation: orientation,
      _images: images,
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

export const Frame = () => {
  const cacheBust = Date.now();

  const scrollRef = useRef();
  const audioRef = useRef();

  const [playing, setPlaying] = useState(false);
  const dispatch = useDispatch();
  const [, navigate] = useLocation(); // Initialize navigation
  const { activeUnmute } = useActiveUnmute();

  const unmutesCopy = useSelector((state) => state.user.unmutes);
  const unmutes = [...unmutesCopy];

  if (unmutes?.length === 2) {
    const emptyImages = unmutes.find(
      (item) => item.properties._images?.length === 0
    );
    unmutes.push({ ...emptyImages });
  }
  const withImage = unmutes?.filter(
    (item) => item.properties._images?.length > 0
  );

  const sortedUnmutes = unmutes.filter(
    (item) => item.properties._images?.length === 0
  );
  if (withImage) {
    sortedUnmutes.splice(1, 0, ...withImage);
  }

  const activeUnmuteIndex = useSelector(
    (state) => state.user.activeUnmuteIndex
  );

  const loading = activeUnmuteIndex === null;

  const debouncedSetActiveUnmuteIndex = useDebouncedCallback((snapIndex) => {
    dispatch(setActiveUnmuteIndex(snapIndex));
  }, 200);

  // useLayoutEffect(() => {
  //   if (scrollRef.current) {
  //     scrollRef.current.addEventListener("scroll", () => {
  //       const { scrollLeft, clientWidth } = scrollRef.current;

  //       if (scrollLeft === 0) {
  //         return;
  //       }

  //       const snapIndex = Math.floor(scrollLeft / clientWidth);

  //       if (snapIndex !== activeUnmuteIndex) {
  //         debouncedSetActiveUnmuteIndex(snapIndex);
  //       }
  //     });
  //   }
  // }, [activeUnmuteIndex]);
  useLayoutEffect(() => {
    if (scrollRef.current && unmutes.length === 3) {
      const clientWidth = scrollRef.current.clientWidth;
      const middleIndex = 2;
      const unmuteWidth = clientWidth / 2;
      const scrollPosition = unmuteWidth * middleIndex - clientWidth / 2;

      scrollRef.current.scrollTo({ left: scrollPosition, behavior: "smooth" });
    }
  }, [unmutes]);
  useEffect(() => {
    if (audioRef.current) {
      if (playing) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [audioRef.current, playing]);

  const handlePlayAudio = () => {
    setPlaying(true);
  };

  const handlePauseAudio = () => {
    setPlaying(false);
  };

  const handleDelete = (key) => {
    const unmuteToUpdate = unmutes.find((unmute) => unmute.key === key);
    deleteFile({
      path: unmuteToUpdate.properties._images[0],
    }).then(() => {
      updateUnmuteInCart({
        key: unmuteToUpdate.key,
        properties: {
          ...unmuteToUpdate.properties,
          _images: [],
        },
      }).then((data) => {
        dispatch(updateUnmutes(data.data.items));
      });
    });
  };

  if (loading) {
    return (
      <div className="snap-start">
        <div className="relative top-0 flex justify-center mt-16">
          <img src={frame_image} alt="Frame" className="relative top-0 w-1/2" />
          <div className="absolute h-full object-cover">
            <div className="flex flex-col items-center justify-center h-full">
              <Loader size={"w-24 h-24"} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        ref={scrollRef}
        className="relative w-full flex gap-4 snap-x snap-mandatory overflow-auto py-4"
      >
        {/* {unmutes?.length === 1 ? (
          <></>
        ) : (
          <>
            {unmutes.map((unmute, index) => (
              <Unmute
                key={unmute.id}
                unmute={unmute}
                active={activeUnmuteIndex === index}
                onDelete={handleDelete}
                length  ={unmutes?.length}
              />
            ))}
          </>
        )} */}

        {sortedUnmutes.map((unmute, index) => (
          <Unmute
            key={unmute.id}
            unmute={unmute}
            active={activeUnmuteIndex === index}
            onDelete={handleDelete}
            length={unmutes?.length}
          />
        ))}
      </div>

      <div className="flex flex-col items-center">
        {unmutes[activeUnmuteIndex]?.properties?._audios?.length > 0 ? (
          <div className="flex flex-row items-center mt-12">
            <Link
              to="/edit-audio"
              className="text-rose-500 bg-white-500 border border-rose focus:outline-none hover:bg-rose-600 hover:text-white focus:ring-4 focus:ring-rose font-medium rounded-lg px-16 py-2.5 cursor-pointer"
            >
              Edit audio
            </Link>

            <button
              onClick={() => {
                playing ? handlePauseAudio() : handlePlayAudio();
              }}
              className="ml-4 flex items-center justify-center w-12 h-12 text-white-500 bg-rose-500 rounded-full focus:shadow-outline hover:bg-rose-600"
            >
              {playing ? <>⏸</> : <>▶️</>}
            </button>

            <audio
              ref={audioRef}
              className="hidden"
              controls="controls"
              src={`${unmutes[activeUnmuteIndex]?.properties?._audios[0]}?c=${cacheBust}`}
            ></audio>
          </div>
        ) : (
          <Link
            to="/audio"
            className="text-white bg-rose-500 border border-rose focus:outline-none hover:bg-rose-600 focus:ring-4 focus:ring-rose font-medium rounded-lg px-16 py-2.5 mt-12 cursor-pointer"
          >
            Add your audio
          </Link>
        )}
      </div>
    </>
  );
};
