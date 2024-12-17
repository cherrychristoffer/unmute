import { React, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'wouter';

import { Loader } from '../components/Loader';

import { updateUnmuteInCart } from '../api/cart';
import { updateUnmutes } from '../features/user/userSlice';
import { useActiveUnmute } from '../api/useUnmutes';

import { getFileUrl, uploadFile } from '../api/spaces';
import { setOrientationChanged } from '../features/image/imageSlice';

export const UploadImagePage = () => {
  const dispatch = useDispatch();
  const [_location, navigate] = useLocation();
  const { activeUnmute } = useActiveUnmute();
  const [loading, setLoading] = useState(false);
  const unmutes = useSelector((state) => state.user.unmutes);
  const [files, setFiles] = useState([]);

  const url = new URL(window.location);
  const type = url.searchParams.get('type');

  const uploadImage = async (item, file) => {
    try {
      const uuid = item.properties._uuid;
      const path = await uploadFile({
        file,
        path: uuid,
      });
      // Get the file URL from the path
      return getFileUrl(path); // Ensure this is returned
    } catch (err) {
      console.log(err);
      return null;
    }
  };

  const updateInCart = async (item, newFileUrls) => {
    const cart = await updateUnmuteInCart({
      key: item.key,
      properties: {
        ...item.properties,
        _images: [...newFileUrls, ...(item.properties._images || [])], // Place new images first
        _image_state: null,
        _original_images: [...newFileUrls, ...(item.properties._original_images || [])], // Place new original images first
      },
    });
    dispatch(updateUnmutes(cart.data.items));
  };

// Handle single file upload
  const handleChange = async (event) => {
    setLoading(true);
    const file = event.target.files[0];

    console.log('upload image type', file, file.type);

    try {
      // Upload the image
      const fileUrl = await uploadImage(activeUnmute, file);

      if (fileUrl) {
        // Update the cart with the new file URL
        await updateInCart(activeUnmute, [fileUrl]);
      }

      dispatch(setOrientationChanged(true));
      setLoading(false);
      navigate('/orientation');
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

// Handle multiple file uploads
  const handleCollageChange = async (event) => {
    setLoading(true);
    const files = Array.from(event.target.files).slice(0, activeUnmute.properties._collage_max_items);
    const newFileUrls = [];

    try {
      // Upload all files concurrently using Promise.all
      const uploadPromises = files.map((file) =>
        uploadImage(activeUnmute, file),
      );
      const fileUrls = await Promise.all(uploadPromises);

      // Filter out any null values in case of errors during upload
      const validFileUrls = fileUrls.filter((url) => url !== null);
      newFileUrls.push(...validFileUrls);

      // Update the cart once after all files have been uploaded
      if (newFileUrls.length > 0) {
        await updateInCart(activeUnmute, newFileUrls);
      }

      setLoading(false);
      navigate('/orientation');
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center py-24">
      <div className="content">
        <div className="mx-auto flex flex-col items-center">
          <h1 className="font-serif text-muld-1000 text-[50px] mb-4">Upload</h1>
          {type !== 'multiple' ? (
            <h2 className="font-serif text-rose-500 text-[17px] text-center leading-tight">
              Vælg dit yndlings-foto
            </h2>
          ) : (
            <>
              <h2 className="font-serif text-rose-500 text-[17px] text-center leading-tight">
                Vælg dine fotos
              </h2>
            </>
          )}

          {loading && (
            <h2 className="mt-56 font-serif text-rose-500 text-3xl text-center flex flex-col items-center justify-center">
              Uploader...
              <Loader size={'w-24 h-24'} />
            </h2>
          )}

          {!loading && (
            <div className={'mt-56'}>
              {type !== 'multiple' ? (
                <form>
                  <label
                    htmlFor="image"
                    className="flex justify-center w-[270px] text-white bg-rose-500 border border-rose-600 focus:outline-none hover:bg-rose-600 focus:ring-4 focus:ring-rose font-medium rounded-xl tracking-tight px-6 py-2.5 cursor-pointer text-center"
                  >
                    Vælg foto
                  </label>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    className="hidden"
                    id="image"
                    onChange={handleChange}
                  />
                </form>
              ) : (
                <form className="mt-5">
                  <label
                    htmlFor="image"
                    className="text-label block font-serif text-muld-1000 bg-white border border-rose-500 focus:outline-none hover:bg-rose-500 hover:text-white focus:ring-4 focus:ring-rose font-medium rounded-lg px-5 py-2.5 me-2 mb-2 cursor-pointer w-[270px] text-center"
                  >
                    Vælg fotos
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={handleCollageChange}
                    accept="image/png, image/jpeg, image/jpg"
                    className="hidden"
                    id="image"
                  />
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
