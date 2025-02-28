import React, { useState, useEffect, useRef } from 'react'
import { setImageRef, updateZoomValue } from '../features/image/imageSlice'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'wouter'
import { getCroppedImg } from '../hooks/cropImage'
import { getFileUrl, uploadFile } from '../api/aws'
import { updateUnmuteInCart } from '../api/cart'
import { updateUnmutes } from '../features/user/userSlice'

const ImageEditor = ({
  image,
  orientation,
  passepartout,
  cropData,
  unmute,
  activeUnmute,
  swiperRef,
}) => {
  const dispatch = useDispatch()
  const params = useParams()
  const cropperRef = useRef(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [crop, setCrop] = useState(
    unmute.properties._crop_data || { x: 0, y: 0 }
  )
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const min = useRef(null)
  const max = useRef(null)
  const { zoomValue, lastSaved } = useSelector((state) => state.image)

  useEffect(() => {
    setIsInitialized(true)
  }, [])

  useEffect(() => {
    if (!unmute.properties._crop_data && croppedAreaPixels && isInitialized) {
      setTimeout(() => {
        saveCroppedImage(image, croppedAreaPixels).then()
      }, 2000)
    }
  }, [croppedAreaPixels])

  useEffect(() => {
    if (lastSaved && activeUnmute) {
      saveCroppedImage(image, croppedAreaPixels).then()
    }
  }, [lastSaved])

  useEffect(() => {
    if (cropperRef.current && activeUnmute) {
      dispatch(setImageRef(cropperRef.current))
      dispatch(updateZoomValue(unmute.properties._zoom || 1))
      min.current = null
      max.current = null
    }
  }, [activeUnmute])

  const baseWidth = orientation === 'landscape' ? 268 : 218
  const baseHeight = orientation === 'landscape' ? 203.58 : 286.5

  // Adjust aspect ratio to include passepartout
  const adjustedWidth = baseWidth - passepartout * 7 * 2
  const adjustedHeight = baseHeight - passepartout * 7 * 2

  const aspect = adjustedWidth / adjustedHeight

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }

  const saveCroppedImage = async (imageSrc, crop) => {
    if (!imageSrc || !crop) {
      return
    }
    try {
      const blob = await getCroppedImg(imageSrc, crop)
      const file = new File([blob], 'cropped.png', { type: 'image/png' })
      // Upload the file and get the file URL
      uploadFile({
        path: unmute.properties._uuid,
        file,
      })
        .then((path) => {
          const fileUrl = getFileUrl(path)
          const properties = {
            ...unmute.properties,
            _images: [fileUrl],
            _crop_data: crop,
            _zoom: zoomValue,
          }

          // Update the cart with new properties
          updateUnmuteInCart({
            key: unmute.key,
            properties,
          })
            .then(({ data }) => {
              dispatch(updateUnmutes(data.items))
            })
            .catch((err) => console.log(err))
        })
        .catch((err) => console.log('Upload failed:', err))
    } catch (e) {
      console.error('Failed to crop the image:', e)
    }
  }

  useEffect(() => {
    // Reset crop and zoom when orientation or passepartout changes
    setCrop({ x: 0, y: 0 })
  }, [orientation, passepartout])

  return (
    <div
      className="image-editor h-full w-full"
      onMouseOver={() => {
        if (params[0] === 'crop') {
          swiperRef.current.swiper.allowTouchMove = false
        }
      }}
      onMouseLeave={() => {
        if (params[0] === 'crop') {
          swiperRef.current.swiper.allowTouchMove = true
        }
      }}
      onTouchMoveCapture={() => {
        if (params[0] === 'crop') {
          swiperRef.current.swiper.allowTouchMove = false
        }
      }}
    >
      <div
        style={{
          position: 'relative',
          width: `${adjustedWidth}px`,
          height: `${adjustedHeight}px`,
        }}
      >
        <Cropper
          ref={cropperRef}
          image={image}
          crop={crop}
          zoom={activeUnmute ? zoomValue : unmute.properties._zoom || 1}
          objectFit={'cover'}
          aspect={aspect}
          showGrid={false}
          onTouchRequest={(e) => {
            if (params[0] !== 'crop' || !activeUnmute) {
              return false
            } else {
              return true
            }
          }}
          initialCroppedAreaPixels={cropData || null}
          zoomWithScroll={false}
          onCropChange={setCrop}
          onZoomChange={(value) => {
            dispatch(updateZoomValue(value))
          }}
          /*onMediaLoaded={(mediaSize) => {
            const { width, height } = mediaSize;
            const minZoom = Math.min(width / adjustedWidth, height / adjustedHeight);
            const maxZoom = Math.max(width / adjustedWidth, height / adjustedHeight);
            min.current = minZoom;
            max.current = maxZoom;
            dispatch(updateZoomValue(minZoom));
          }}*/
          onCropComplete={onCropComplete}
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      </div>
    </div>
  )
}

export default ImageEditor
