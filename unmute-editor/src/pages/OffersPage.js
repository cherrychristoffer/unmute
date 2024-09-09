import { React } from "react";
import { useLocation } from "wouter";

import { addUnmute } from "../features/user/userSlice";
import { addUnmuteToCart } from "../api/cart";
import { useDispatch } from "react-redux";

import offer1 from "../assets/images/offers/offer1.png";
import offer2 from "../assets/images/offers/offer2.png";
import offer3 from "../assets/images/offers/offer3.png";
import offer4 from "../assets/images/offers/offer4.png";

export const OffersPage = () => {
  const [_location, navigate] = useLocation();
  const dispatch = useDispatch();

  const handleClick = ({ quantity }) => {
    addUnmuteToCart({ quantity }).then(({ data }) => {
      data.items.forEach((unmute) => {
        dispatch(addUnmute(unmute));
      });
      navigate("/upload-image");
    });
  };

  return (
    <>
      <div className="mx-auto mt-12 flex flex-col items-center">
        <h1 className="font-serif text-muld-500 text-6xl mb-4">Unmute</h1>
        <h2 className="font-serif text-rose-500 text-lg text-center leading-tight">
          Choose 3 and
          <br />
          save 100 DKK
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mx-4 mt-6">
        <div
          onClick={() => handleClick({ quantity: 1 })}
          className="flex flex-col items-center"
        >
          <img
            src={offer1}
            className="rounded-sm aspect-square object-cover"
            alt="Offer 1"
          />
          <div className="-mt-12 py-2 px-3 bg-muld-500 w-5/6 min-h-36">
            <div className="mb-3 font-light text-gray-700">
              <div className="text-rose-500">Unmute</div>
              <div className="text-lg text-white">399 DKK</div>
              <div className="text-[10px] text-beige-500">1 unmute frame</div>
            </div>
          </div>
        </div>

        <div
          onClick={() => handleClick({ quantity: 2 })}
          className="flex flex-col items-center"
        >
          <img
            src={offer2}
            className="rounded-sm aspect-square object-cover"
            alt="Offer 2"
          />
          <div className="-mt-12 py-2 px-3 bg-muld-500 w-5/6 min-h-36">
            <div className="mb-3 font-light text-gray-700">
              <div className="text-rose-500">Todays special</div>
              <div className="text-lg text-white">699 DKK</div>
              <div className="text-[10px] text-beige-500">
                2 unmute frames{" "}
                <div className="text-rose-500">(Save 100 DKK)</div>
              </div>
            </div>
          </div>
        </div>

        <div
          onClick={() => handleClick({ quantity: 1 })}
          className="flex flex-col items-center opacity-50"
        >
          <img
            src={offer3}
            className="rounded-sm aspect-square object-cover"
            alt="Offer 3"
          />
          <div className="-mt-12 py-2 px-3 bg-muld-500 w-5/6 min-h-36">
            <div className="mb-3 font-light text-gray-700">
              <div className="text-rose-500">Collage</div>
              <div className="text-lg text-white">399 DKK</div>
              <div className="text-[10px] text-beige-500">1 unmute frame</div>
            </div>
          </div>
        </div>

        <div
          onClick={() => handleClick({ quantity: 3 })}
          className="flex flex-col items-center"
        >
          <img
            src={offer4}
            className="rounded-sm aspect-square object-cover"
            alt="Offer 4"
          />
          <div className="-mt-12 py-2 px-3 bg-rose-500 w-5/6 min-h-36">
            <div className="mb-3 font-light text-gray-700">
              <div className="text-white">Best offer</div>
              <div className="text-lg text-white">999 DKK</div>
              <div className="text-[10px] text-beige-500">
                3 unmute frames <div className="text-white">(Save 200 DKK)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
