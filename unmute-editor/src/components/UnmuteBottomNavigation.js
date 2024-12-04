import { React, useEffect, useRef, useState } from 'react';

import clsx from 'clsx';

import { Link } from 'wouter';

import { NavAddIcon } from '../assets/icons/icon_nav_add_image';
import { NavCropIcon } from '../assets/icons/icon_nav_crop';
import { NavFrameIcon } from '../assets/icons/icon_nav_frame';
import { NavOrientationIcon } from '../assets/icons/icon_nav_orientation';
import { NavPassepartoutIcon } from '../assets/icons/icon_nav_passepartout';
import { NavReplaceIcon } from '../assets/icons/icon_nav_replace';
import { useDispatch, useSelector } from 'react-redux';
import { setChooseNewImage, setCollageChangeImage, setOrientationChanged, setScrolltoExtra } from '../features/image/imageSlice';
import { addBlankFrame, updateUnmutes } from '../features/user/userSlice';
import { CheckIcon } from '../assets/icons/icon_check';
import { NavCartIcon } from '../assets/icons/icon_nav_cart';
import { getFileUrl, uploadFile } from '../api/aws';
import { updateUnmuteInCart } from '../api/cart';
import { useActiveUnmute } from '../api/useUnmutes';
import ImageCropper from './ImageCropper';
import PinturaPortal from './Pintura';


