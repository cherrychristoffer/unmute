import { React, useState } from 'react'

import { CheckIcon } from '../assets/icons/icon_check'

import { updateUnmute, updateUnmutes } from '../features/user/userSlice'
import { useDispatch, useSelector } from 'react-redux'

import { updateUnmuteInCart } from '../api/cart'

import { useActiveUnmute } from '../api/useUnmutes'
import { mergeImages } from '../hooks/mergeImage'

import large from '../assets/images/passepartout/large.png'
import medium from '../assets/images/passepartout/medium.png'
import none from '../assets/images/passepartout/none.png'
import small from '../assets/images/passepartout/small.png'

export const PassepartoutPage = () => {
  const dispatch = useDispatch()
  const { activeUnmute } = useActiveUnmute()
  const { disableAllExtions } = useSelector((state) => state.image)
  const [loading, setLoading] = useState(false)

  const handleClick = async (passepartout) => {
    if (!activeUnmute) return
    if (activeUnmute?.properties?._passepartout === passepartout) return

    setLoading(true)

    let mergeImageUrl = null

    if (activeUnmute.properties._collage) {
      mergeImageUrl = await mergeImages(
        activeUnmute.properties._uuid,
        activeUnmute.properties._images,
        activeUnmute.properties._orientation,
        activeUnmute.properties._collage_type,
        passepartout,
      )
    }

    dispatch(
      updateUnmute({
        ...activeUnmute,
        properties: { ...activeUnmute.properties, _passepartout: passepartout, _cart_image: mergeImageUrl },
      })
    )

    updateUnmuteInCart({
      key: activeUnmute.key,
      properties: {
        ...activeUnmute.properties,
        _passepartout: passepartout,
        _cart_image: mergeImageUrl
      },
    })
      .then(({ data }) => {
        dispatch(updateUnmutes(data.items))
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }

  const PASSEPARTOUT = [
    {
      value: 'none',
      image: none,
      title: 'Ingen',
    },
    {
      value: 2,
      image: small,
      title: '2 cm',
    },
    {
      value: 5,
      image: medium,
      title: '5 cm',
    },
    {
      value: 7,
      image: large,
      title: '7 cm',
    },
  ]

  return (
    <div className={'pb-[100px] sm:pb-[140px] flex justify-center'}>
      <div className="mt-[20px] mx-6 flex flex-row justify-center items-center gap-6 max-w-sm">
        {PASSEPARTOUT.map((item, index) => (
          <div key={index} className={'text-center'}>
            <button
              key={index}
              disabled={disableAllExtions || loading}
              onClick={() => handleClick(item.value)}
              className={`relative`}
            >
              <img
                style={{ opacity: disableAllExtions || loading ? '0.5' : '1' }}
                src={item.image}
                alt="passepartout"
              />
              {activeUnmute?.properties?._passepartout === item.value && (
                <CheckIcon
                  color={'fill-rose-100'}
                  size={16}
                  className={
                    'absolute top-0 bottom-0 left-0 right-0 m-auto w-[25px] h-[25px] bg-rose-500 rounded-full flex items-center justify-center'
                  }
                />
              )}
            </button>
            <p
              className={'text-center text-[14px]'}
              style={{ opacity: disableAllExtions || loading ? '0.5' : '1' }}
            >
              {item.title}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
