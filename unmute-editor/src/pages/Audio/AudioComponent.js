import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import { AudioTag } from './AudioTag'
import { Draggable } from 'react-beautiful-dnd'

import { PauseIcon } from '../../assets/icons/icon_pause'
import { PlayIcon } from '../../assets/icons/icon_play'
import Range from './Range'
import { AudioVisualizer } from 'react-audio-visualize'
import { CheckIcon } from '../../assets/icons/icon_check'
import { CloseIcon } from '../../assets/icons/icon_close'
import { deleteFile, getFileUrl, uploadFile } from '../../api/aws'
import audioBufferToWav from './AudioBuffer'
import { useParams } from 'wouter'
import { updateUnmuteInCart } from '../../api/cart'
import { updateUnmute, updateUnmutes } from '../../features/user/userSlice'
import { useDispatch } from 'react-redux'
import { ConfirmModal } from '../../components/ConfirmModal'

export const AudioComponent = ({
  item,
  pauseAllAudios,
  index,
  allAudioRefs,
  progressRefs,
  cacheBust,
  setActiveAudio,
  activeAudio,
  activeUnmute,
  setAudioBlob,
  updateRef,
  makeEmptyAllListeners,
  playFromAll,
  onDelete,
}) => {
  const dispatch = useDispatch()
  const audioRef = useRef(null)
  const startRef = useRef(null)
  const endRef = useRef(null)
  const [isCropping, setIsCropping] = useState(false)
  const { id: unmuteId } = useParams()

  const [rangeMap, setRangeMap] = useState({
    start: 0,
    end: item?.seconds * 1000,
  })
  const priceGap = 1

  const timeupdate = useCallback(
    (e) => {
      const element = e.target

      // Update the progress bar based on the current time
      const progressElement = progressRefs.current[item.uuid]
      if (progressElement && audioRef.current) {
        const currentTime = audioRef.current.currentTime
        const duration = audioRef.current.duration

        // Update the progress bar width based on the current playback time
        const percentage = (currentTime / duration) * 100
        progressElement.style.left = `${percentage}%`
      }

      if (
        element.currentTime >= rangeMap?.end / 1000 &&
        rangeMap?.end !== item?.seconds * 1000
      ) {
        audioRef.current?.pause()
        handleAudioEnded()
      }
    },
    [rangeMap?.end]
  )

  useEffect(() => {
    if (makeEmptyAllListeners && audioRef.current) {
      audioRef.current?.removeEventListener('timeupdate', timeupdate)
    }
  }, [makeEmptyAllListeners, timeupdate])

  const handleAudioEnded = () => {
    audioRef.current.currentTime = 0
    setActiveAudio((prev) => ({ ...prev, [item.uuid]: false }))
    audioRef.current?.removeEventListener('timeupdate', timeupdate)
  }

  const handlePlayAudio = () => {
    if (!audioRef.current) return
    pauseAllAudios()
    setActiveAudio((prev) => ({ ...prev, [item.uuid]: true }))
    if (rangeMap?.start)
      audioRef.current.currentTime = rangeMap?.start
        ? rangeMap?.start / 1000
        : 0

    playFromAll.current = false
    audioRef.current.play()
    //if (rangeMap?.end && rangeMap?.end !== item?.seconds * 1000) {
    audioRef.current.addEventListener('timeupdate', timeupdate)
    //}
  }

  const handlePauseAudio = () => {
    if (!audioRef.current) return
    audioRef.current.pause()
    audioRef?.current?.removeEventListener('timeupdate', timeupdate)

    setActiveAudio((prev) => ({ ...prev, [item.uuid]: false }))
  }

  function calculateValues(startValue, endValue, max, id) {
    const progressElement = progressRefs.current[item.uuid]

    if (progressElement) {
      progressElement.style.left = (startValue / max) * 100 + '%'
      progressElement.style.right = 100000 - (endValue / max) * 100 + '%'
    }
  }

  const handleChange = (e, id) => {
    const { name, value } = e.target
    const startValue = parseInt(startRef.current?.value)
    const endValue = parseInt(endRef.current?.value)
    setIsCropping(true)
    let updatedStartValue = startValue
    let updatedEndValue = endValue

    if (endValue - startValue < priceGap) {
      if (name === 'start') {
        updatedStartValue = endValue - priceGap
      } else {
        updatedEndValue = startValue + priceGap
      }
    }

    setRangeMap((prev) => ({
      start: name === 'start' ? updatedStartValue : startValue,
      end: name === 'end' ? updatedEndValue : endValue,
    }))

    if (progressRefs.current && progressRefs.current[item.uuid]) {
      //calculateValues(updatedStartValue, updatedEndValue, item?.seconds * 1000, id);
    }
  }

  const cropAudio = async (blob, start, end) => {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)()
    const arrayBuffer = await blob.arrayBuffer()

    return new Promise((resolve, reject) => {
      audioContext.decodeAudioData(
        arrayBuffer,
        (audioBuffer) => {
          const sampleRate = audioBuffer.sampleRate
          const startSample = Math.floor(start * sampleRate)
          const endSample = Math.floor(end * sampleRate)

          const croppedBuffer = audioContext.createBuffer(
            audioBuffer.numberOfChannels,
            endSample - startSample,
            sampleRate
          )

          for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
            croppedBuffer.copyToChannel(
              audioBuffer.getChannelData(i).subarray(startSample, endSample),
              i
            )
          }

          audioContext.createBufferSource().buffer = croppedBuffer

          const offlineAudioContext = new OfflineAudioContext(
            croppedBuffer.numberOfChannels,
            croppedBuffer.length,
            croppedBuffer.sampleRate
          )

          const source = offlineAudioContext.createBufferSource()
          source.buffer = croppedBuffer
          source.connect(offlineAudioContext.destination)
          source.start()

          offlineAudioContext.startRendering().then((renderedBuffer) => {
            const wavBlob = bufferToWaveBlob(renderedBuffer)
            resolve(wavBlob)
          })
        },
        reject
      )
    })
  }

  const bufferToWaveBlob = (buffer) => {
    const wavBuffer = audioBufferToWav(buffer)
    return new Blob([wavBuffer], { type: 'audio/wav' })
  }
  const formatTime = (time) => {
    let minutes = Math.floor(time / 60)
    let seconds = time % 60

    if (seconds < 10) {
      seconds = `0${seconds}`
    }

    return `${minutes}:${seconds}`
  }

  const onErrorHandle = (e) => {
    setActiveAudio((prev) => ({ ...prev, [item.uuid]: false }))
  }

  const handleCropAudio = async (item, id) => {
    if (Number(rangeMap.start) < Number(rangeMap.end)) {
      const startAudio = rangeMap.start / 1000
      const endAudio = rangeMap.end / 1000
      setIsCropping(false)
      const croppedAudioBlob = await cropAudio(item.blob, startAudio, endAudio)
      uploadFile({
        file: new File(
          [croppedAudioBlob],
          item.fileData.file.split('/').at(-1)
        ),
        path: unmuteId,
      }).then((path) => {
        const fileUrl = getFileUrl(path)

        const audios = activeUnmute.properties._audios?.map((state) => {
          if (item.fileData.file === state.file) {
            return {
              file: fileUrl,
              countdown: formatTime(endAudio - startAudio),
              notRecorded: state?.notRecorded,
            }
          }
          return state
        })
        updateUnmuteInCart({
          key: activeUnmute.key,
          properties: {
            ...activeUnmute.properties,
            _audios: audios,
          },
        }).then(({ data }) => {
          setAudioBlob([])

          setTimeout(() => {
            dispatch(updateUnmutes(data.items))
            updateRef.current = false
          }, 500)
        })
      })
    }
  }

  function convertSeconds(seconds) {
    if (!seconds) return null
    seconds = Math.round(seconds)
    if (seconds < 60) {
      return `${seconds} sek`
    }

    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}min ${remainingSeconds.toString().padStart(2, '0')}sek`
  }

  const [fileToDelete, setFileToDelete] = useState(null)
  const [openSave, setOpenSave] = useState(false)
  const [openConfirm, setOpenConfirm] = useState(false)

  const handleDeleteRecording = async () => {
    await deleteFile({ path: fileToDelete.fileData.file })
    onDelete(fileToDelete.fileData.file)
    setFileToDelete(null)
  }

  return (
    <>
      <AudioTag
        audioRef={audioRef}
        allAudioRefs={allAudioRefs}
        uuid={item.uuid}
        onErrorHandle={onErrorHandle}
        handleAudioEnded={handleAudioEnded}
        file={`${item.fileData.file}?c=${cacheBust}`}
      />
      <Draggable
        key={item.uuid}
        draggableId={item.uuid}
        index={index}
        filter="input"
        preventOnFilter="false"
      >
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="audio-crop mb-5"
          >
            <div>{convertSeconds(item?.seconds)}</div>

            <div className="handle relative">
              {item?.seconds !== undefined && (
                <Range
                  min={0}
                  max={item?.seconds * 1000}
                  range={rangeMap}
                  handleChange={(e) => handleChange(e, item.uuid)}
                  startRef={(ref) => (startRef.current = ref)}
                  endRef={(ref) => (endRef.current = ref)}
                  progressRef={(ref) => (progressRefs.current[item.uuid] = ref)}
                />
              )}
              <AudioVisualizer
                blob={item.blob}
                width={250}
                height={82}
                barWidth={1}
                gap={4}
                backgroundColor="#F3F3F3"
                barColor="#B0928C"
                style={{
                  borderRadius: 4,
                  maxWidth: '100%',
                  borderWidth: '1px',
                  borderColor: '#B0928C',
                }}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="relative">
                {activeAudio[item.uuid] ? (
                  <button
                    onClick={() => handlePauseAudio()}
                    className={
                      'w-[25px] h-[25px] bg-rose-500 hover:bg-rose-700 fill-white rounded-full flex items-center justify-center'
                    }
                  >
                    <PauseIcon size={16} />
                  </button>
                ) : (
                  <button
                    onClick={() => handlePlayAudio()}
                    className={
                      'w-[25px] h-[25px] bg-rose-500 hover:bg-rose-700 fill-white rounded-full flex items-center justify-center'
                    }
                  >
                    <PlayIcon size={16} />
                  </button>
                )}
              </div>
              <div className="ml-auto relative flex items-center gap-4">
                <button
                  className={
                    'w-[25px] h-[25px] bg-red-500 hover:bg-red-700 fill-white rounded-full flex items-center justify-center'
                  }
                  onClick={() => {
                    setFileToDelete(item)
                    setOpenConfirm(true)
                  }}
                >
                  <CloseIcon size={16} />
                </button>

                {isCropping && (
                  <button
                    className={
                      'px-4 h-[25px] py-1 bg-rose-500 rounded-lg flex items-center justify-center text-white text-[12px]'
                    }
                    onClick={() => {
                      setOpenSave(true)
                    }}
                  >
                    <span>Gem</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </Draggable>
      {openSave && (
        <ConfirmModal
          title={'Gem og opdatér'}
          text={
            'Vil du gemme dine ændringer? Lyden vil bliver beskåret og gemt.'
          }
          buttonText={'Gem lyd'}
          onConfirm={() => {
            handleCropAudio(item, item.uuid).then()
            setOpenSave(false)
          }}
          onCancel={() => setOpenSave(false)}
        />
      )}
      {openConfirm && (
        <ConfirmModal
          type={'lydfilen'}
          onConfirm={() => {
            handleDeleteRecording()
            setOpenConfirm(false)
          }}
          onCancel={() => setOpenConfirm(false)}
        />
      )}
    </>
  )
}
