import { Cropper } from "react-cropper";
import { useDispatch } from "react-redux";
import {
  setImageRef,
  setMinValue,
  setRatio,
  updateZoomValue,
} from "../features/image/imageSlice";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { getFileUrl, uploadFile } from "../api/aws";
import { updateUnmuteInCart } from "../api/cart";
import { updateUnmutes } from "../features/user/userSlice";

import "cropperjs/dist/cropper.css";
import "../assets/styles/custom-cropper.css";
import { useParams } from "wouter";
import { useDebouncedCallback } from "use-debounce";

const estimateZoomCount = (value, count = 1) => {
  if (count <= 30) {
    return estimateZoomCount(1.1 * value, ++count);
  }
  return value;
};

const CropperComponent = ({
  images,
  frame_width,
  isLandscape,
  frame_padding,
  scale,
  unmute,
  activeUnmute,
  index,
  swiperRef,
}) => {
  const dispatch = useDispatch();
  const cropperRef = useRef(null);
  const params = useParams();
  const min = useRef(null);
  const max = useRef(null);
  const prevPage = useRef(null);
  const prevActive = useRef(null);
  const [update, setUpdate] = useState(0);
  const zoomStep = useRef(0);

  useEffect(() => {
    if (cropperRef.current && activeUnmute) {
      dispatch(setImageRef(cropperRef.current));
      dispatch(setRatio(0));
      dispatch(updateZoomValue(0));
      dispatch(setMinValue(0));
      min.current = null;
      max.current = null;
      zoomStep.current = 0;
    }
  }, [update, activeUnmute]);

  useEffect(() => {
    // if (
    //   (params[0] === "crop" ||
    //     (prevPage.current === "crop" && params[0] !== "crop")) &&
    //   (activeUnmute || (!activeUnmute && prevActive.current))
    // ) {
    //   // setUpdate((prev) => prev + 1);
    // }
    if (
      ((activeUnmute && prevPage.current === "crop" && params[0] !== "crop") ||
        (!activeUnmute && prevActive.current)) &&
      min.current
    ) {
      handleCrop();
      // dispatch(setImageRef(null));
      // dispatch(setRatio(0));
      // dispatch(updateZoomValue(0));
      // dispatch(setMinValue(0));
      // min.current = null;
      // max.current = null;
    }
    prevPage.current = params[0];
    prevActive.current = activeUnmute;
  }, [activeUnmute, params[0]]);

  const handleCrop = () => {
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
          setUpdate((prev) => prev + 1);
        });
      });
    });
  };

  const handleZoom = (e) => {
    if (e.type === "zoom") {
      if (!min.current) {
        const cropper = cropperRef.current.cropper;
        const canvasData = cropper.getCanvasData();
        const minZoomRatio = canvasData.width / canvasData.naturalWidth;
        min.current = minZoomRatio;
        max.current = estimateZoomCount(min.current);
        dispatch(setMinValue(minZoomRatio));
      }
      if (
        (max.current && e.detail.ratio > max.current) ||
        (min.current &&
          Number(e.detail.ratio.toFixed(4)) < Number(min.current.toFixed(4)))
      ) {
        e.preventDefault();
      } else {
        if (e.detail.ratio > e.detail.oldRatio) {
          zoomStep.current = zoomStep.current + 1;
        } else {
          zoomStep.current = zoomStep.current - 1;
        }
        dispatch(setRatio(e.detail.ratio));
        dispatch(updateZoomValue(zoomStep.current));
      }
    }
  };
  return (
    <div
      className={clsx(
        frame_width,
        "absolute h-full object-cover overflow-hidden"
      )}
      onTouchMoveCapture={() => {
        if (params[0] === "crop")
          swiperRef.current.swiper.allowTouchMove = false;
      }}
    >
      {!(activeUnmute && params[0] === "crop") && (
        // transparent box for disabling zoom without rendering
        <div className="disable-zoom">Empty Box</div>
      )}
      <Cropper
        key={String(index) + update}
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
        modal={false}
        highlight={false}
        background={false}
        guides={false}
        cropBoxResizable={false}
        center={false}
        cropBoxMovable={true}
        viewMode={3}
        dragMode="move"
        movable={true}
        autoCropArea={1}
        rotatable={false}
        cropend={() => {}}
        zoomable={true}
        wheelZoomRatio={0.1}
        zoom={handleZoom}
      />
    </div>
  );
};

export default CropperComponent;
