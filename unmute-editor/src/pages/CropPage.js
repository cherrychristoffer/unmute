import React, {useEffect} from "react";
import {MinusIcon} from "../assets/icons/icon_minus";
import {PlusIcon} from "../assets/icons/icon_plus";
import {useSelector, useDispatch} from "react-redux";
import {setZoom} from "../features/user/userSlice";

export const CropPage = () => {
  const zoom = useSelector(state => state.user.zoom)
  const cropper = useSelector(state => state.user.cropper)
  const cropperReady = useSelector(state => state.user.cropperReady)
  const dispatch = useDispatch()

  useEffect(() => {
    if (cropperReady) {
      dispatch(setZoom(getMinZoomValue()))
    }
  }, [cropperReady])

  const handleIncrease = () => {
    handleRangeChange(zoom + 0.1)
  };

  const handleDecrease = () => {
    handleRangeChange(zoom - 0.1)
  };

  const handleRangeChange = (value) => {
    const newZoomValue = +(+value).toFixed(1)
    if (newZoomValue <= 3){
      const zoomRatio = newZoomValue - zoom;
      if (cropper) {
        cropper.zoom(zoomRatio);
      }
      dispatch(setZoom(newZoomValue))
    }
  };

  const getMinZoomValue = () => {
    if (!cropper) return 0;
    const containerData = cropper.getContainerData();
    const imageData = cropper.getImageData();
    const naturalHeight = imageData.naturalHeight;
    return +(containerData.height / naturalHeight).toFixed(1)
  };


  return (

        cropperReady && (    <div className={'pb-[67px]'}>
        <div className="mt-16 flex flex-row justify-center items-center gap-4">
          <button
              onClick={handleDecrease}
              className="w-[34px] h-[34px] bg-beige-600 rounded-full flex items-center justify-center"
          >
            <MinusIcon size={20} className={'fill-white'}/>
          </button>
          <input
              type="range"
              value={zoom}
              onChange={(e) => handleRangeChange(e.target.value)}
              className="w-96 h-3 bg-beige-600 rounded-lg appearance-none cursor-pointer"
              min={String(getMinZoomValue())}
              max='3'
              step='0.1'
          />
          <button
              onClick={handleIncrease}
              className="w-[34px] h-[34px] bg-beige-600 rounded-full flex items-center justify-center"
          >
            <PlusIcon size={20} className={'fill-white'}/>
          </button>
        </div>
        <p className={'font-serif text-rose-500 text-[12px] text-center leading-tight mt-6'}>Pinch to zoom, drag to move.</p>
      </div>)

  );
};
