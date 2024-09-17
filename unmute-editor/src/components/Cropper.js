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
import "./custom-cropper.css";
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
}) => {
  const dispatch = useDispatch();
  const cropperRef = useRef(null);
  const params = useParams();
  const min = useRef(null);
  const max = useRef(null);
  const prevPage = useRef(null);
  const prevActive = useRef(null);
  const [update, setUpdate] = useState(0);
  let zoomStep = 0;

  useEffect(() => {
    if (cropperRef.current && activeUnmute) {
      dispatch(setImageRef(cropperRef.current));
      dispatch(setRatio(0));
      dispatch(updateZoomValue(0));
      min.current = null;
      max.current = null;
    }
  }, [update, activeUnmute]);

  useEffect(() => {
    if (
      (params[0] === "crop" ||
        (prevPage.current === "crop" && params[0] !== "crop")) &&
      (activeUnmute || (!activeUnmute && prevActive.current))
    ) {
      setUpdate((prev) => prev + 1);
    }
    prevPage.current = params[0];
    prevActive.current = activeUnmute;
  }, [activeUnmute, params[0]]);

  const handleCrop = useDebouncedCallback((e) => {
    if (params[0] !== "crop" || !activeUnmute) return;

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
  }, 500);

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
          ++zoomStep;
        } else {
          --zoomStep;
        }
        dispatch(setRatio(e.detail.ratio));
        dispatch(updateZoomValue(zoomStep));
      }
    }
  };
  return (
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
      guides={activeUnmute && params[0] === "crop"}
      cropBoxResizable={activeUnmute && params[0] === "crop"}
      center={activeUnmute && params[0] === "crop"}
      cropBoxMovable={true}
      viewMode={3}
      dragMode="move"
      movable={true}
      autoCropArea={1}
      rotatable={false}
      cropend={handleCrop}
      zoomable={activeUnmute && params[0] === "crop"}
      wheelZoomRatio={0.1}
      zoom={handleZoom}
    />
  );
};

export default CropperComponent;
