import { React, useEffect, useRef, useState } from 'react';

import clsx from 'clsx';

import { useDispatch, useSelector } from 'react-redux';
import { CloseIcon } from '../assets/icons/icon_close';
import { ExclamationIcon } from '../assets/icons/icon_exclamation';
import { PlusIcon } from '../assets/icons/icon_plus';

import { Loader } from './Loader';

import { getFileUrl, uploadFile } from '../api/aws';
import { updateUnmuteInCart } from '../api/cart';
import { updateUnmutes } from '../features/user/userSlice';

import frame_image from '../assets/images/frame.png';
import frame_landscape_image from '../assets/images/frame_landscape.png';

import CropperComponent from './Cropper';
import { setDisableAllActions } from '../features/image/imageSlice';
import { ConfirmModal } from './ConfirmModal';
import VButton from './VButton';

const frame_padding = (scale, landscape) => {
  return 16 + scale;
};

const Unmute = ({
                  unmute,
                  onDelete,
                  activeUnmute,
                  index,
                  swiperRef,
                  showChangeImageButton,
                }) => {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [smallImage, setSmallImage] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);

  const [frameWidth, setFrameWidth] = useState();
  const frameRef = useRef();

  const handleChange = async (event) => {
    setLoading(true);
    const uuid = unmute.properties._uuid;
    const file = event.target.files[0];

    uploadFile({
      path: uuid,
      file,
    }).then((path) => {
      const fileUrl = getFileUrl(path);
      updateUnmuteInCart({
        key: unmute.key,
        properties: {
          ...unmute.properties,
          _images: [fileUrl],
          _original_images: [fileUrl],
        },
      }).then(({ data }) => {
        setLoading(false);
        setSmallImage(false);
        dispatch(updateUnmutes(data.items));
      });
    });
  };

  const handleIgnoreSmallImage = async () => {
    setLoading(true);
    updateUnmuteInCart({
      key: unmute.key,
      properties: {
        ...unmute.properties,
        _ignore_small_image: true,
      },
    }).then(({ data }) => {
      setLoading(false);
      setSmallImage(false);
      dispatch(updateUnmutes(data.items));
    });
  }

  const {
    properties: {
      _passepartout: passepartout,
      _orientation: orientation,
      _original_images: images,
      _ignore_small_image: ignoreSmallImage,
    },
  } = unmute;

  const scale = { none: 0, 2: 16, 5: 30, 7: 40 }[passepartout];
  const isLandscape = orientation === 'landscape';

  const frame = isLandscape ? frame_landscape_image : frame_image;
  const frame_width = isLandscape
    ? 'min-w-[300px] w-[55%]'
    : 'min-w-[250px] w-1/2';

  /*useEffect(() => {
    if (activeUnmute) {
      dispatch(setDisableAllActions(smallImage));
    }
  }, [activeUnmute, smallImage]);*/

  const handleImageLoad = (event) => {
    const { naturalWidth, naturalHeight } = event.target;
    if (naturalWidth < 637 && naturalHeight < 850) {
      setSmallImage(true);
    } else {
      setSmallImage(false);
    }
  };

  useEffect(() => {
    setFrameWidth(frameRef.current.offsetWidth);
  }, [frame]);

  return (
    <>
      <div className={clsx(isLandscape ? 'w-[300px]' : 'w-[250px]', 'snap-center flex items-center py-4')}>
        <div
          className={clsx(
            'relative flex justify-center',
            isLandscape ? 'mt-0' : 'mt-0',
          )}
        >
          <img
            ref={frameRef}
            src={frame}
            alt="Frame"
            className={clsx(
              frame_width,
              'relative top-0 z-[2] pointer-events-none',
            )}
          />
          <img
            src={images}
            alt="Frame"
            onLoad={handleImageLoad}
            className={'hidden'}
          />
          {images && images.length > 0 ? (
            <div className={'absolute inset-0 p-[16px]'}>
              <CropperComponent
                images={images}
                frame_padding={frame_padding(scale, isLandscape)}
                scale={scale}
                frame_width={frame_width}
                isLandscape={isLandscape}
                unmute={unmute}
                activeUnmute={activeUnmute}
                index={index}
                swiperRef={swiperRef}
              />
              <button
                onClick={() => setOpenConfirm(true)}
                className="w-[34px] h-[34px] bg-beige-600 hover:bg-beige-700 rounded-full flex items-center justify-center absolute -top-4 -right-4 z-[20000000]"
              >
                <CloseIcon />
              </button>
              {/*{smallImage ? (
                <button
                  onClick={() => setOpenConfirm(true)}
                  className="w-[34px] h-[34px] bg-beige-600 hover:bg-beige-700 rounded-full flex items-center justify-center absolute -top-4 -right-4 z-[20000000]"
                >
                  <ExclamationIcon size={20} />
                </button>
              ) : (
                <button
                  onClick={() => setOpenConfirm(true)}
                  className="w-[34px] h-[34px] bg-beige-600 hover:bg-beige-700 rounded-full flex items-center justify-center absolute -top-4 -right-4 z-[20000000]"
                >
                  <CloseIcon />
                </button>
              )}*/}
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 z-10">
              <Loader size={'w-24 h-24'} />
            </div>
          ) : (
            <>
              <label className={'w-[68px] h-[68px] bg-rose-500 hover:bg-rose-700 cursor-pointer fill-white rounded-full flex items-center justify-center absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 z-10'} htmlFor={`mage-add-${unmute.key}`}>
                <PlusIcon size={40} />
              </label>
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                className="hidden"
                id={`mage-add-${unmute.key}`}
                onChange={handleChange}
              />
            </>
          )}
        </div>
      </div>

      {(smallImage && !ignoreSmallImage) && (
        <div>
          <div className="bg-red-50 p-4 rounded-xl">
            <div className="flex">
              <div className="ml-3">
                <h3 className="tracking-tight font-semibold text-red-700">For lav opløsning</h3>
                <div className="mt-2 text-lg text-red-700">
                  <p>
                    Vælg et billede med højere opløsning for at sikre den bedste kvalitet.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex mt-3 p-3">
              <VButton color={'red'} text={'Brug alligevel'} onClick={handleIgnoreSmallImage} className={'w-full'} />
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

      {openConfirm && <ConfirmModal type={'denne UNMUTE'} onConfirm={() => {
        onDelete(unmute.key);
        setOpenConfirm(false);
      }} onCancel={() => setOpenConfirm(false)} />}
    </>
  );
};

export default Unmute;