export const UnmuteBottomNavigation = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const { activeUnmute } = useActiveUnmute();
  const editorRef = useRef(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const orientationChanged = useSelector((state) => state.image.orientationChanged);

  const activeUnmuteIndex = useSelector(state => state.user.activeUnmuteIndex);
  const [cropperOpen, setCropperOpen] = useState(false);

  const {
    properties: {
      _passepartout: passepartout,
      _orientation: orientation,
      _original_images: images,
      _ignore_small_image: ignoreSmallImage,
    } = {}, // Provide default empty object to prevent errors
  } = activeUnmute || {}; // Add a fallback for activeUnmute

  const { disableAllExtions } = useSelector((state) => state.image);
  const NAVIGATION = [
    {
      to: '/orientation',
      label: 'Orientering',
      icon: <NavOrientationIcon />,
    },
    /*{
      to: '/frame',
      label: 'Ramme',
      icon: <NavFrameIcon />,
    },*/
    {
      to: '/passepartout',
      label: 'Kant',
      icon: <NavPassepartoutIcon />,
    },
    /*{
      to: '/crop',
      label: 'Beskær',
      icon: <NavCropIcon />,
    },*/
    /*{
      to: '/replace',
      label: <>Skift&nbsp;foto</>,
      icon: <NavReplaceIcon />,
    },*/
  ];


  const handleReplace = async (event) => {
    const uuid = activeUnmute.properties._uuid;
    const file = event.target.files[0];
    setLoading(true);

    uploadFile({
      path: uuid,
      file,
    }).then((path) => {
      const fileUrl = getFileUrl(path);
      updateUnmuteInCart({
        key: activeUnmute.key,
        properties: {
          ...activeUnmute.properties,
          _images: [fileUrl],
          _original_images: [fileUrl],
        },
      }).then(({ data }) => {
        dispatch(updateUnmutes(data.items));
        setLoading(false);
      });
    });
  };

  const handleOpenEditor = () => {
    if (activeUnmute?.properties?._collage) {
      alert('Klik på det billede i din collage, som du vil redigere.');
    } else {
      setIsEditorOpen(true);
    }
  };

  const handleChangeImage = () => {
    if (activeUnmute?.properties?._collage) {
      dispatch(setCollageChangeImage(true));
    } else {
      dispatch(setChooseNewImage(true));
    }
  };

  useEffect(() => {
    if (orientationChanged && !activeUnmute?.properties?._collage) {
      setIsEditorOpen(true);
    }
  }, [orientationChanged]);

  return (
    <div className="fixed bottom-0 left-0 z-10 w-full bg-beige-300 border-t border-beige-200 sm:max-w-max sm:p-3 sm:rounded-xl sm:mx-auto sm:left-0 sm:right-0 sm:bottom-10">
      <div className="grid sm:gap-y-2 h-full max-w-2xl grid-cols-5 mx-auto font-medium">
        {NAVIGATION.map((item, index) => (
          <Link
            key={index}
            style={{
              opacity: disableAllExtions ? '0.5' : '',
              pointerEvents: disableAllExtions ? 'none' : '',
            }}
            to={item.to}
            className={(active) =>
              clsx(
                'inline-flex flex-col items-center justify-center py-3 group transition duration-200 ease-out hover:bg-beige-400 sm:px-4 sm:rounded-lg',
                active ? 'bg-beige-400' : '', item.disabled ? 'opacity-50 pointer-events-none' : '',
              )
            }
          >
            {item.icon}
            <p className="font-sans text-[10px] text-muld-1000 text-center mt-2">
              {item.label}
            </p>
          </Link>
        ))}
        {/*<Link
          to="/?stay=true"
          className={"inline-flex flex-col items-center justify-center py-3 group transition duration-200 ease-out hover:bg-beige-400 sm:px-4 sm:rounded-lg"}>
          <NavAddIcon />
          <p className="font-sans text-sm text-muld-1000 text-center mt-2">
            Tilføj ny
          </p>
        </Link>*/}
        {/*<button
          onClick={() => setCropperOpen(true)}
          className={'inline-flex flex-col items-center justify-center py-3 group transition duration-200 ease-out hover:bg-beige-400 sm:px-4 sm:rounded-lg'}
        >
          <NavCropIcon />
          <p className="font-sans text-[10px] text-muld-1000 text-center mt-2">
            Beskær
          </p>
        </button>*/}
        <button
          type={'button'}
          onClick={() => {
            handleOpenEditor();
          }}
          className={'cursor-pointer inline-flex flex-col items-center justify-center py-3 group transition duration-200 ease-out hover:bg-beige-400 sm:px-4 sm:rounded-lg'}
        >
          <NavCropIcon />
          <p className="font-sans text-[10px] text-muld-1000 text-center mt-2">
            Redigér
          </p>
        </button>
        <button
          type={'button'}
          onClick={() => {
            handleChangeImage();
          }}
          className={'cursor-pointer inline-flex flex-col items-center justify-center py-3 group transition duration-200 ease-out hover:bg-beige-400 sm:px-4 sm:rounded-lg'}
        >
          <NavReplaceIcon />
          <p className="font-sans text-[10px] text-muld-1000 text-center mt-2">
            Skift foto
          </p>
        </button>
        {/*<label
          className="inline-flex flex-col items-center justify-center py-3 group transition duration-200 ease-out hover:bg-beige-400 sm:px-4 sm:rounded-lg cursor-pointer"
          htmlFor={`change-photo`}>
          <NavReplaceIcon />
          <p className="font-sans text-[10px] text-muld-1000 text-center mt-2 !capitalize !tracking-normal">
            Skift foto
          </p>
        </label>
        <input
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          className="hidden"
          id={`change-photo`}
          onChange={handleReplace}
        />*/}
        <button
          type={'button'}
          onClick={() => {
            // redirect to cart
            window.location.href = '/cart';
          }}
          className={'cursor-pointer inline-flex flex-col items-center justify-center py-3 group transition duration-200 ease-out hover:bg-beige-400 sm:px-4 sm:rounded-lg'}
        >
          <NavCartIcon />
          <p className="font-sans text-[10px] text-muld-1000 text-center mt-2">
            Færdig
          </p>
        </button>
        {/*{images?.length ? (
          <ImageCropper open={cropperOpen} close={() => setCropperOpen(false)} orientation={orientation} passepartout={passepartout} imageSrc={images[0]} onCropComplete={(info) => {
            console.log(info);
          }} />
        ) : null}*/}
        {/*<button
          onClick={() => {
            dispatch(addBlankFrame());
            dispatch(setScrolltoExtra());
          }}
          className={"inline-flex flex-col items-center justify-center py-3 group transition duration-200 ease-out hover:bg-beige-400 sm:px-4 sm:rounded-lg"}
        >
          <NavAddIcon />
          <p className="font-sans text-sm text-muld-1000 text-center mt-2">
            Tilføj ny
          </p>
        </button>*/}
      </div>
      <PinturaPortal
        editorRef={editorRef}
        activeUnmute={activeUnmute}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
      />
    </div>
  );
};
