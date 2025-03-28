import AWS from 'aws-sdk'

import { SPACES_BUCKET, SPACES_KEY_ID, SPACES_KEY_SECRET } from '../app/const'
import slugify from 'slugify'
import { convertHeic } from './image'

AWS.config.update({
  accessKeyId: SPACES_KEY_ID,
  secretAccessKey: SPACES_KEY_SECRET,
})

const s3 = new AWS.S3({
  params: { Bucket: SPACES_BUCKET },
  endpoint: `https://fra1.digitaloceanspaces.com`,
  region: 'fra1',
})

export const getFileUrl = (path) =>
  `https://${SPACES_BUCKET}.fra1.digitaloceanspaces.com/${path}`

export const uploadFile = async ({ file, path, customName = null }) => {
  const sanitizedFileName = slugify(file.name, {
    replacement: '_',
    lower: false,
  })
  const fileKey = `${path}/${customName ? customName : sanitizedFileName}`

  let contentType = file.type

  return s3
    .putObject({
      Bucket: SPACES_BUCKET,
      Key: fileKey,
      Body: file,
      ContentType: contentType,
      ACL: 'public-read-write',
    })
    .on('httpUploadProgress', (evt) => {
      //evt.loaded
    })
    .promise()
    .then(async () => {
      const lowerCaseFilename = file.name.toLowerCase()
      const isHEIC = lowerCaseFilename.endsWith('.heic')
      const isHEIF = lowerCaseFilename.endsWith('.heif')
      const isHEICorHEIFFile = isHEIC || isHEIF

      if (!isHEICorHEIFFile) {
        return fileKey
      }

      let { key } = await convertHeic(fileKey)
      return key
    })
    .catch((error) => {
      console.error('Upload failed:', error)
      throw error
    })
}

export const deleteFile = async ({ path }) => {
  await s3.deleteObject({ Bucket: SPACES_BUCKET, Key: path }).promise()
}
