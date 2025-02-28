import React, { useEffect, useRef, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import { Link, useParams } from 'wouter'
import { PauseIcon } from '../assets/icons/icon_pause'
import { PlayIcon } from '../assets/icons/icon_play'

import { Loader } from './Loader'

import { deleteFile } from '../api/aws'
import { removeUnmuteInCart } from '../api/cart'
import { updateAllUnmutes, deleteUnmute } from '../features/user/userSlice'

import { setActiveUnmuteIndex } from '../features/user/userSlice'

import frame_image from '../assets/images/frame.png'

import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import '../assets/styles/swiperCustom.css'
import { EmptyBox } from './EmptyBox'
import { useActiveUnmute } from '../api/useUnmutes'
import CollageUnmute from './CollageUnmute'
import Unmute2 from './Unmute2'

export const Frame = React.memo(() => {
  const cacheBust = Date.now()
  const audioRef = useRef()
  const swiperRef = useRef(null)
  const isAlreadyRendered = useRef()
  const dispatch = useDispatch()
  const params = useParams()

  const [playing, setPlaying] = useState(false)
  const [editSlider, setEditSlider] = useState(0)
  const { activeUnmute } = useActiveUnmute()

  const { unmutes } = useSelector((state) => state.user)
  const blankFrames = useSelector((state) => state.user.blankFrames)
  const { scrollToExtra, scrollToActive, disableAllExtions } = useSelector(
    (state) => state.image
  )
  const [initialSlide, setInitialSlide] = useState(0)
  const activeUnmuteIndex = useSelector((state) => state.user.activeUnmuteIndex)

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current

      const handleEnded = () => {
        setPlaying(false)
      }

      audio.onended = handleEnded
    }

    // return () => {
    //   audio.onended = null;
    // };
  }, [audioRef.current])

  const sortUnmutes = () => {
    if (unmutes?.length !== 1) {
      const sortedUnmutes = [...unmutes]?.sort((a, b) => {
        const a_created = a.properties?._created
        const b_created = b.properties?._created

        if (a_created?.date !== b_created?.date)
          return new Date(a_created?.date) - new Date(b_created?.date)

        return a_created?.index - b_created?.index
      })
      const itemsWithImage = sortedUnmutes.filter(
        (item) => item.properties._images?.length > 0
      )
      setEditSlider((prev) => prev + 1)
      setInitialSlide(itemsWithImage.length - 1)
      const itemsWithoutImages = sortedUnmutes.filter(
        (item) => !item.properties._images?.length
      )

      dispatch(updateAllUnmutes([...itemsWithImage, ...itemsWithoutImages]))
    }
  }

  useEffect(() => {
    if (unmutes.length > 0 && !isAlreadyRendered.current) {
      isAlreadyRendered.current = true
      sortUnmutes()
    }
  }, [unmutes])

  useEffect(() => {
    if (scrollToExtra > 0) {
      const isExtraExists = unmutes?.find(
        (item) => item.properties._extra || item.properties._collage
      )
      if (!isExtraExists) {
        setEditSlider((prev) => prev + 1)
        setInitialSlide(unmutes?.length)
      }
    }
  }, [scrollToExtra])

  useEffect(() => {
    if (scrollToActive > 0) {
      setEditSlider((prev) => prev + 1)
      setInitialSlide(activeUnmuteIndex)
    }
  }, [scrollToActive])

  const loading = activeUnmuteIndex === null

  useEffect(() => {
    if (audioRef.current) {
      if (playing) {
        audioRef.current.play()
      } else {
        audioRef.current.pause()
      }
    }
  }, [audioRef.current, playing])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      setPlaying(false)
    }
  }, [activeUnmuteIndex])

  const handlePlayAudio = () => {
    setPlaying(true)
  }

  const handlePauseAudio = () => {
    setPlaying(false)
  }

  const handleDelete = (uuid) => {
    const unmuteToUpdate = unmutes.find(
      (unmute) => unmute.properties._uuid === uuid
    )
    if (unmuteToUpdate.properties._images.length > 0) {
      deleteFile({
        path: unmuteToUpdate.properties._images[0],
      }).then(() => {
        removeUnmuteInCart(uuid).then(() => {
          dispatch(deleteUnmute(unmuteToUpdate.key))
        })
      })
    } else {
      removeUnmuteInCart(uuid).then(() => {
        dispatch(deleteUnmute(unmuteToUpdate.key))
      })
    }
  }

  if (loading) {
    return (
      <div className="snap-start">
        <div className="relative top-0 flex justify-center mt-16">
          <img src={frame_image} alt="Frame" className="relative top-0 w-1/2" />
          <div className="absolute h-full object-cover">
            <div className="flex flex-col items-center justify-center h-full">
              <Loader size={'w-24 h-24'} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      onTouchMoveCapture={(e) => {
        swiperRef.current.swiper.allowTouchMove = true
      }}
    >
      <Swiper
        key={editSlider}
        ref={swiperRef}
        slidesPerView={'auto'}
        centeredSlides={true}
        initialSlide={initialSlide}
        slideToClickedSlide={true}
        onSlideChange={(event) => {
          dispatch(setActiveUnmuteIndex(event.activeIndex))
        }}
      >
        {unmutes.map((unmute, index) => (
          <SwiperSlide
            key={unmute.key}
            className={
              unmute?.properties?._orientation === 'landscape'
                ? 'sliderLanscapedSize'
                : 'sliderSize'
            }
          >
            {unmute?.properties?._collage ? (
              <CollageUnmute
                unmute={unmute}
                onDelete={handleDelete}
                isActive={activeUnmuteIndex === index}
                index={index}
                swiperRef={swiperRef}
              />
            ) : (
              <Unmute2
                unmute={unmute}
                onDelete={handleDelete}
                length={unmutes?.length}
                isActive={activeUnmuteIndex === index}
                index={index}
                swiperRef={swiperRef}
              />
              /*<Unmute
                unmute={unmute}
                onDelete={handleDelete}
                length={unmutes?.length}
                activeUnmute={activeUnmuteIndex === index}
                index={index}
                swiperRef={swiperRef}
              />*/
            )}
          </SwiperSlide>
        ))}
        {Array.from({ length: blankFrames }).map((_, index) => (
          <SwiperSlide key={index} className={'sliderSize'}>
            <EmptyBox />
          </SwiperSlide>
        ))}
      </Swiper>
      {params[0] !== 'crop' ? (
        <div className="sm:mt-4 flex flex-col items-center">
          {activeUnmute?.properties?._audios?.length > 0 ? (
            <div className="flex flex-row items-center">
              <Link
                to={`/edit-audio/${activeUnmute?.properties?._uuid}`}
                className="text-rose-500 bg-white-500 border border-rose focus:outline-none hover:bg-rose-600 hover:text-white focus:ring-4 focus:ring-rose font-medium rounded-lg px-16 py-2.5 cursor-pointer"
              >
                Rediger lyd
              </Link>

              <button
                onClick={() => {
                  playing ? handlePauseAudio() : handlePlayAudio()
                }}
                className="ml-4 flex items-center justify-center w-12 h-12 text-white-500 bg-rose-500 rounded-full focus:shadow-outline hover:bg-rose-600"
              >
                {playing ? (
                  <>
                    <PauseIcon />
                  </>
                ) : (
                  <>
                    <PlayIcon />️
                  </>
                )}
              </button>
              <audio
                ref={audioRef}
                className="hidden"
                controls="controls"
                src={`${activeUnmute?.properties?._audios[0]?.file}?c=${cacheBust}`}
              ></audio>
            </div>
          ) : (
            <Link
              to={`/audio-upload/${activeUnmute?.properties?._uuid}`}
              className="audio-hidden-replace flex justify-center text-white bg-rose-500 border border-rose-600 focus:outline-none hover:bg-rose-600 focus:ring-4 focus:ring-rose font-medium rounded-xl tracking-tight px-6 py-2.5 cursor-pointer text-center w-[270px]"
              style={{
                opacity: !activeUnmute || disableAllExtions ? '0.5' : '1',
                pointerEvents:
                  !activeUnmute || disableAllExtions ? 'none' : 'unset',
              }}
            >
              Tilføj lydfil
            </Link>
          )}
        </div>
      ) : null}
    </div>
  )
})
