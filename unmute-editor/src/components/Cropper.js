import { Cropper } from "react-cropper";
import { useDispatch } from "react-redux";
import {
  setImageRef,
  setMinValue,
  setRatio,
  updateZoomValue,
} from "../features/image/imageSlice";
import { useEffect, useRef } from "react";
import clsx from "clsx";

const CropperComponent = ({
  images,
  frame_width,
  isLandscape,
  frame_padding,
  scale,
}) => {
  const dispatch = useDispatch();
  const cropperRef = useRef(null);
  const min = useRef(null);
  let zoomStep = 0;

  useEffect(() => {
    if (cropperRef.current) {
      dispatch(setImageRef(cropperRef.current));
    }
  }, []);
  const handleCrop = (e) => {
    if (e.type === "zoom") {
      if (!min.current) {
        const cropper = cropperRef.current.cropper;
        const canvasData = cropper.getCanvasData();
        const minZoomRatio = canvasData.width / canvasData.naturalWidth;
        min.current = minZoomRatio;
        dispatch(setMinValue(minZoomRatio));
      }
      if (
        e.detail.ratio > 14 ||
        (min.current && e.detail.ratio < min.current)
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
      zoomable={true}
      wheelZoomRatio={0.1}
      zoom={handleCrop}
    />
  );
};

export default CropperComponent;
