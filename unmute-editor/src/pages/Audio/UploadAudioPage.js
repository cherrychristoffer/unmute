import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useParams } from 'wouter'
import AWS from 'aws-sdk'
import slugify from 'slugify'
import { v4 as uuid } from 'uuid'
import getBlobDuration from 'get-blob-duration'
import { convertVideoToAudio } from '../../api/video'
import { getFileUrl, uploadFile } from '../../api/aws'
import { updateUnmuteInCart } from '../../api/cart'
import { updateUnmutes } from '../../features/user/userSlice'
import { useActiveUnmute } from '../../api/useUnmutes'
import { Loader } from '../../components/Loader'
import {
  AWS_KEY_ID,
  AWS_KEY_SECRET,
  S3_BUCKET,
  S3_REGION,
} from '../../app/const'

AWS.config.update({
  accessKeyId: AWS_KEY_ID,
  secretAccessKey: AWS_KEY_SECRET,
})

const s3 = new AWS.S3({
  params: { Bucket: S3_BUCKET },
  region: S3_REGION,
})

export const UploadAudioPage = () => {
  // const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false)
  const { activeUnmute } = useActiveUnmute()
  const dispatch = useDispatch()
  const { id } = useParams()

  const uploadFileToS3 = (file, path, sanitizedFileName) => {
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
        const progress = Math.round((evt.loaded * 100) / evt.total)
        // setProgress(progress);
        if (progress === 100) {
        }
      })
      .promise()
  }
  function convertToTimeFormat(seconds) {
    const roundedSeconds = Math.floor(seconds)

    const minutes = Math.floor(roundedSeconds / 60)
    const remainingSeconds = roundedSeconds % 60

    const formattedMinutes = String(minutes).padStart(2, '0')
    const formattedSeconds = String(remainingSeconds).padStart(2, '0')

    return `${formattedMinutes}:${formattedSeconds}`
  }

  const handleChange = async (event) => {
    const recordingBlob = event.target.files[0]
    if (!recordingBlob) return
    if (!recordingBlob.type?.startsWith('audio'))
      return alert('Invalid file type. Please upload an audio file.')

    const duration = await getBlobDuration(recordingBlob)
    // if (duration > 600) return alert("Lydfilen må maksimalt vare 10 minutter");

    const minuteData = convertToTimeFormat(duration)
    const formatAudio = recordingBlob.name.split('.').pop()
    const newUuid = uuid()
    const file = new File([recordingBlob], `${newUuid}.${formatAudio}`, {
      type: recordingBlob.type,
    })

    uploadFile({
      file,
      path: id,
    }).then((path) => {
      const fileUrl = getFileUrl(path)

      const audio = {
        file: fileUrl,
        countdown: minuteData,
        notRecorded: true,
      }

      updateUnmuteInCart({
        key: activeUnmute.key,
        properties: {
          ...activeUnmute.properties,
          _audios: [...activeUnmute.properties._audios, audio],
        },
      }).then(({ data }) => {
        dispatch(updateUnmutes(data.items))
        window.location.href = `/pages/editor#/edit-audio/${id}`
      })
    })
  }
  const handleVideoUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return
    if (!file.type?.startsWith('video'))
      return alert('Invalid file type. Please upload an video file.')

    try {
      setLoading(true)
      const s3Path = 'videos'
      const sanitizedFileName = slugify(`${Date.now()}_${file.name}`, {
        replacement: '_',
        lower: false,
      })

      await uploadFileToS3(file, s3Path, sanitizedFileName)

      const videoKey = `${s3Path}/${sanitizedFileName}`

      const audio = await convertVideoToAudio(videoKey)
      const duration = await getBlobDuration(audio)

      setLoading(false)

      const minuteData = convertToTimeFormat(duration)
      uploadFile({
        file: audio,
        path: id,
      }).then((path) => {
        const fileUrl = getFileUrl(path)

        const audio = {
          file: fileUrl,
          countdown: minuteData,
          notRecorded: true,
        }

        updateUnmuteInCart({
          key: activeUnmute.key,
          properties: {
            ...activeUnmute.properties,
            _audios: [...activeUnmute.properties._audios, audio],
          },
        }).then(({ data }) => {
          dispatch(updateUnmutes(data.items))

          window.location.href = `/pages/editor#/edit-audio/${id}`
        })
      })
    } catch (err) {
      setLoading(false)
      alert(err)
    }
  }

  return (
    <div className="content flex flex-col items-center justify-center h-full py-20">
      <div className="text-center">
        <h1 className="font-serif text-muld-1000 text-[50px] mb-4">
          Tilføj Lydfil
        </h1>
        <h2 className="font-serif text-muld-1000 text-[17px] text-center leading-tight">
          Vælg hvordan herunder
        </h2>
      </div>
      {loading && (
        <div>
          <Loader size="w-16 h-16" />
        </div>
      )}
      <div className={'mt-32 text-center'}>
        <Link
          to={`/inspiration/${id}`}
          className={
            'block font-serif text-muld-1000 bg-white border border-rose-500 focus:outline-none hover:bg-rose-500 hover:text-white focus:ring-4 focus:ring-rose font-medium rounded-lg px-5 py-2.5 me-2 mb-2 cursor-pointer w-[270px] text-center'
          }
        >
          Optag lyd
        </Link>

        <form className="mt-5">
          <label
            htmlFor="videoUpload"
            className="text-label block font-serif text-muld-1000 bg-white border border-rose-500 focus:outline-none hover:bg-rose-500 hover:text-white focus:ring-4 focus:ring-rose font-medium rounded-lg px-5 py-2.5 me-2 mb-2 cursor-pointer w-[270px] text-center"
          >
            Video til lyd
          </label>
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            className="hidden"
            id="videoUpload"
          />
        </form>

        <form className={'mt-5'}>
          <label
            htmlFor="image"
            className="text-label block font-serif text-muld-1000 bg-white border border-rose-500 focus:outline-none hover:bg-rose-500 hover:text-white focus:ring-4 focus:ring-rose font-medium rounded-lg px-5 py-2.5 me-2 mb-2 cursor-pointer w-[270px] text-center"
          >
            Upload lydfil
          </label>
          <input
            type="file"
            accept="audio/wav audio/mp3"
            className="hidden"
            onChange={handleChange}
            id="image"
          />
        </form>

        <Link to="/orientation" className={'mt-8 flex justify-center'}>
          Tilbage til billedredigering
        </Link>
      </div>
    </div>
  )
}
