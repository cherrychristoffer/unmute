import AWS from "aws-sdk";

import { AWS_KEY_ID, AWS_KEY_SECRET, S3_BUCKET, S3_REGION } from "../app/const";

import { clamp } from "lodash";

AWS.config.update({
  accessKeyId: AWS_KEY_ID,
  secretAccessKey: AWS_KEY_SECRET,
});

const s3 = new AWS.S3({
  params: { Bucket: S3_BUCKET },
  region: S3_REGION,
});

export const getFileUrl = (path) =>
  `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${path}`.replace(
    /\s/g,
    "+"
  );

export const uploadFile = async ({ file, path }) => {
  const progressBar = document.querySelector("#progress-bar");

  progressBar.style.display = "block";
  progressBar.style.width = "5%";

  return s3
    .putObject({
      Bucket: S3_BUCKET,
      Key: `${path}/${file.name}`,
      Body: file,
    })
    .on("httpUploadProgress", (evt) => {
      const progress = clamp((evt.loaded * 100) / evt.total, 5, 100);

      if (progress === 100) {
        progressBar.style.display = "none";
      }

      progressBar.style.width = `${progress}%`;
    })
    .promise();
};

export const deleteFile = async ({ path }) =>
  s3.deleteObject({ Bucket: S3_BUCKET, Key: path }).promise();
