import { React, useState } from "react";

import { useDispatch } from "react-redux";
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

  const handleChange = async (event) => {
    setLoading(true);
    const uuid = activeUnmute.properties._uuid;
    const file = event.target.files[0];

    uploadFile({
      path: uuid,
      file,
    }).then(() => {
      const fileUrl = getFileUrl(`${uuid}/${file.name}`);

      updateUnmuteInCart({
        key: activeUnmute.key,
        properties: {
          ...activeUnmute.properties,
          _images: [fileUrl], // TODO: Add to existing list of images
        },
      }).then(({ data }) => {
        setLoading(false);

        dispatch(updateUnmutes(data.items));

        navigate("/orientation");
      });
    });
  };

  return (
    <div className="flex flex-col items-center mt-24">
      <div className="content">
        <div className="mx-auto flex flex-col items-center">
          <h1 className="font-serif text-muld-1000 text-[50px] mb-4">Upload</h1>
          <h2 className="font-serif text-rose-500 text-[17px] text-center leading-tight">
            Choose your favorite photo
            <br /> or create a collage of your
            <br />
            favorite moments.
          </h2>

          {loading && (
            <h2 className="mt-56 font-serif text-rose-500 text-3xl text-center flex flex-col items-center justify-center">
              Uploading...
              <Loader size={"w-24 h-24"} />
            </h2>
          )}

          {!loading && (
            <div className={"mt-56"}>
              <form>
                <label
                  htmlFor="image"
                  className="block font-serif text-muld-1000 bg-white border border-rose-500 focus:outline-none hover:bg-rose-500 hover:text-white focus:ring-4 focus:ring-rose font-medium rounded-lg px-5 py-2.5 me-2 mb-2 cursor-pointer w-[270px] text-center"
                >
                  Choose photo from Phone
                </label>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  className="hidden"
                  id="image"
                  onChange={handleChange}
                />
              </form>

              <form className="mt-5">
                <label
                  htmlFor="image"
                  className="block font-serif text-muld-1000 bg-white border border-rose-500 focus:outline-none hover:bg-rose-500 hover:text-white focus:ring-4 focus:ring-rose font-medium rounded-lg px-5 py-2.5 me-2 mb-2 cursor-pointer w-[270px] text-center"
                >
                  Create Collage Choose photos
                </label>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  className="hidden"
                  id="image"
                />
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
