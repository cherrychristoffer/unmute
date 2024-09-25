import { React, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "wouter";

import { Loader } from "../components/Loader";

import { updateUnmuteInCart } from "../api/cart";
import { updateUnmutes } from "../features/user/userSlice";
import { useActiveUnmute } from "../api/useUnmutes";

import { getFileUrl, uploadFile } from "../api/aws";

export const UploadImagePage = () => {
  const dispatch = useDispatch();
  const [_location, navigate] = useLocation();
  const { activeUnmute } = useActiveUnmute();
  const [loading, setLoading] = useState(false);
  const unmutes = useSelector((state) => state.user.unmutes);

  const url = new URL(window.location);
  const type = url.searchParams.get("type");

  const uploadImage = async (item, file) => {
    try {
      const uuid = item.properties._uuid;
      await uploadFile({
        path: uuid,
        file,
      });
      const fileUrl = getFileUrl(`${uuid}/${file.name}`);

      const cart = await updateUnmuteInCart({
        key: item.key,
        properties: {
          ...item.properties,
          _images: [fileUrl], // TODO: Add to existing list of images
          _original_images: [fileUrl], // TODO: Add to existing list of images
        },
      });
      dispatch(updateUnmutes(cart.data.items));
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = async (event) => {
    setLoading(true);
    const file = event.target.files[0];
    await uploadImage(activeUnmute, file);
    setLoading(false);

    navigate("/orientation");
  };

  const handleCollageChange = async (event) => {
    setLoading(true);
    const files = event.target.files;
    for (var i = 0; i < unmutes.length; i++) {
      if (files[i]) {
        await uploadImage(unmutes[i], files[i]);
      }
    }
    setLoading(false);
    navigate("/orientation");
  };

  return (
    <div className="flex flex-col items-center py-24">
      <div className="content">
        <div className="mx-auto flex flex-col items-center">
          <h1 className="font-serif text-muld-1000 text-[50px] mb-4">Upload</h1>
          <h2 className="font-serif text-rose-500 text-[17px] text-center leading-tight">
            Vælg dit ønskede foto
          </h2>

          {loading && (
            <h2 className="mt-56 font-serif text-rose-500 text-3xl text-center flex flex-col items-center justify-center">
              Uploader...
              <Loader size={"w-24 h-24"} />
            </h2>
          )}

          {!loading && (
            <div className={"mt-56"}>
              {type !== "multiple" ? (
                <form>
                  <label
                    htmlFor="image"
                    className="block font-serif text-muld-1000 bg-white border border-rose-500 focus:outline-none hover:bg-rose-500 hover:text-white focus:ring-4 focus:ring-rose font-medium rounded-lg px-5 py-2.5 me-2 mb-2 cursor-pointer w-[270px] text-center"
                  >
                    Vælg fotos
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
                    className="block font-serif text-muld-1000 bg-white border border-rose-500 focus:outline-none hover:bg-rose-500 hover:text-white focus:ring-4 focus:ring-rose font-medium rounded-lg px-5 py-2.5 me-2 mb-2 cursor-pointer w-[270px] text-center"
                  >
                    Create Collage Choose photos
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
