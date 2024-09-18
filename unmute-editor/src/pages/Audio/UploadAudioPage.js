import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import AWS from "aws-sdk";
import { AWS_KEY_ID, AWS_KEY_SECRET, S3_BUCKET, S3_REGION } from "../../app/const";
import { convertVideoToAudio } from "../../api/video";
import {getFileUrl, uploadFile} from "../../api/aws";
import {updateUnmuteInCart} from "../../api/cart";
import {addUnmute, updateUnmutes} from "../../features/user/userSlice";
import {v4 as uuid} from "uuid";
import {useActiveUnmute} from "../../api/useUnmutes";
import {useDispatch} from "react-redux";


AWS.config.update({
  accessKeyId: AWS_KEY_ID,
  secretAccessKey: AWS_KEY_SECRET,
});

const s3 = new AWS.S3({
  params: { Bucket: S3_BUCKET },
  region: S3_REGION,
});

export const UploadAudioPage = () => {
  const [_location, navigate] = useLocation();
  const [progress, setProgress] = useState(0);
  const { activeUnmute } = useActiveUnmute();
  const dispatch = useDispatch();

  const uploadFileToS3 = (file, path) => {
    const progressBar = document.querySelector("#progress-bar");

    return s3
        .putObject({
          Bucket: S3_BUCKET,
          Key: `${path}/${file.name}`,
          Body: file,
        })
        .on("httpUploadProgress", (evt) => {
          const progress = Math.round((evt.loaded * 100) / evt.total);
          setProgress(progress);
          if (progress === 100) {
            progressBar.style.display = "none";
          }
        })
        .promise();
  };

  const handleVideoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const s3Path = "videos";
      await uploadFileToS3(file, s3Path);

      const videoKey = `${s3Path}/${file.name}`;

      const audio = await convertVideoToAudio(videoKey);

      uploadFile({
        file: audio,
        path: activeUnmute.properties._uuid,
      }).then(() => {
        const fileUrl = getFileUrl(
            `${activeUnmute.properties._uuid}/video-to-audio.wav`
        );

        updateUnmuteInCart({
          key: activeUnmute.key,
          properties: {
            ...activeUnmute.properties,
            _audios: [...activeUnmute.properties._audios, fileUrl],
          },
        }).then(({ data }) => {
          dispatch(updateUnmutes(data.items));
          navigate("/edit-audio");
        });
      });

    } catch (error) {
      console.error("Error uploading video or converting:", error);
    }
  };

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
          <label htmlFor="videoUpload" className="block font-serif text-muld-1000 bg-white border border-rose-500 focus:outline-none hover:bg-rose-500 hover:text-white focus:ring-4 focus:ring-rose font-medium rounded-lg px-5 py-2.5 me-2 mb-2 cursor-pointer w-[270px] text-center">
            Video to Audio
          </label>
          <input
              type="file"
              accept="video/mp4"
              onChange={handleVideoUpload}
              className="hidden"
              id="videoUpload"
          />
          <div id="progress-bar" className="progress-bar" style={{ width: `${progress}%` }}></div>
        </form>
      </div>
    </div>
  );
};
