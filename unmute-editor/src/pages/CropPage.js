import React from 'react'
import { MinusIcon } from '../assets/icons/icon_minus'
import { PlusIcon } from '../assets/icons/icon_plus'
import { useDispatch, useSelector } from 'react-redux'
import { setLastSaved, updateZoomValue } from '../features/image/imageSlice'
import VButton from '../components/VButton'
import { useLocation, useRouter } from 'wouter'

export const CropPage = () => {
  const dispatch = useDispatch()
  const [_location, navigate] = useLocation()
  const { zoomValue, imageRef, minValue, ratio } = useSelector(
    (state) => state.image
  )

  const handleIncrease = () => {
    if (zoomValue < 3) {
      const cropper = imageRef?.cropper
      if (minValue === 1 && cropper) {
        const canvasData = cropper.getCanvasData()
        const minZoomRatio = canvasData.width / canvasData.naturalWidth
        cropper.zoomTo(minZoomRatio * 1.1)
        dispatch(updateZoomValue(minZoomRatio * 1.1))
      } else if (cropper) {
        const newZoom = (ratio || minValue) * 1.1
        cropper.zoomTo(newZoom)
        dispatch(updateZoomValue(newZoom))
      }
    }
  }

  const handleDecrease = () => {
    if (zoomValue > 1) {
      const cropper = imageRef?.cropper
      if (cropper) {
        const newZoom = ratio / 1.1
        cropper.zoomTo(newZoom)
        dispatch(updateZoomValue(newZoom))
      }
    }
  }

  const handleRangeChange = (event) => {
    const newValue = event.target.value
    dispatch(updateZoomValue(newValue)) // Update zoom value in Redux state
  }

  return (
    <div className="crop-page-container pb-[100px] sm:pb-[140px] mt-[20px]">
      <div className="zoom-controls flex flex-row justify-center items-center gap-4">
        <button
          onClick={handleDecrease}
          className="w-[34px] h-[34px] bg-beige-600 rounded-full flex items-center justify-center"
        >
          <MinusIcon size={20} className="fill-white" />
        </button>
        <input
          type="range"
          value={zoomValue}
          min="1"
          max="3"
          step="0.1"
          onChange={handleRangeChange}
          className="w-96 h-3 bg-beige-600 rounded-lg appearance-none cursor-pointer"
        />
        <button
          onClick={handleIncrease}
          className="w-[34px] h-[34px] bg-beige-600 rounded-full flex items-center justify-center"
        >
          <PlusIcon size={20} className="fill-white" />
        </button>
      </div>

      <p className="font-serif text-rose-500 text-[12px] text-center leading-tight mt-4">
        Knip for at zoome, træk for at flytte
      </p>

      <div className={'flex justify-center mt-4'}>
        <VButton
          text={'Gem beskæring'}
          onClick={() => {
            dispatch(setLastSaved(Math.floor(Date.now() / 1000)))
            navigate('/orientation')
          }}
        />
      </div>
    </div>
  )
}
