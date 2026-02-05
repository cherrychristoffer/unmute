import { React, useCallback, useEffect, useRef, useState } from 'react'

import axios from 'axios'

import { DragDropContext, Droppable } from 'react-beautiful-dnd'
// import { deleteFile, getFileUrl, uploadFile } from '../../api/aws';
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useParams } from 'wouter'
import { useAudioRecorder } from 'react-audio-voice-recorder'

import { updateUnmuteInCart } from '../../api/cart'
import { updateUnmute } from '../../features/user/userSlice'
import { v4 as uuid } from 'uuid'
import { AudioBottomNavigation } from '../../components/AudioBottomNavigation'

import { useActiveUnmute } from '../../api/useUnmutes'

import { Loader } from '../../components/Loader'
import { mergeAudio } from '../../api/inspiration'
import { AudioComponent } from './AudioComponent'
import { setScrolltoActive } from '../../features/image/imageSlice'
import { ConfirmModal } from '../../components/ConfirmModal'

export const EditAudioPage = () => {
  const {
    startRecording,
    stopRecording,
    togglePauseResume,
    recordingBlob,
    isRecording,
    isPaused,
  } = useAudioRecorder()
  const audioRef = useRef({})
  const dispatch = useDispatch()
  const [_location, navigate] = useLocation()
  const updateRef = useRef(false)
  const cacheBust = Date.now()
  const { loading } = useActiveUnmute()
  const [audioBlob, setAudioBlob] = useState([])
  const { id: unmuteId } = useParams()
  const { unmutes, isLoadingUnmutes } = useSelector((state) => state.user)
  const [activeAudio, setActiveAudio] = useState({})
  const [isLoading, setIsLoading] = useState({})
  const activeAudioRef = useRef(null)
  const allAudioRefs = useRef({})
  const progressRefs = useRef({})
  const [makeEmptyAllListeners, setMakeEmptyAllListeners] = useState(0)
  const [activateButton, setActivateButton] = useState(0)
  const playFromAll = useRef(false)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [rangeMap, setRangeMap] = useState({
    start: 0,
    end: 1000,
  })
  const [activeAudioIndex, setActiveAudioIndex] = useState(0)

  const activeUnmute = unmutes?.find(
    (item) => item.properties?._uuid === unmuteId
  )
  const audioFiles = activeUnmute?.properties?._audios || []

  const timeupdate = useCallback(
    (e, uuid) => {
      const element = e.target
      const audios = { ...allAudioRefs.current }
      const audioRef = audios[uuid]

      // Update the progress bar based on the current time
      const progressElement = progressRefs.current[uuid]
      if (progressElement && audioRef) {
        const currentTime = audioRef.currentTime
        const duration = audioRef.duration

        // Update the progress bar width based on the current playback time
        const percentage = (currentTime / duration) * 100
        progressElement.style.left = `${percentage}%`
      }

      // if (
      //   element.currentTime >= rangeMap?.end / 1000
      //   // && rangeMap?.end !== item?.seconds * 1000
      // ) {
      //   audioRef?.pause();
      //   audioRef.currentTime = 0;
      //   audioRef?.removeEventListener('timeupdate', timeupdate);
      // }
    },
    [rangeMap?.end]
  )

  const handleAllPlayAudio = async () => {
    pauseAllAudios()

    if (!allAudioRefs.current) return
    setMakeEmptyAllListeners((prev) => prev + 1)
    const audios = { ...allAudioRefs.current }
    const audioData = audioBlob?.map((item) => item.uuid)

    let currentAudioIndex = 0
    const playAudio = (index) => {
      if (index >= audioData.length) {
        return pauseAllAudios()
      }
      playFromAll.current = true
      setActiveAudioIndex(index)

      const item = audios[audioData[index]]
      if (item) {
        const prevIndex = index > 0 ? index - 1 : 0
        if (index > 0) {
          setActiveAudio((prev) => ({
            ...prev,
            [audioData[index]]: true,
            [audioData[index - 1]]: false,
          }))
        } else {
          setActiveAudio((prev) => ({ ...prev, [audioData[index]]: true }))
        }
        // item.currentTime = 0;
        item.play()

        setRangeMap({
          start: item.currentTime * 1000,
          end: item.seconds * 1000,
        })

        item.addEventListener('timeupdate', (e) =>
          timeupdate(e, audioData[index])
        )

        item.onended = () => {
          item.removeEventListener('timeupdate', (e) =>
            timeupdate(e, audioData[index])
          )
          if (playFromAll.current) {
            item.currentTime = 0
            playAudio(index + 1)
          }
        }
      }
    }

    // reset the current audio index
    if (activeAudioIndex > 0) {
      currentAudioIndex = activeAudioIndex
    }

    playAudio(currentAudioIndex)
  }
  useEffect(() => {
    if (audioFiles?.length > 0) {
      const totalSeconds = audioFiles.reduce((total, item) => {
        const [minutes, seconds] = item.countdown.split(':').map(Number)
        return total + minutes * 60 + seconds
      }, 0)
      setActivateButton(totalSeconds)
    }
  }, [audioFiles])

  function convertToTimeFormat(seconds) {
    const roundedSeconds = Math.floor(seconds)

    const minutes = Math.floor(roundedSeconds / 60)
    const remainingSeconds = roundedSeconds % 60

    const formattedMinutes = String(minutes).padStart(2, '0')
    const formattedSeconds = String(remainingSeconds).padStart(2, '0')

    return `${formattedMinutes}:${formattedSeconds}`
  }

  const mergeAudioData = async () => {
    if (audioFiles?.length > 1) {
      setIsLoading((prev) => ({ ...prev, isMerged: true }))
      const sortedData = audioBlob.sort((a, b) => a.index - b.index)

      const result = sortedData.map((item) => {
        const fileParts = item.fileData.file.split('/')

        const folder = fileParts[fileParts.length - 2]
        const fileName = fileParts[fileParts.length - 1]
        return `${folder}/${fileName}`
      })

      try {
        const responseData = await mergeAudio(result)

        axios
          .get(`${responseData.url}?c=${cacheBust}`, {
            responseType: 'blob',
          })
          .then(({ data }) => {
            const minuteData = convertToTimeFormat(responseData.duration)
            const [minutes, seconds] = minuteData?.split(':')?.map(Number)
            const dataSeconds = minutes * 60 + seconds

            const audio = {
              file: responseData.url,
              countdown: convertToTimeFormat(responseData.duration),
            }
            const newData = {
              blob: data,
              fileData: audio,
              seconds: dataSeconds,
              uuid: uuid(),
            }

            updateUnmuteInCart({
              key: activeUnmute.key,
              properties: {
                ...activeUnmute.properties,
                _audios: [audio],
              },
            }).then(({ data }) => {
              setIsLoading((prev) => ({ ...prev, isMerged: false }))
              const dataArray = []
              dataArray.push(newData)
              setAudioBlob(dataArray)
              const activeItem = data.items.find(
                (item) =>
                  item.properties._uuid === activeUnmute.properties._uuid
              )
              dispatch(updateUnmute(activeItem))
              navigate('/orientation')
            })
          })

          .catch((error) => {
            console.error('Error fetching audio:', error)
            setIsLoading((prev) => ({ ...prev, isMerged: true }))
          })
      } catch (e) {}
    } else {
      navigate('/orientation')
    }
    dispatch(setScrolltoActive())
  }

  const handleDeleteRecording = (path) => {
    updateUnmuteInCart({
      key: activeUnmute.key,
      properties: {
        ...activeUnmute.properties,
        _audios: activeUnmute.properties._audios.filter(
          (item) => item.file !== path
        ),
      },
    }).then(({ data }) => {
      const activeItem = data.items.find(
        (item) => item.properties._uuid === activeUnmute.properties._uuid
      )
      dispatch(updateUnmute(activeItem))
      setAudioBlob((prev) => prev.filter((item) => item.fileData.file !== path))
    })
  }

  const handleAllDeleteRecording = () => {
    updateUnmuteInCart({
      key: activeUnmute.key,
      properties: {
        ...activeUnmute.properties,
        _audios: [],
      },
    }).then(({ data }) => {
      const activeItem = data.items.find(
        (item) => item.properties._uuid === activeUnmute.properties._uuid
      )
      dispatch(updateUnmute(activeItem))
      setAudioBlob([])
    })
  }

  const getMyUserAudio = () => {
    updateRef.current = true
    audioFiles?.map((item, i) => {
      setIsLoading((prev) => ({ ...prev, [item.file]: true }))
      axios
        .get(`${item.file}?c=${cacheBust}`, {
          responseType: 'blob',
        })
        .then(({ data }) => {
          const [minutes, seconds] = item.countdown?.split(':')?.map(Number)
          const dataSeconds = minutes * 60 + seconds

          const id = uuid()

          const newData = {
            blob: data,
            fileData: item,
            seconds: dataSeconds,
            uuid: id,
            index: i,
          }

          setAudioBlob((prev) => [...prev, newData])
          setIsLoading((prev) => ({ ...prev, [item.file]: false }))
        })
        .catch((error) => {
          setIsLoading((prev) => ({ ...prev, [item.file]: false }))
          console.error('Error fetching audio:', error)
        })
    })
  }

  useEffect(() => {
    if (audioFiles.length > 0 && !updateRef.current) {
      getMyUserAudio()
    }
  }, [audioFiles, updateRef])

  if (loading) {
    return <div>Loading audio...</div>
  }

  const newSecond = audioBlob.reduce((acc, item) => acc + item.seconds, 0)

  const goAdd = () => {
    navigate(`inspiration/${unmuteId}`)
  }

  const goEditorPage = () => {
    navigate(`audio-upload/${unmuteId}`)
  }

  const onDragEnd = (result) => {
    const { destination, source } = result
    if (!destination) return

    const reorderedItems = Array.from(audioBlob)
    const [removed] = reorderedItems.splice(source.index, 1)
    reorderedItems.splice(destination.index, 0, removed)
    const sortedItems = reorderedItems.map((item, index) => ({
      ...item,
      index,
    }))
    const fileDataArray = sortedItems.map((item) => item.fileData)

    updateUnmuteInCart({
      key: activeUnmute.key,
      properties: {
        ...activeUnmute.properties,
        _audios: fileDataArray,
      },
    }).then(({ data }) => {
      const activeItem = data.items.find(
        (item) => item.properties._uuid === activeUnmute.properties._uuid
      )
      dispatch(updateUnmute(activeItem))
    })
    setAudioBlob(sortedItems)
  }

  const showLoading = () => {
    if (isLoadingUnmutes) return true
    for (let key in isLoading) {
      if (isLoading[key]) return true
    }
    return false
  }

  const sortedData = audioBlob.sort((a, b) => a.index - b.index)

  const pauseAllAudios = () => {
    if (!allAudioRefs.current) return
    const audios = { ...allAudioRefs.current }
    for (let key in audios) {
      allAudioRefs.current?.[key]?.pause()
    }
    setActiveAudio({})
  }
  return (
    <div className={'pb-[150px]'}>
      <div className="flex flex-col items-center">
        <h1 className="font-serif text-muld-500 text-6xl mb-4 mt-24">
          Rediger
        </h1>
        {audioFiles?.length > 1 && (
          <p className="font-serif text-muld-500 text-2xl text-center leading-tight">
            Træk i dine lydfiler for at ændre rækkefølge
          </p>
        )}

        {showLoading() ? (
          <div>
            <Loader size={'w-24 h-24'} />
          </div>
        ) : (
          <div className="w-full flex flex-col items-center pt-24">
            {!audioBlob && <Loader size={'w-24 h-24'} />}
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable type="group" droppableId="audioList">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    style={{ padding: '10px' }}
                  >
                    {sortedData.map((item, index) => (
                      <AudioComponent
                        cacheBust={cacheBust}
                        activeAudio={activeAudio}
                        setActiveAudio={setActiveAudio}
                        item={item}
                        allAudioRefs={allAudioRefs}
                        progressRefs={progressRefs}
                        index={index}
                        key={item.uuid}
                        pauseAllAudios={pauseAllAudios}
                        activeUnmute={activeUnmute}
                        setAudioBlob={setAudioBlob}
                        updateRef={updateRef}
                        makeEmptyAllListeners={makeEmptyAllListeners}
                        playFromAll={playFromAll}
                        onDelete={handleDeleteRecording}
                      />
                    ))}
                    {provided.placeholder}{' '}
                    {/* Ensures space is reserved when dragging */}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        )}
      </div>

      <AudioBottomNavigation
        isRecording={startRecording}
        isPaused={false}
        togglePauseResume={() => {}}
        goAdd={goAdd}
        stopRecording={stopRecording}
        playAudio={handleAllPlayAudio}
        pauseAudio={pauseAllAudios}
        deleteRecording={() => setOpenConfirm(true)}
        goEditorPage={goEditorPage}
        mergeAudio={mergeAudioData}
      />

      {openConfirm && (
        <ConfirmModal
          type={'alle lyde'}
          onConfirm={() => {
            handleAllDeleteRecording()
            setOpenConfirm(false)
          }}
          onCancel={() => setOpenConfirm(false)}
        />
      )}
    </div>
  )
}
