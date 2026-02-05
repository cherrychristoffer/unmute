import axios from 'axios'
import { BASE_API_URL, S3_BUCKET } from '../app/const'

export const convertVideoToAudio = async (videoKey) => {
  try {
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
  } catch (error) {
    console.log(error.response.data)
    // Throw error message from the response
    if (error.response && error.response.data instanceof Blob) {
      const text = await error.response.data.text()
      const json = JSON.parse(text)
      throw new Error(json.error)
    } else if (error.response && error.response.data) {
      throw new Error(error.response.data.error)
    } else {
      throw new Error('An error occurred while converting the video to audio.')
    }
  }
}
