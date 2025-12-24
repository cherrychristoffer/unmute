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
      filename: customName || file?.name
    })

    await axios.put(signedUrlResponse.signedUrl, file, {
      headers: {
        'x-amz-acl': 'public-read',
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
  const data = unwrapSignedUrlResponse(response.data)

  if (!data?.signedUrl) {
    throw new Error(data?.error || 'Signed URL missing from response.')
  }

  return data
}

const unwrapSignedUrlResponse = (payload) => {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Signed URL response is empty.')
  }

  if (!Object.prototype.hasOwnProperty.call(payload, 'body')) {
    return payload
  }

  const parsedBody =
    typeof payload.body === 'string'
      ? safeJsonParse(payload.body)
      : payload.body

  if (!parsedBody) {
    throw new Error('Unable to parse signed URL response body.')
  }

  if (typeof payload.statusCode === 'number' && payload.statusCode >= 400) {
    const error = new Error(
      parsedBody.error || `Signed URL request failed (${payload.statusCode}).`
    )
    error.statusCode = payload.statusCode
    throw error
  }

  return parsedBody
}

const safeJsonParse = (value) => {
  try {
    return JSON.parse(value)
  } catch (error) {
    return null
  }
}
