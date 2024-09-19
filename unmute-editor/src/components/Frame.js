import { React, useEffect, useRef, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { Link } from "wouter";
import { PauseIcon } from "../assets/icons/icon_pause";
import { PlayIcon } from "../assets/icons/icon_play";

import { Loader } from "./Loader";

import { deleteFile } from "../api/aws";
import { updateUnmuteInCart } from "../api/cart";
import { updateUnmutes, updateAllUnmutes } from "../features/user/userSlice";

import { setActiveUnmuteIndex } from "../features/user/userSlice";

import frame_image from "../assets/images/frame.png";
import Unmute from "./Unmute";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "../assets/styles/swiperCustom.css";
import { EmptyBox } from "./EmptyBox";
import { useActiveUnmute } from "../api/useUnmutes";

const sliderSize = {
  width: "50%",
  minWidth: "290px",
  padding: "0 20px",
};
const sliderLanscapedSize = {
  minWidth: "340px",
  width: "55%",
  padding: "0 20px",
};

export const Frame = () => {
  const cacheBust = Date.now();
  const audioRef = useRef();
  const swiperRef = useRef(null);
  const isAlreadyRendered = useRef();
  const dispatch = useDispatch();

  const [playing, setPlaying] = useState(false);
  const [showExtra, setShowExtra] = useState(false);
  const [editSlider, setEditSlider] = useState(0);
  const { activeUnmute } = useActiveUnmute();

  console.log("activeUnmute", activeUnmute);
  const { unmutes } = useSelector((state) => state.user);
  const { scrollToExtra, disableAllExtions } = useSelector(
    (state) => state.image
  );
  const [initialSlide, setInitialSlide] = useState(0);

  useEffect(() => {
    if (unmutes.length > 0 && !isAlreadyRendered.current) {
      isAlreadyRendered.current = true;
      const isExtraExists = unmutes.find(
        (item) => item.properties._extra || item.properties._collage
      );
      if (!isExtraExists) setShowExtra(true);

      if (unmutes?.length !== 1) {
        const itemsWithImage = unmutes.filter(
          (item) => item.properties._images?.length > 0
        );
        setEditSlider((prev) => prev + 1);
        setInitialSlide(itemsWithImage.length - 1);
        const itemsWithoutImages = unmutes.filter(
          (item) => !item.properties._images?.length
        );

        dispatch(updateAllUnmutes([...itemsWithImage, ...itemsWithoutImages]));
      }
    }
  }, [unmutes]);

  useEffect(() => {
    if (scrollToExtra > 0) {
      const isExtraExists = unmutes?.find(
        (item) => item.properties._extra || item.properties._collage
      );
      if (!isExtraExists) {
        setEditSlider((prev) => prev + 1);
        setInitialSlide(unmutes?.length);
      }
    }
  }, [scrollToExtra]);

  const activeUnmuteIndex = useSelector(
    (state) => state.user.activeUnmuteIndex
  );

  const loading = activeUnmuteIndex === null;

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

  console.log("unmutes", unmutes);
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
          _enhanced: false,
          _original_images: [],
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
    <div
      className={"pt-8"}
      onTouchMoveCapture={(e) => {
        swiperRef.current.swiper.allowTouchMove = true;
      }}
    >
      <Swiper
        key={editSlider}
        ref={swiperRef}
        slidesPerView={"auto"}
        centeredSlides={true}
        initialSlide={initialSlide}
        onSlideChange={(event) => {
          dispatch(setActiveUnmuteIndex(event.activeIndex));
        }}
      >
        {unmutes.map((unmute, index) => (
          <SwiperSlide
            key={index}
            style={
              unmute?.properties?._orientation === "landscape"
                ? sliderLanscapedSize
                : sliderSize
            }
          >
            <Unmute
              unmute={unmute}
              onDelete={handleDelete}
              length={unmutes?.length}
              activeUnmute={activeUnmuteIndex === index}
              index={index}
              swiperRef={swiperRef}
            />
          </SwiperSlide>
        ))}
        {showExtra && (
          <SwiperSlide style={sliderSize}>
            <EmptyBox setShowExtra={setShowExtra} />
          </SwiperSlide>
        )}
      </Swiper>

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
              {playing ? (
                <>
                  <PauseIcon />
                </>
              ) : (
                <>
                  <PlayIcon />️
                </>
              )}
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
            to={`/audio/${activeUnmute?.properties?._uuid}`}
            className="audio-hidden-replace text-white bg-rose-500 border border-rose focus:outline-none hover:bg-rose-600 focus:ring-4 focus:ring-rose font-medium rounded-lg px-16 py-2.5 mt-12 cursor-pointer"
            style={{
              opacity: disableAllExtions ? "0.5" : "1",
              pointerEvents: disableAllExtions ? "none" : "unset",
            }}
          >
            Add your audio
          </Link>
        )}
      </div>
    </div>
  );
};
