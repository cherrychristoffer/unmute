import AWS from 'aws-sdk'

import { AWS_KEY_ID, AWS_KEY_SECRET, S3_BUCKET, S3_REGION } from '../app/const'

import { clamp } from 'lodash'
import slugify from 'slugify'

AWS.config.update({
  accessKeyId: AWS_KEY_ID,
  secretAccessKey: AWS_KEY_SECRET,
})

const s3 = new AWS.S3({
  params: { Bucket: S3_BUCKET },
  region: S3_REGION,
})

export const getFileUrl = (path) =>
  `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${path}`

export const uploadFile = async ({ file, path }) => {
  const progressBar = document.querySelector('#globalprogress')

  progressBar.style.display = 'block'

  const sanitizedFileName = slugify(file.name, {
    replacement: '_',
    lower: false,
  })
  const fileKey = `${path}/${sanitizedFileName}`

  let contentType = file.type

  return s3
    .putObject({
      Bucket: S3_BUCKET,
      Key: fileKey,
      Body: file,
      ContentType: contentType,
    })
    .on('httpUploadProgress', (evt) => {
      const progress = clamp((evt.loaded * 100) / evt.total, 5, 100)

      if (progress === 100) {
        progressBar.style.display = 'none'
      }
    })
    .promise()
    .then(() => {
      return fileKey
    })
    .catch((error) => {
      console.error('Upload failed:', error)
      throw error
    })
}

export const deleteFile = async ({ path }) => {
  await s3.deleteObject({ Bucket: S3_BUCKET, Key: path }).promise()
}
