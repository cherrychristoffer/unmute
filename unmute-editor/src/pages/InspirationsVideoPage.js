import clsx from "clsx";
import {Link, useParams} from "wouter";
import {NavCloseIcon} from "../assets/icons/icon_nav_close";
import { React, useEffect, useMemo } from "react";
import { useDispatch, useSelector} from 'react-redux'
import {setInspirations, setInspirationsLoading} from "../features/inspiration/inspirationSlice";
import {getInspirations} from "../api/inspiration";
import {Loader} from "../components/Loader";

export const InspirationsVideoPage = () => {
  const dispatch = useDispatch()
  const inspirations = useSelector(state => state.inspiration.inspirations)
  const inspirationsLoading = useSelector(state => state.inspiration.inspirationsLoading)
  const {id} = useParams()
  const inspiration = useMemo(() => {
      if (inspirations && id) {
        return inspirations.find(item => item.id === id)
      }
      return null
  }, [inspirations, inspirationsLoading, id])

  useEffect(() => {
    if (!inspirations && !inspirationsLoading) {
      fetchInspirations()
    }
  })

  const fetchInspirations = async () => {
    try {
      dispatch(setInspirationsLoading(true))
      const data = await getInspirations()
      dispatch(setInspirations(data))
    } finally {
      dispatch(setInspirationsLoading(false))
    }
  }

  if (!inspiration) {
    return (<Loader size={"w-24 h-24"} />)
  }

  return (
    <div className={'offers-page flex items-center py-10'}>
      <div className="content">
        <div className="mx-auto flex flex-col items-center">
          <h1 className="font-serif text-muld-1000 text-[50px] mb-4">Inspiration</h1>
          <h2 className="font-serif text-muld-1000 text-[17px] text-center leading-tight">
            Inspiration for your text
          </h2>
        </div>

        <div className="mt-14 w-full">
          <video
            className={'border border-rose-500 w-full rounded'}
            src={inspiration.video_url}
            controls={false}
            autoPlay
          >
          </video>
        </div>

        <div className="flex flex-row justify-center gap-4 mt-16">
          <Link to="/inspiration"
            className="text-rose-500 bg-rose-100 border border-rose-500 transition duration-200 ease-out focus:outline-none hover:bg-rose-300 focus:ring-4 focus:ring-rose font-medium rounded-lg px-8 py-2.5 cursor-pointer">
            Write text
          </Link>

          <Link
            to="/audio-upload"
            className="text-white bg-rose-500 border border-rose transition duration-200 ease-out focus:outline-none hover:bg-rose-900 focus:ring-4 focus:ring-rose font-medium rounded-lg px-8 py-2.5 cursor-pointer"
          >
            Start recording
          </Link>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 z-50 w-full bg-beige-300 border-t border-beige-200 sm:max-w-max sm:p-3 sm:rounded-xl sm:mx-auto sm:left-0 sm:right-0 sm:bottom-4">
        <div className="grid sm:gap-2 h-full max-w-2xl grid-cols-6 mx-auto font-medium">
          <div>&nbsp;</div>
          <div>&nbsp;</div>
          <div>&nbsp;</div>
          <div>&nbsp;</div>
          <div>&nbsp;</div>
          <Link
            to="/inspirations"
            className={(active) =>
              clsx(
                "inline-flex flex-col items-center justify-center py-3 group transition duration-200 ease-out hover:bg-beige-400 sm:px-4 sm:rounded-lg",
                active ? "bg-beige-400" : ""
              )
            }
          >
            <NavCloseIcon/>
            <span className="font-sans text-[10px] text-muld-1000 text-center mt-2">
              Close
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};
