import axios from 'axios'
import { BASE_API_URL, S3_BUCKET } from '../app/const'

export const convertVideoToAudio = async (videoKey) => {
  const response = await axios.post(
    `${BASE_API_URL}/video/convert_to_audio`,
    {
      videoKey,
      bucket: S3_BUCKET,
    },
    {
      headers: { 'Content-Type': 'application/json' },
      responseType: 'blob',
    }
  )

  const timestamp = Date.now()
  const uniqueId = Math.floor(Math.random() * 1000000)
  let fileName = `${timestamp}-${uniqueId}-video-to-audio.mp3`

  return new File([response.data], fileName, {
    type: 'audio/mp3',
  })
}
