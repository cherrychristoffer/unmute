import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import clsx from 'clsx'
import { useParams } from 'wouter'
import {
  setImageRef,
  setMinValue,
  setRatio,
  updateZoomValue,
} from '../features/image/imageSlice'
import { getFileUrl, uploadFile } from '../api/aws'
import { updateUnmuteInCart } from '../api/cart'
import { updateUnmutes } from '../features/user/userSlice'
import { mergeImages } from '../hooks/mergeImage'

import '../assets/styles/custom-cropper.css'

const estimateZoomCount = (value, count = 0, values = {}) => {
  values[count] = value
  if (count < 30) {
    return estimateZoomCount(1.1 * value, ++count, values)
  }
  return { maxValue: value, values }
}

const returnZoomValues = (value) => {
  const estimatedValues = estimateZoomCount(value)
  return estimatedValues
}

const CropperComponent = ({
  scale,
  unmute,
  activeUnmute,
  index,
  swiperRef,
}) => {
  const dispatch = useDispatch()
  const cropperRef = useRef(null)
  const params = useParams()
  const min = useRef(null)
  const max = useRef(null)
  const prevPage = useRef(null)
  const prevActive = useRef(null)
  const [update, setUpdate] = useState(Math.floor(Date.now() / 1000))
  const zoomStep = useRef(0)
  const zoomValues = useRef({})
  const [isImageLoaded, setIsEmageLoaded] = useState(false)
  const { mustCropAsNumber } = useSelector((state) => state.image)

  useEffect(() => {
    if (
      !unmute?.properties?._default_cropped &&
      unmute?.properties?._images?.length &&
      isImageLoaded
    ) {
      setTimeout(() => {
        handleCrop({ key: '_default_cropped' })
      }, 100)
    }
  }, [unmute, isImageLoaded])

  useEffect(() => {
    if (
      activeUnmute &&
      mustCropAsNumber > 0 &&
      unmute?.properties?._images?.length
    ) {
      handleCrop({ key: '_default_cropped' })
    }
  }, [mustCropAsNumber])

  useEffect(() => {
    setUpdate(Math.floor(Date.now() / 1000))
    if (cropperRef.current && activeUnmute) {
      dispatch(setImageRef(cropperRef.current))
      dispatch(setRatio(0))
      dispatch(updateZoomValue(0))
      dispatch(setMinValue(0))
      min.current = null
      max.current = null
      zoomStep.current = 0
      zoomValues.current = 0
    }
  }, [scale, activeUnmute])

  useEffect(() => {
    if (
      ((activeUnmute && prevPage.current === 'crop' && params[0] !== 'crop') ||
        (!activeUnmute && prevActive.current)) &&
      min.current
    ) {
      handleCrop({ key: '_cropped', refresh: true })
    }
    prevPage.current = params[0]
    prevActive.current = activeUnmute
  }, [activeUnmute, params[0]])

  const handleCrop = ({ key, refresh = false }) => {
    if (!cropperRef.current) return
    const cropper = cropperRef.current?.cropper

    cropper?.getCroppedCanvas()?.toBlob((blob) => {
      const file = new File([blob], 'cropped.png', { type: 'image/png' })
      uploadFile({
        path: unmute.properties._uuid,
        file,
      }).then(async () => {
        const fileUrl = getFileUrl(`${unmute.properties._uuid}/cropped.png`)

        const finalImageUrl = await mergeImages(
          unmute.properties._uuid,
          [fileUrl],
          unmute.properties._orientation,
          unmute.properties._collage ? unmute.properties._collage_type : null,
          unmute.properties._passepartout
        )

        const properties = {
          ...unmute.properties,
          _images: [fileUrl],
          _cart_image: finalImageUrl,
          [key]: true, // key = _cropped or key = _default_cropped
        }

        if (key === '_cropped') properties._original_images = [fileUrl]

        updateUnmuteInCart({
          key: unmute.key,
          properties,
        })
          .then(({ data }) => {
            dispatch(updateUnmutes(data.items))
            if (refresh) setUpdate(Math.floor(Date.now() / 1000))
          })
          .catch((err) => console.log(err))
      })
    })
  }

  const handleZoom = (e) => {
    if (e.type === 'zoom') {
      if (!min.current) {
        const cropper = cropperRef.current.cropper
        const canvasData = cropper.getCanvasData()
        const minZoomRatio = canvasData.width / canvasData.naturalWidth
        min.current = minZoomRatio
        const estimatedValues = returnZoomValues(min.current)
        max.current = estimatedValues.maxValue
        zoomValues.current = estimatedValues.values
        dispatch(setMinValue(minZoomRatio))
      }

      const zommValuesArray = Object.entries(zoomValues.current)
      for (let i = 0; i < zommValuesArray.length; i++) {
        if (e.detail.ratio < zommValuesArray[0]?.[1]) {
          zoomStep.current = 0
          break
        }
        if (!zommValuesArray[i + 1]) {
          zoomStep.current = 30
          break
        }
        if (
          e.detail.ratio >= zommValuesArray[i][1] &&
          e.detail.ratio < zommValuesArray?.[i + 1]?.[1]
        ) {
          zoomStep.current = Number(zommValuesArray[i][0])
          break
        }
      }
      dispatch(updateZoomValue(zoomStep.current))

      if (
        (max.current && e.detail.ratio > max.current) ||
        (min.current &&
          Number(e.detail.ratio.toFixed(4)) < Number(min.current.toFixed(4)))
      ) {
        e.preventDefault()
      } else {
        dispatch(setRatio(e.detail.ratio))
      }
    }
  }

  const showImage = () => {
    if (!unmute?.properties) return null

    const { _original_images } = unmute?.properties
    return _original_images[_original_images?.length - 1]
  }

  return (
    <div
      key={String(index) + update}
      className={`w-full h-full`}
      /*style={{
        top: `${frame_padding}px`,
        left: `${frame_padding}px`,
        right: `${frame_padding}px`,
        bottom: `${frame_padding}px`,
      }}*/
      onMouseOver={() => {
        if (params[0] === 'crop')
          swiperRef.current.swiper.allowTouchMove = false
      }}
      onMouseLeave={() => {
        if (params[0] === 'crop') swiperRef.current.swiper.allowTouchMove = true
      }}
      onTouchMoveCapture={() => {
        if (params[0] === 'crop')
          swiperRef.current.swiper.allowTouchMove = false
      }}
    >
      {!(activeUnmute && params[0] === 'crop') && (
        // transparent box for disabling zoom without rendering
        <div className="disable-zoom">Empty Box</div>
      )}
      <Cropper
        ref={cropperRef}
        src={showImage()}
        className={clsx(
          //frame_width,
          `bg-green-500 w-full h-full object-cover overflow-hidden`
        )}
        crossOrigin="anonymous"
        checkCrossOrigin={true}
        checkOrientation={false}
        modal={false}
        highlight={false}
        background={false}
        guides={true}
        cropBoxResizable={false}
        center={true}
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
        onLoad={(e) => setIsEmageLoaded(true)}
      />
    </div>
  )
}

export default CropperComponent
