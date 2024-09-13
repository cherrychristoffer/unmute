import { React, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

import clsx from "clsx";

import { useDispatch, useSelector } from "react-redux";
import { Link } from "wouter";

import { Loader } from "./Loader";

import {deleteFile, getFileUrl, uploadFile} from "../api/aws";
import { updateUnmuteInCart } from "../api/cart";
import {updateUnmutes, setActiveUnmuteIndex, setCropper, setZoom, setCropperReady} from "../features/user/userSlice";

import { useDebouncedCallback } from "use-debounce";

import "cropperjs/dist/cropper.css";
import "./custom-cropper.css";
import Cropper from "react-cropper";

import frame_image from "../assets/images/frame.png";
import frame_landscape_image from "../assets/images/frame_landscape.png";
import {useActiveUnmute} from "../api/useUnmutes";

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
    paddingTop: `${14 * scale}px`,
    paddingRight: `${13 * scale}px`,
    paddingBottom: `${13 * scale}px`,
    paddingLeft: `${13 * scale}px`,
  };
};

const Unmute = ({ unmute, active, onDelete }) => {
  const dispatch = useDispatch();
  const cropper = useSelector(state => state.user.cropper);

  const handleCrop = useDebouncedCallback(() => {
    if (!active) return;

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

  const onZoom = (e) => {
    let ratio = +(e.detail.ratio.toFixed(1));
    if (ratio > 3) {
      e.preventDefault();
      e.stopPropagation();
    } else {
      dispatch(setZoom(+(ratio.toFixed(1))));
    }
  };

  const setRef = (value) => {
    if (value.cropper) {
      dispatch(setCropper(value.cropper))
    }
  }

  const {
    properties: {
      _passepartout: passepartout,
      _orientation: orientation,
      _images: images,
    },
  } = unmute;

  const scale = { small: 1, medium: 2, large: 3 }[passepartout];
  const isLandscape = orientation === "landscape";
  const frame = isLandscape ? frame_landscape_image : frame_image;
  const frame_width = isLandscape ? "min-w-[300px] w-[55%]" : "min-w-[250px] w-1/2";

  return (
      <div className="snap-start shrink-0 w-full pt-14 pb-2 flex items-center justify-center relative">
        <div
            className={clsx(
                "relative flex justify-center overflow-hidden",
                isLandscape ? "mt-0" : "mt-0"
            )}
        >
          <img
              src={frame}
              alt="Frame"
              className={clsx(frame_width, "relative top-0 z-[1] pointer-events-none")}
          />
          {images && images.length > 0 && (
              <>
                <Cropper
                    key = {isLandscape}
                    ref={setRef}
                    src={images[images.length - 1]}
                    className={clsx(frame_width, "absolute h-full object-cover")}
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
                    zoom={onZoom}
                    ready={() => dispatch(setCropperReady(true))}
                />
                  <button
                      onClick={() => onDelete(unmute.key)}
                      className="bg-red-400 text-white rounded-full hover:bg-red-600"
                      style={{ width: "30px", height: "30px", zIndex: 2, marginLeft: '-31px', marginTop: '3px' }}
                  >
                    ✖
                  </button>

              </>
          )}
        </div>
      </div>
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

  const unmutes = useSelector((state) => state.user.unmutes);
  const activeUnmuteIndex = useSelector(
    (state) => state.user.activeUnmuteIndex
  );

  const loading = activeUnmuteIndex === null;

  const debouncedSetActiveUnmuteIndex = useDebouncedCallback((snapIndex) => {
    dispatch(setActiveUnmuteIndex(snapIndex));
  }, 200);

  useLayoutEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.addEventListener("scroll", () => {
        const { scrollLeft, clientWidth } = scrollRef.current;

        if (scrollLeft === 0) {
          return;
        }

        const snapIndex = Math.floor(scrollLeft / clientWidth);

        if (snapIndex !== activeUnmuteIndex) {
          debouncedSetActiveUnmuteIndex(snapIndex);
        }
      });
    }
  }, [activeUnmuteIndex]);

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
        dispatch(updateUnmutes(data.data.items))
        navigate("/upload-image");
      });
    })
  };


  if (loading) {
    return (
      <div className="snap-start">
        <div className="relative top-0 flex justify-center mt-16">
          <img
            src={frame_image}
            alt="Frame"
            className="relative top-0 w-1/2"
          />
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
        className="relative w-full flex gap-6 snap-x snap-mandatory overflow-auto"
      >
        {unmutes.map((unmute, index) => (
          <Unmute
            key={unmute.id}
            unmute={unmute}
            active={activeUnmuteIndex === index}
            onDelete={handleDelete}
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
