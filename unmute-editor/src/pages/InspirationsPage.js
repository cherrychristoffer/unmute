import { React, useEffect } from "react";
import { useLocation } from "wouter";
import { useDispatch, useSelector} from 'react-redux'
import { getInspirations } from '../api/inspiration'
import { setInspirations, setInspirationsLoading } from '../features/inspiration/inspirationSlice'
import {Loader} from "../components/Loader";

export const InspirationsPage = () => {
  const [_location, navigate] = useLocation();
  const dispatch = useDispatch()
  const inspirations = useSelector(state => state.inspiration.inspirations)
  const inspirationsLoading = useSelector(state => state.inspiration.inspirationsLoading)

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

  const handleClick = (inspiration) => {
    navigate(`/inspiration-video/${inspiration.id}`);
  };

  if (inspirationsLoading || !inspirations) {
    return (<Loader size={"w-24 h-24"} />)
  }

  return (
    <div className={'offers-page flex items-center py-10'}>
      <div className="content">
        <div className="mx-auto flex flex-col items-center">
          <h1 className="font-serif text-muld-1000 text-[50px] mb-4">Inspiration</h1>
          <h2 className="font-serif text-muld-1000 text-[17px] text-center leading-tight">
            Choose your occasion
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-6 mx-4 mt-14">
          {inspirations.map((item) =>
            <div
                key={item.id}
                onClick={() => handleClick(item)}
                className="flex flex-col items-center my-2 cursor-pointer"
            >
              <img
                  src={item.thumbnail_url}
                  className="rounded-[3px] aspect-square object-cover"
                  alt={item.name}
              />
              <div
                  className={`-mt-14 px-2.5 py-3 w-5/6`}>
                <div className="font-light text-gray-700">
                  <p className={`text-white text-[12px]`}>{item.name}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
