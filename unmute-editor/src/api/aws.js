import axios from 'axios'
import { S3_BUCKET, S3_REGION } from '../app/const'

import { clamp } from 'lodash'
const SIGNED_URL_LAMBDA_URL =
  'https://jgicaiizhje65xwo6kem5ifuei0rbgjj.lambda-url.eu-north-1.on.aws'

export const getFileUrl = (path) =>
  `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${path}`

export const uploadFile = async ({ file, path }) => {
  const progressBar = document.querySelector('#globalprogress')

  if (progressBar) {
    progressBar.style.display = 'block'
  }

  const contentType = file?.type || 'application/octet-stream'

  try {
    const signedUrlResponse = await fetchSignedUrl({
      storageType: 's3',
      contentType,
      filename: file?.name,
    })

    await axios.put(signedUrlResponse.signedUrl, file, {
      headers: {
        'Content-Type': contentType,
      },
      onUploadProgress: (evt) => {
        if (!evt.total) {
          return
        }

        const progress = clamp((evt.loaded * 100) / evt.total, 5, 100)

        if (progress === 100 && progressBar) {
          progressBar.style.display = 'none'
        }
      },
    })

    return signedUrlResponse.key
  } catch (error) {
    console.error('Upload failed:', error)
    throw error
  } finally {
    if (progressBar) {
      progressBar.style.display = 'none'
    }
  }
}

export const deleteFile = async ({ path }) => {
  await new Promise((resolve) => setTimeout(resolve, 1000))
}

const fetchSignedUrl = async ({ storageType, contentType, filename }) => {
  const url = new URL(SIGNED_URL_LAMBDA_URL)
  const params = new URLSearchParams({
    storageType,
    contentType,
  })

  if (filename) {
    params.set('filename', filename)
  }

  url.search = params.toString()

  const response = await axios.get(url.toString())
  return response.data
}
