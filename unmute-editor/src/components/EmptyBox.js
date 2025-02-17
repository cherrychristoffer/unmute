import React, { useState } from 'react';
import frame_image from '../assets/images/frame.png';
import frame_landscape_image from '../assets/images/frame_landscape.png';
import clsx from 'clsx';
import { useDispatch } from 'react-redux';
import { PlusIcon } from '../assets/icons/icon_plus';
// import { Loader } from './Loader';
import { addUnmuteToCart, updateUnmuteInCart } from '../api/cart';
import { addUnmute, updateUnmutes } from '../features/user/userSlice';
import { getFileUrl, uploadFile } from '../api/aws';
// import FileUpload from './FileUpload';
import { Link, useLocation } from 'wouter';

export const EmptyBox = ({ orientation }) => {
  const dispatch = useDispatch();
  const [_location, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  // const [key, setKey] = useState(0);

  const isLandscape = orientation === 'landscape';
  const frame = isLandscape ? frame_landscape_image : frame_image;
  const frame_width = isLandscape
    ? 'min-w-[300px] w-[55%]'
    : 'min-w-[250px] w-1/2';

  const handleChange = async (event) => {
    setLoading(true);
    addUnmuteToCart({ quantity: 1, extra: true }).then(({ data }) => {
      const unmute = data.items?.[0];
      if (!unmute) return;
      dispatch(addUnmute(unmute));

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
          dispatch(updateUnmutes(data.items));
        });
      });
    });
  };

  return (
    <>
      <div className="snap-center flex items-center py-4">
        <div
          className={clsx(
            'relative flex justify-center',
            isLandscape ? 'mt-0' : 'mt-0',
          )}
        >
          <div className="absolute top-[30px] z-[2] extra-box text-rose-500 text-center text-[14px] -mt-[5px]">
            Tilføj ekstra UNMUTE<br/>og spar penge
          </div>
          <img
            src={frame}
            alt="Frame"
            className={clsx(
              frame_width,
              'relative top-0 z-[1] pointer-events-none',
            )}
          />
          <Link className={'absolute inset-[16px]'} to="/?stay=true">
            <div className={'w-[68px] h-[68px] bg-rose-500 hover:bg-rose-700 cursor-pointer fill-white rounded-full flex items-center justify-center absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 z-10'}>
              <PlusIcon size={40} />
            </div>
            <span className={'absolute left-[29%] w-[85px] top-[65%] text-center !text-[16px]'}>Vælg foto eller kollage</span>
            {/*<FileUpload newUnmute={true} uploading={() => setLoading(true)} uploaded={() => {
              setKey(key + 1);
              setLoading(false);
            }} />*/}
          </Link>
        </div>
      </div>
    </>
  );
};
