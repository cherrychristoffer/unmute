import { React } from "react";

import {Link, useLocation} from "wouter";

export const UploadAudioPage = () => {
  const [_location] = useLocation();

  return (
    <div className="content flex flex-col items-center justify-center h-full py-20">
      <div className="text-center">
        <h1 className="font-serif text-muld-1000 text-[50px] mb-4">Add audio</h1>
        <h2 className="font-serif text-muld-1000 text-[17px] text-center leading-tight">
          Choose how
        </h2>
      </div>
      <div className={"mt-auto text-center"}>
        <Link to={'/inspiration'} className={'block font-serif text-muld-1000 bg-white border border-rose-500 focus:outline-none hover:bg-rose-500 hover:text-white focus:ring-4 focus:ring-rose font-medium rounded-lg px-5 py-2.5 me-2 mb-2 cursor-pointer w-[270px] text-center'}>
          Record audio
        </Link>
        <form className={'mt-5'}>
          <label
            htmlFor="image"
            className="block font-serif text-muld-1000 bg-white border border-rose-500 focus:outline-none hover:bg-rose-500 hover:text-white focus:ring-4 focus:ring-rose font-medium rounded-lg px-5 py-2.5 me-2 mb-2 cursor-pointer w-[270px] text-center"
          >
            Upload audio
          </label>
          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            className="hidden"
            id="image"
          />
        </form>

        <form className="mt-5">
          <label
            htmlFor="image"
            className="block font-serif text-muld-1000 bg-white border border-rose-500 focus:outline-none hover:bg-rose-500 hover:text-white focus:ring-4 focus:ring-rose font-medium rounded-lg px-5 py-2.5 me-2 mb-2 cursor-pointer w-[270px] text-center"
          >
            Video to Audio
          </label>
          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            className="hidden"
            id="image"
          />
        </form>
      </div>
    </div>
  );
};
