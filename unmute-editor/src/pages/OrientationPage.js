import { React, useState } from 'react'

import { CheckIcon } from '../assets/icons/icon_check'

import { updateUnmute, updateUnmutes } from '../features/user/userSlice'
import { useDispatch, useSelector } from 'react-redux'

import { updateUnmuteInCart } from '../api/cart'

import { useActiveUnmute } from '../api/useUnmutes'

import landscape from '../assets/images/orientation/landscape.png'
import portrait from '../assets/images/orientation/portrait.png'
import {
  setMustCrop,
  setOrientationChanged,
} from '../features/image/imageSlice'
import { mergeImages } from '../hooks/mergeImage'

export const OrientationPage = () => {
  const dispatch = useDispatch()
  const { activeUnmute } = useActiveUnmute()
  const { disableAllExtions } = useSelector((state) => state.image)
  const [loading, setLoading] = useState(false)

  const handleClick = async (orientation) => {
    if (!activeUnmute) return
    if (activeUnmute?.properties?._orientation === orientation) return
    // if (activeUnmute.properties._collage) {
    //   return;
    // }
    setLoading(true)

    let mergeImageUrl = null
    let activeUnmuteItem = {
      ...activeUnmute,
      properties: {
        ...activeUnmute.properties,
        _orientation: orientation,
      },
    }
    let activeUnmuteCartItem = {
      key: activeUnmute.key,
      properties: {
        ...activeUnmute.properties,
        _orientation: orientation,
      },
    }

    if (activeUnmute.properties._collage) {
      mergeImageUrl = await mergeImages(
        activeUnmute.properties._uuid,
        activeUnmute.properties._images,
        orientation,
        activeUnmute.properties._collage_type,
        activeUnmute.properties._passepartout,
      )

      activeUnmuteItem = {
        ...activeUnmuteItem,
        properties: {
          ...activeUnmuteItem.properties,
          _cart_image: mergeImageUrl,
        }
      }

      activeUnmuteCartItem = {
        ...activeUnmuteCartItem,
        properties: {
          ...activeUnmuteCartItem.properties,
          _cart_image: mergeImageUrl,
        }
      }
    }

    dispatch(
      updateUnmute(activeUnmuteItem)
    )

    updateUnmuteInCart(activeUnmuteCartItem)
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
      .then(({ data }) => {
        dispatch(setOrientationChanged(true))
        dispatch(updateUnmutes(data.items))
        setLoading(false)
      })
  }

  const ORIENTATION = [
    {
      value: 'portrait',
      image: portrait,
    },
    {
      value: 'landscape',
      image: landscape,
    },
  ]

  return (
    <div className={'pb-[100px] sm:pb-[140px]'}>
      <div className="flex flex-col items-center">
        <div className="mt-[20px] flex flex-row justify-center items-center gap-8 w-2/3 max-w-[160px]">
          {ORIENTATION.map((item, index) => (
            <button
              key={index}
              disabled={disableAllExtions || loading}
              onClick={() => handleClick(item.value)}
              className={`relative cursor-pointer`}
            >
              <img
                src={item.image}
                style={{ opacity: disableAllExtions || loading ? '0.5' : '1' }}
                className=""
                alt={item.value}
              />
              {(activeUnmute?.properties?._orientation === item.value ||
                (!activeUnmute && item.value === 'portrait')) && (
                  <CheckIcon
                    color={'fill-rose-100'}
                    size={16}
                    className={
                      'absolute top-0 bottom-0 left-0 right-0 m-auto w-[25px] h-[25px] bg-rose-500 rounded-full flex items-center justify-center'
                    }
                  />
                )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
