import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import clsx from 'clsx'
import {
  setReplaceIndex,
  setReplaceMode,
} from '../features/replace/replaceSlice'
import { useActiveUnmute } from '../api/useUnmutes'
import { updateUnmuteInCart } from '../api/cart'
import { updateUnmutes } from '../features/user/userSlice'
import { getFileUrl, uploadFile } from '../api/aws'

export const ReplacePage = () => {
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const { activeUnmute } = useActiveUnmute()
  const activeUnmuteIndex = useSelector((state) => state.user.activeUnmuteIndex)

  useEffect(() => {
    if (activeUnmute && !activeUnmute.properties._enhanced) {
      dispatch(setReplaceMode(true))
    } else {
      removeReplaceMode()
    }
    return () => {
      removeReplaceMode()
    }
  }, [activeUnmuteIndex, activeUnmute])

  const removeReplaceMode = () => {
    dispatch(setReplaceMode(false))
    dispatch(setReplaceIndex(-1))
  }

  const handleChange = async (event) => {
    const uuid = activeUnmute.properties._uuid
    const file = event.target.files[0]
    setLoading(true)

    uploadFile({
      path: uuid,
      file,
    }).then((path) => {
      const fileUrl = getFileUrl(path)
      updateUnmuteInCart({
        key: activeUnmute.key,
        properties: {
          ...activeUnmute.properties,
          _images: [fileUrl],
          _original_images: [fileUrl],
        },
      }).then(({ data }) => {
        dispatch(updateUnmutes(data.items))
        setLoading(false)
      })
    })
  }

  return (
    <div
      className={clsx('flex flex-col items-center', {
        hidden: !activeUnmute?.properties?._images?.length,
      })}
    >
      <style>{`.audio-hidden-replace {display: none;}`}</style>
      <label
        className="text-white bg-rose-500 border border-rose-600 focus:outline-none hover:bg-rose-600 focus:ring-4 focus:ring-rose font-medium rounded-lg px-16 py-2.5 cursor-pointer"
        htmlFor={`upload-nyt-oto-${activeUnmute?.key}`}
      >
        {loading ? 'Loading...' : 'Upload nyt foto'}
      </label>
      <input
        type="file"
        accept="image/png, image/jpeg, image/jpg"
        className="hidden"
        id={`upload-nyt-oto-${activeUnmute?.key}`}
        onChange={handleChange}
      />
    </div>
  )
}
