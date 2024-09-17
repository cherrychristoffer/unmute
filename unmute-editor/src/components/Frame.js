import { React, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

import { useDispatch, useSelector } from "react-redux";
import { Link } from "wouter";

import { Loader } from "./Loader";
import { v4 as uuidv4 } from "uuid";

import { deleteFile } from "../api/aws";
import { updateUnmuteInCart } from "../api/cart";
import {
  updateUnmutes,
  setActiveIndexScroll,
  updateAllUnmutes,
} from "../features/user/userSlice";

import { useDebouncedCallback } from "use-debounce";

import { setActiveUnmuteIndex } from "../features/user/userSlice";

import frame_image from "../assets/images/frame.png";
import { useActiveUnmute } from "../api/useUnmutes";

import Unmute from "./Unmute";

export const Frame = () => {
  const cacheBust = Date.now();

  const scrollRef = useRef(null);
  const isAllready = useRef(false);
  const isRendered = useRef(false);

  const audioRef = useRef();

  const [playing, setPlaying] = useState(false);
  const dispatch = useDispatch();

  const unmutes = useSelector((state) => state.user.unmutes);

  const activeUnmuteIndex = useSelector(
    (state) => state.user.activeUnmuteIndex
  );
  useEffect(() => {
    if (unmutes?.length > 0 && !isAllready.current) {
      isAllready.current = true;
      const unmutesCopy = [...unmutes];

      if (unmutesCopy?.length === 2) {
        const emptyImages = unmutes.find(
          (item) => item.properties._images?.length === 0
        );

        unmutesCopy.push({
          ...emptyImages,
          properties: {
            ...emptyImages.properties,
            _uuid: uuidv4(),
          },
        });
      }
      const withImage = unmutesCopy?.filter(
        (item) => item.properties._images?.length > 0
      );

      const sortedUnmutes = unmutesCopy.filter(
        (item) => item.properties._images?.length === 0
      );

      if (withImage) {
        sortedUnmutes.splice(1, 0, ...withImage);
      }

      dispatch(updateAllUnmutes(sortedUnmutes));
    }
  }, [unmutes]);

  const loading = activeUnmuteIndex === null;

  const debouncedSetActiveUnmuteIndex = useDebouncedCallback((snapIndex) => {
    dispatch(setActiveUnmuteIndex(snapIndex));
  }, 200);

  useLayoutEffect(() => {
    if (scrollRef.current) {
      function scrollHandler() {
        const fixedWith = 600;
        const fixedScrolled = 115;
        const { scrollLeft, offsetWidth } = scrollRef.current;
        const calculatedContainer = fixedWith - offsetWidth;
        const halfContainerWith = calculatedContainer / 2;

        const diff = Math.ceil(scrollLeft - halfContainerWith);
        if (diff < fixedScrolled) {
          dispatch(setActiveIndexScroll(1));
          dispatch(setActiveUnmuteIndex(0));
        } else if (diff >= fixedScrolled && diff < 2 * fixedScrolled) {
          dispatch(setActiveIndexScroll(2));
          dispatch(setActiveUnmuteIndex(1));
        } else if (diff >= 2 * fixedScrolled && diff < 4.5 * fixedScrolled) {
          dispatch(setActiveIndexScroll(3));
          dispatch(setActiveUnmuteIndex(2));
        } else if (diff >= 4.5 * fixedScrolled && diff < 6 * fixedScrolled) {
          dispatch(setActiveIndexScroll(4));
          dispatch(setActiveUnmuteIndex(3));
        }
      }
      scrollRef?.current?.addEventListener("scroll", scrollHandler);
    }
  }, [scrollRef.current]);

  useEffect(() => {
    if (scrollRef.current && unmutes.length >= 3 && !isRendered.current) {
      dispatch(setActiveUnmuteIndex(1));
      isRendered.current = true;
      const secondItem = scrollRef.current.children[1];
      const containerCenter = scrollRef.current.offsetWidth / 2;
      const itemCenter = secondItem.offsetLeft + secondItem.offsetWidth / 2;
      scrollRef.current.scrollTo({
        left: itemCenter - containerCenter,
        behavior: "smooth",
      });
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
        {unmutes.map((unmute, index) => (
          <Unmute
            key={index}
            unmute={unmute}
            onDelete={handleDelete}
            length={unmutes?.length}
            activeUnmute={activeUnmuteIndex === index}
            index={index}
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
            className="audio-hidden-replace text-white bg-rose-500 border border-rose focus:outline-none hover:bg-rose-600 focus:ring-4 focus:ring-rose font-medium rounded-lg px-16 py-2.5 mt-12 cursor-pointer"
          >
            Add your audio
          </Link>
        )}
      </div>
    </>
  );
};
