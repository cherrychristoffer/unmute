import {
  act,
  React,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useLocation } from "wouter";

import clsx from "clsx";

import { useDispatch, useSelector } from "react-redux";
import { Link } from "wouter";
import { PlusIcon } from "../assets/icons/icon_plus";

import { Loader } from "./Loader";
import { v4 as uuidv4 } from "uuid";

import { deleteFile, getFileUrl, uploadFile } from "../api/aws";
import { updateUnmuteInCart } from "../api/cart";
import {
  updateUnmutes,
  setActiveIndexScroll,
  updateAllUnmutes,
} from "../features/user/userSlice";

import { useDebouncedCallback } from "use-debounce";

import { setActiveUnmuteIndex } from "../features/user/userSlice";

import frame_image from "../assets/images/frame.png";
import frame_landscape_image from "../assets/images/frame_landscape.png";
import { useActiveUnmute } from "../api/useUnmutes";
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

const Unmute = ({ unmute, active, onDelete, length, activeUnmute }) => {
  const dispatch = useDispatch();
  const cropperRef = useRef(null);

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

  const [activeindex, setActiveIndex] = useState(2);
  const [scrollPosition, setScrollPosition] = useState();

  const scrollRef = useRef(null);
  const isAllready = useRef(false);

  const audioRef = useRef();

  const [playing, setPlaying] = useState(false);
  const dispatch = useDispatch();
  const [, navigate] = useLocation(); // Initialize navigation
  const { activeUnmute } = useActiveUnmute();

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
      scrollRef.current.addEventListener("scroll", () => {
        const { scrollLeft, clientWidth } = scrollRef.current;
        // setScrollPosition(scrollLeft);
        if (scrollLeft < 230) {
          dispatch(setActiveIndexScroll(1));
          dispatch(setActiveUnmuteIndex(0));
        } else if (scrollLeft > 300) {
          dispatch(setActiveIndexScroll(3));
          dispatch(setActiveUnmuteIndex(2));
        } else if (scrollLeft > 230 && scrollLeft < 300) {
          dispatch(setActiveIndexScroll(2));
          dispatch(setActiveUnmuteIndex(1));
        }
        if (scrollLeft === 0) {
          return;
        }

        // const snapIndex = Math.floor(scrollLeft / clientWidth);

        // if (snapIndex !== activeUnmuteIndex) {
        //   debouncedSetActiveUnmuteIndex(snapIndex);
        // }
      });
    }
  }, [activeUnmuteIndex]);
  useEffect(() => {
    if (scrollRef.current && unmutes.length === 3) {
      const clientWidth = scrollRef.current.clientWidth;
      const middleIndex = activeindex;
      dispatch(setActiveUnmuteIndex(1));
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
        {unmutes.map((unmute, index) => (
          <Unmute
            key={unmute.id}
            unmute={unmute}
            active={activeindex === index}
            onDelete={handleDelete}
            length={unmutes?.length}
            activeUnmute={activeUnmuteIndex === index}
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
