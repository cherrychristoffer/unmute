import React from 'react'
import frame_image from '../assets/images/frame.png'
import frame_landscape_image from '../assets/images/frame_landscape.png'
import clsx from 'clsx'
import { PlusIcon } from '../assets/icons/icon_plus'
import { Link } from 'wouter'

export const EmptyBox = ({ orientation }) => {
  const isLandscape = orientation === 'landscape'
  const frame = isLandscape ? frame_landscape_image : frame_image
  const frame_width = isLandscape
    ? 'min-w-[300px] w-[55%]'
    : 'min-w-[250px] w-1/2'

  return (
    <>
      <div className="snap-center flex items-center py-4">
        <div
          className={clsx(
            'relative flex justify-center',
            isLandscape ? 'mt-0' : 'mt-0'
          )}
        >
          <div className="absolute top-[30px] z-[2] extra-box text-rose-500 text-center text-[14px] -mt-[5px]">
            Tilføj ekstra UNMUTE
            <br />
            og spar penge
          </div>
          <img
            src={frame}
            alt="Frame"
            className={clsx(
              frame_width,
              'relative top-0 z-[1] pointer-events-none'
            )}
          />
          <Link className={'absolute inset-[16px]'} to="/?stay=true">
            <div
              className={
                'w-[68px] h-[68px] bg-rose-500 hover:bg-rose-700 cursor-pointer fill-white rounded-full flex items-center justify-center absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 z-10'
              }
            >
              <PlusIcon size={40} />
            </div>
            <span
              className={
                'absolute left-[29%] w-[85px] top-[65%] text-center !text-[16px]'
              }
            >
              Vælg foto eller kollage
            </span>
          </Link>
        </div>
      </div>
    </>
  )
}
