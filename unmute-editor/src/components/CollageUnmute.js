import { React, useEffect, useRef, useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import clsx from 'clsx';
import { getIOSVersion, isIphone13Plus } from '../hooks/helper'

const cssGrids = {
  'collage_1_1': {
    gridTemplateColumns: 'grid-cols-1',
    items: [
      '',
      '',
    ],
  },
  'collage_1_2': {
    gridTemplateColumns: 'grid-cols-2',
    items: [
      'col-span-2',
      '',
      '',
    ],
  },
  'collage_2_2': {
    gridTemplateColumns: 'grid-cols-2',
    items: [
      'h-full',
      'h-full',
      'h-full',
      'h-full',
    ],
  },
  'collage_2_1_2': {
    gridTemplateColumns: 'grid-cols-2',
    items: [
      '',
      '',
      'col-span-2',
      '',
      '',
    ],
  },
  'collage_1_2_2': {
    gridTemplateColumns: 'grid-cols-2',
    items: [
      'col-span-2',
      '',
      '',
      '',
      '',
    ],
  },
  'collage_2_2_2': {
    gridTemplateColumns: 'grid-cols-2',
    items: [
      '',
      '',
      '',
      '',
      '',
      '',
    ],
  },
  'collage_4_2_1_2_4': {
    gridTemplateColumns: 'grid-cols-4 grid-rows-4',
    items: [
      'hide-label',
      'hide-label',
      'hide-label',
      'hide-label',
      'hide-label',
      'col-span-2 row-span-2',
      'hide-label',
      'hide-label',
      'hide-label',
      'hide-label',
      'hide-label',
      'hide-label',
      'hide-label',
    ],
  },
};


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
import FileUpload from './FileUpload';
import PinturaPortal from './Pintura';
import PinturaCollagePortal from './PinturaCollage';
import FileUploadCollage from './FileUploadCollage';
import VButton from './VButton';

const frame_padding = (scale) => {
  return 7 * scale;
};

const CollageUnmute = ({
  unmute,
  onDelete,
  isActive,
  index,
  swiperRef,
  showChangeImageButton,
}) => {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [reorderActive, setReorderActive] = useState(false);
  const [reorderIndex1, setReorderIndex1] = useState(null);
  const [open, setOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const collageChangeImage = useSelector((state) => state.image.collageChangeImage);

  const [frameWidth, setFrameWidth] = useState();
  const frameRef = useRef();

  const handleClose = () => {
    setOpen(false);
  }

  const {
    properties: {
      _passepartout: passepartout,
      _orientation: orientation,
      _images: images,
      _collage_max_items: maxItems,
    },
  } = unmute;

  const scale = { none: 0, 2: 2, 5: 5, 7: 7 }[passepartout];
  const isLandscape = orientation === 'landscape';

  const frame = isLandscape ? frame_landscape_image : frame_image;
  const frame_width = isLandscape
    ? 'min-w-[300px] w-[55%]'
    : 'min-w-[250px] w-1/2';

  const handleSwapImages = (index) => {
    const newImages = [...images];
    const newOriginalImages = [...unmute.properties['_original_images']];
    const newImageStates = [...unmute.properties['_collage_image_states']];
    const temp = newImages[reorderIndex1];
    newImages[reorderIndex1] = newImages[index];
    newImages[index] = temp;
    const tempOriginal = newOriginalImages[reorderIndex1];
    newOriginalImages[reorderIndex1] = newOriginalImages[index];
    newOriginalImages[index] = tempOriginal;
    const tempState = newImageStates[reorderIndex1];
    newImageStates[reorderIndex1] = newImageStates[index];
    newImageStates[index] = tempState;
    updateUnmuteInCart({
      key: unmute.key,
      properties: {
        ...unmute.properties,
        _images: newImages,
        _collage_image_states: newImageStates,
        _original_images: newOriginalImages,
      },
    }).then(({ data }) => {
      setLoading(false);
      dispatch(updateUnmutes(data.items));
    });
    setReorderIndex1(null);
  };

  useEffect(() => {
    setFrameWidth(frameRef.current.offsetWidth);
  }, [frame]);


  const CollageItem = ({ image, index, activeUnmute }) => {
    const pondRef = useRef(null);
    const editorRef = useRef(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [loadingNewImage, setLoadingNewImage] = useState(false);

    const outerDivRef = useRef(null);
    const [aspectRatio, setAspectRatio] = useState(null);
    const [cropFormat, setCropFormat] = useState(null);

    useEffect(() => {
      const updateAspectRatio = () => {
        if (outerDivRef.current) {
          const { offsetWidth, offsetHeight } = outerDivRef.current;
          if (offsetWidth && offsetHeight) {
            setAspectRatio(`${offsetWidth} / ${offsetHeight}`);
            let string = `${offsetWidth}:${offsetHeight}`;
            setCropFormat(string.toString());
          }
        }
      };
      updateAspectRatio();
      window.addEventListener('resize', updateAspectRatio);
      return () => window.removeEventListener('resize', updateAspectRatio);
    }, []);

    const isIphone = isIphone13Plus() && getIOSVersion() >= 15

    return (
      <div ref={outerDivRef} className={`${cssGrids[unmute.properties['_collage_type']].items[index]} overflow-hidden relative bg-[#f1f0ef]`}>
        <div className={`${image ? 'hidden' : 'block'} h-full w-full collage-item md:absolute inset-0 min-h-[20px]`}>
          <FileUploadCollage ref={pondRef} index={index} isActive={false} cropFormat={cropFormat}
            uploading={() => {
              setLoadingNewImage(true);
            }} uploaded={() => {
              setLoadingNewImage(false);
            }} />
        </div>
        {image && (
          <>
            <img src={image} alt="img" className={`object-cover md:absolute w-full h-full inset-0 z-10 min-h-[20px] cursor-pointer transition-all ${(reorderActive || collageChangeImage) ? reorderIndex1 === index ? 'opacity-25' : 'hover:opacity-50' : ''}`} onClick={() => {
              if (collageChangeImage) {
                pondRef.current.browse();
              } else if (!reorderActive) {
                setIsEditorOpen(true);
              } else {
                if (reorderIndex1 === null) {
                  setReorderIndex1(index);
                } else {
                  handleSwapImages(index);
                }
              }
            }} />
            {aspectRatio && (
              <PinturaCollagePortal
                editorRef={editorRef}
                activeUnmute={activeUnmute}
                collageIndex={index}
                aspect={aspectRatio}
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
              />
            )}
          </>
        )}
      </div>
    );
  };

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
          <div className={`collage-container absolute top-[17px] left-[17px] w-[calc(100%-34px)] h-[calc(100%-34px)] !m-0 grid ${cssGrids[unmute.properties['_collage_type']].gridTemplateColumns} auto-rows-fr gap-3 bg-white`}
            style={{
              padding: `${frame_padding(scale)}px`,
            }}
          >
            {Array.from({ length: maxItems }, (_, index) => (
              <CollageItem
                key={index}
                image={images[index] || null}
                activeUnmute={unmute}
                index={index}
              />
            ))}
          </div>
          <button
            onClick={() => setOpenConfirm(true)}
            className="w-[34px] h-[34px] bg-beige-600 hover:bg-beige-700 rounded-full flex items-center justify-center absolute -top-4 -right-4 z-[20000000]"
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      {collageChangeImage ? (
        <div className="flex justify-center mt-5">
          <div className={'flex flex-col text-center gap-2'}>
            <span className={'text-[14px] font-medium'}>Klik på det billede du vil skifte.</span>
          </div>
        </div>
      ) : (
        <div className="flex justify-center mt-5">
          {!reorderActive ? (
            <VButton text={'Omrokér billeder'} color={'rose'} onClick={() => setReorderActive(true)} />
          ) : (
            <div className={'flex flex-col text-center gap-2'}>
              <span className={'text-[14px] font-medium'}>Klik på et billede og herefter det billede, det skal bytte plads med.</span>
              <VButton text={'Færdig'} color={'green'} onClick={() => {
                setReorderActive(false);
                setReorderIndex1(null);
              }} />
            </div>
          )}
        </div>
      )}

      {/* {
        !isMobile && (
          <div className={'flex items-start gap-3 mt-5 bg-white border border-zinc-200 rounded-lg p-4 text-[12px]'}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="20px" height="20px" className={'shrink-0'}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
            Det er vigtigt, at du klikker på hvert billede og sikrer dig, at beskæringen er som ønsket.
          </div>
        )
      } */}

      {
        isActive && (
          <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} open={open} sx={{
            left: '0!important',
            right: '0!important',
            transform: 'none!important'
          }} onClose={handleClose}>
            <div className={'flex items-start gap-3 p-4 rounded-lg bg-white border border-zinc-200 text-[12px]'}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="20px" height="20px" className={'shrink-0'}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
              </svg>
              Det er vigtigt, at du klikker på hvert billede og sikrer dig, at beskæringen er som ønsket.
              <button
                onClick={handleClose}
                className="w-[34px] h-[34px] rounded-full flex items-center justify-center"
              >
                <CloseIcon fill="black" />
              </button>
            </div>
          </Snackbar>
        )
      }

      {openConfirm && <ConfirmModal type={'denne UNMUTE'} onConfirm={() => {
        onDelete(unmute.properties._uuid);
        setOpenConfirm(false);
      }} onCancel={() => setOpenConfirm(false)} />}
    </>
  );
};

export default CollageUnmute;
