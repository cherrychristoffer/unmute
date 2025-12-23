import axios from 'axios'
import { SPACES_BUCKET } from '../app/const'
import { convertHeic } from './image'
const SIGNED_URL_LAMBDA_URL =
  'https://jgicaiizhje65xwo6kem5ifuei0rbgjj.lambda-url.eu-north-1.on.aws'

export const getFileUrl = (path) =>
  `https://${SPACES_BUCKET}.fra1.digitaloceanspaces.com/${path}`

export const uploadFile = async ({ file, path, customName = null }) => {
  const contentType = file?.type || 'application/octet-stream'

  try {
    const signedUrlResponse = await fetchSignedUrl({
      storageType: 'do',
      contentType,
      filename: customName || file?.name,
    })

    await axios.put(signedUrlResponse.signedUrl, file, {
      headers: {
        'Content-Type': contentType,
      },
    })

    const lowerCaseFilename = file.name.toLowerCase()
    const isHEIC = lowerCaseFilename.endsWith('.heic')
    const isHEIF = lowerCaseFilename.endsWith('.heif')
    const isHEICorHEIFFile = isHEIC || isHEIF

    if (!isHEICorHEIFFile) {
      return signedUrlResponse.key
    }

    let { key } = await convertHeic(signedUrlResponse.key)
    return key
  } catch (error) {
    console.error('Upload failed:', error)
    throw error
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
