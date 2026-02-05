import { React } from 'react'
import { useLocation } from 'wouter'

import Collage1 from '../assets/images/collage/collage1.png'
import Collage2 from '../assets/images/collage/collage2.png'
import Collage3 from '../assets/images/collage/collage3.png'
import Collage4 from '../assets/images/collage/collage4.png'
import Collage5 from '../assets/images/collage/collage5.png'
import Collage6 from '../assets/images/collage/collage6.png'
import Collage7 from '../assets/images/collage/collage7.png'
import Collage8 from '../assets/images/collage/collage8.png'
import { addUnmuteToCart } from '../api/cart'
import { addUnmute } from '../features/user/userSlice'
import { useDispatch } from 'react-redux'

export const CollagePage = () => {
  const [_location, navigate] = useLocation()
  const dispatch = useDispatch()

  const COLLAGES = [
    {
      image: Collage5,
      type: 'collage_1_1',
      max: 2,
    },
    {
      image: Collage6,
      type: 'collage_1_2',
      max: 3,
    },
    {
      image: Collage7,
      type: 'collage_2_2',
      max: 4,
    },
    {
      image: Collage1,
      type: 'collage_2_1_2',
      max: 5,
    },
    {
      image: Collage2,
      type: 'collage_1_2_2',
      max: 5,
    },
    {
      image: Collage3,
      type: 'collage_2_2_2',
      max: 6,
    },
    {
      image: Collage4,
      type: 'collage_4_2_1_2_4',
      max: 13,
    },
    {
      image: Collage8,
      type: 'collage_2_2_1',
      max: 5,
    },
  ]

  const handleClick = (type, max) => {
    addUnmuteToCart({
      quantity: 1,
      extra: false,
      collage: true,
      collageType: type,
      maxItems: max,
    }).then(({ data }) => {
      data.items.forEach((unmute) => {
        dispatch(addUnmute(unmute))
      })
      navigate('/upload-image?type=multiple')
    })
  }

  return (
    <div className={'offers-page flex items-center py-10'}>
      <div className="content">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mx-4">
          {COLLAGES.map((item, index) => (
            <div
              key={index}
              onClick={() => handleClick(item.type, item.max)}
              className="flex flex-col items-center my-2 cursor-pointer"
            >
              <img src={item.image} className="w-full" alt={item.title} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
