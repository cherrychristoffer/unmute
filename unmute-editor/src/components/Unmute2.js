import { React, useEffect, useRef, useState } from 'react'

import clsx from 'clsx'

import { useDispatch } from 'react-redux'
import { CloseIcon } from '../assets/icons/icon_close'

import { Loader } from './Loader'

import { getFileUrl, uploadFile } from '../api/spaces'
import { updateUnmuteInCart } from '../api/cart'
import { updateUnmutes } from '../features/user/userSlice'
import { photosEnhance } from '../api/image'

import { base64ToFile } from '../hooks/helper'
import frame_image from '../assets/images/frame.png'
import frame_landscape_image from '../assets/images/frame_landscape.png'

import { ConfirmModal } from './ConfirmModal'
import VButton from './VButton'
import FileUpload from './FileUpload'
import { getFileNameWithoutExtension } from '../hooks/helper'
import { mergeImages } from '../hooks/mergeImage'

const frame_padding = (scale) => {
  return 7 * scale
}

const Unmute2 = ({
  unmute,
  onDelete,
  isActive,
  index,
  swiperRef,
  showChangeImageButton,
}) => {
  const dispatch = useDispatch()

  const [loading, setLoading] = useState(false)
  const [loadingNewImage, setLoadingNewImage] = useState(false)
  const [smallImage, setSmallImage] = useState(false)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [openEnhancingConfirm, setOpenEnhancingConfirm] = useState(false)
  const [enhancedImage, setEnhancedImage] = useState(null)

  const [frameWidth, setFrameWidth] = useState()
  const pondRef = useRef()
  const frameRef = useRef()

  const handleChange = async (event) => {
    setLoading(true)
    const uuid = unmute.properties._uuid
    const file = event.target.files[0]

    uploadFile({
      path: uuid,
      file,
    }).then(async (path) => {
      const fileUrl = getFileUrl(path)
      const finalImageUrl = await mergeImages(
        unmute.properties._uuid,
        [fileUrl],
        unmute.properties._orientation,
        null,
        unmute.properties._passepartout
      )

      updateUnmuteInCart({
        key: unmute.key,
        properties: {
          ...unmute.properties,
          _images: [fileUrl],
          _cart_image: finalImageUrl,
          _original_images: [fileUrl],
        },
      }).then(({ data }) => {
        setLoading(false)
        setSmallImage(false)
        dispatch(updateUnmutes(data.items))
      })
    })
  }

  const handleIgnoreSmallImage = async () => {
    setLoading(true)
    updateUnmuteInCart({
      key: unmute.key,
      properties: {
        ...unmute.properties,
        _ignore_small_image: true,
      },
    }).then(({ data }) => {
      setLoading(false)
      setSmallImage(false)
      dispatch(updateUnmutes(data.items))
    })
  }

  const saveEnhancedImage = async () => {
    if (!enhancedImage) {
      return
    }
    setOpenEnhancingConfirm(false)
    setLoading(true)
    const uuid = unmute.properties._uuid
    const imageUrl = unmute.properties._images[0]
    const filename = getFileNameWithoutExtension(imageUrl)
    const file = base64ToFile(enhancedImage, `enhanced-${filename}.png`)
    uploadFile({
      path: uuid,
      file,
    }).then(async (path) => {
      const fileUrl = getFileUrl(path)
      const finalImageUrl = await mergeImages(
        unmute.properties._uuid,
        [fileUrl],
        unmute.properties._orientation,
        null,
        unmute.properties._passepartout
      )
      updateUnmuteInCart({
        key: unmute.key,
        properties: {
          ...unmute.properties,
          _images: [fileUrl],
          _image_state: null,
          _cart_image: finalImageUrl,
          _touched_images: [imageUrl],
          _original_images: [unmute.properties._original_images[0]],
        },
        enhanced: true,
      }).then(({ data }) => {
        setLoading(false)
        setSmallImage(false)
        dispatch(updateUnmutes(data.items))
      })
    })
  }

  const cancelEnhancing = async () => {
    setEnhancedImage(null)
    setSmallImage(true)
    setOpenEnhancingConfirm(false)
  }

  const handleEnhanceSmallImage = async () => {
    setLoading(true)
    const imageUrl = unmute.properties._images[0]
    const extractedPath = imageUrl.split('.com/')[1]
    const res = await photosEnhance(extractedPath)
    setEnhancedImage(res)
    setOpenEnhancingConfirm(true)
    setSmallImage(false)
    setLoading(false)
  }

  const {
    properties: {
      _passepartout: passepartout,
      _orientation: orientation,
      _images: images,
      _ignore_small_image: ignoreSmallImage,
      _crop_data: cropData,
    },
  } = unmute

  const scale = { none: 0, 2: 2, 5: 5, 7: 7 }[passepartout]
  const isLandscape = orientation === 'landscape'

  const frame = isLandscape ? frame_landscape_image : frame_image
  const frame_width = isLandscape ? 'w-[300px]' : 'w-[250px]'

  /*useEffect(() => {
    if (isActive) {
      dispatch(setDisableAllActions(smallImage));
    }
  }, [isActive, smallImage]);*/

  const handleImageLoad = (event) => {
    const { naturalWidth, naturalHeight } = event.target
    if (naturalWidth < 637 && naturalHeight < 850) {
      setSmallImage(true)
    } else {
      setSmallImage(false)
    }
  }

  useEffect(() => {
    setFrameWidth(frameRef.current.offsetWidth)
  }, [frame])

  const allImages = enhancedImage ? [enhancedImage, ...images] : images

  return (
    <>
      <div
        className={clsx(
          isLandscape ? 'w-[300px]' : 'w-[250px]',
          'snap-center flex items-center py-4'
        )}
      >
        <div
          className={clsx(
            'relative flex justify-center',
            isLandscape ? 'mt-0' : 'mt-0'
          )}
        >
          <img
            ref={frameRef}
            src={frame}
            alt="Frame"
            className={clsx(
              frame_width,
              'relative top-0 z-[2] pointer-events-none'
            )}
          />
          <img
            src={allImages}
            alt="Frame"
            onLoad={handleImageLoad}
            className={'hidden'}
          />

          <div
            className={`absolute inset-[16px]`}
            style={{
              padding: `${frame_padding(scale)}px`,
            }}
          >
            <div
              className={`${images && images.length > 0 ? 'hidden' : 'block'}`}
            >
              <FileUpload
                ref={pondRef}
                isActive={isActive}
                uploading={() => {
                  setLoadingNewImage(true)
                }}
                uploaded={() => {
                  setLoadingNewImage(false)
                }}
              />
            </div>
            <button
              onClick={() => setOpenConfirm(true)}
              className="w-[34px] h-[34px] bg-beige-600 hover:bg-beige-700 rounded-full flex items-center justify-center absolute -top-10 -right-10 z-[20000000]"
            >
              <CloseIcon />
            </button>
            {images && images.length > 0 ? (
              <>
                <div className={'w-full h-full'}>
                  <img
                    src={enhancedImage || images[0]}
                    alt="Frame"
                    className={'w-full h-full object-cover'}
                  />
                </div>
              </>
            ) : null}
            {loadingNewImage && (
              <div className="absolute inset-0 bg-white bg-opacity-90 z-10">
                <div className="flex items-center justify-center absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 z-10">
                  <Loader size={'w-24 h-24'} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {smallImage && !ignoreSmallImage && (
        <div>
          <div className="bg-red-50 p-4 rounded-xl">
            <div className="flex">
              <div className="ml-3">
                <h3 className="tracking-tight font-semibold text-red-700">
                  For lav opløsning
                </h3>
                <div className="mt-2 text-lg text-red-700">
                  <p>
                    Vælg et billede med højere opløsning for at sikre den bedste
                    kvalitet.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex mt-3 p-3">
              <VButton
                color={'red'}
                text={'Brug alligevel'}
                onClick={handleIgnoreSmallImage}
                className={'w-full'}
              />
            </div>
            <div className="flex mt-3 p-3">
              <VButton
                color={'black'}
                text={'Forbedr med AI'}
                onClick={() => handleEnhanceSmallImage()}
                className={'w-full'}
              />
            </div>
          </div>
          {/*<div className="text-rose-500 text-center pt-8">
            For lav opløsning
          </div>*/}
          {showChangeImageButton && (
            <div className="flex justify-center mt-5">
              <label
                htmlFor={`mage-add-${unmute.key}`}
                onClick={() => setOpenConfirm(true)}
                className="w-full text-label font-serif text-white bg-rose-500 border border-rose-600 focus:outline-none hover:bg-rose-600 focus:ring-4 focus:ring-rose font-medium rounded-xl px-8 py-2.5 cursor-pointer text-center"
              >
                Tilføj nyt foto
              </label>
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                className="hidden"
                id={`mage-add-${unmute.key}`}
                onChange={handleChange}
              />
            </div>
          )}
        </div>
      )}

      {openConfirm && (
        <ConfirmModal
          type={'denne UNMUTE'}
          onConfirm={() => {
            onDelete(unmute.properties._uuid)
            setOpenConfirm(false)
          }}
          onCancel={() => setOpenConfirm(false)}
        />
      )}

      {openEnhancingConfirm && (
        <ConfirmModal
          title={'Vil du bruge det forbedrede billede?'}
          text="Vælg om du vil bruge"
          buttonText="Ja (+49kr)"
          cancelText="Nej"
          onConfirm={() => {
            saveEnhancedImage()
          }}
          onCancel={() => cancelEnhancing()}
        />
      )}
    </>
  )
}

export default Unmute2
