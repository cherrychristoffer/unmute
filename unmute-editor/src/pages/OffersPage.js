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
    console.log("quantity", quantity);

    addUnmuteToCart({ quantity }).then(({ data }) => {
      data.items.forEach((unmute) => {
        dispatch(addUnmute(unmute));
      });
      navigate("/upload-image");
    });
  };
  console.log("test");
  const UNMUTE = [
    {
      image: offer1,
      quantity: 1,
      title: "Unmute",
      price: "399",
    },
    {
      image: offer2,
      quantity: 2,
      title: "Todays special",
      price: "699",
      saving: 100,
    },
    {
      image: offer3,
      quantity: 1,
      title: "Collage",
      price: "399",
    },
    {
      image: offer4,
      quantity: 3,
      title: "Best offer",
      price: "999",
      saving: 200,
      special: true,
    },
  ];

  return (
    <div className={"offers-page flex items-center py-10"}>
      <div className="content">
        <div className="mx-auto flex flex-col items-center">
          <h1 className="font-serif text-muld-1000 text-[50px] mb-4">Unmute</h1>
          <h2 className="font-serif text-rose-500 text-[17px] text-center leading-tight">
            Choose 3 and
            <br />
            save 100 DKK
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 mx-4 mt-14">
          {UNMUTE.map((item, index) => (
            <div
              key={index}
              onClick={() => handleClick({ quantity: item.quantity })}
              className="flex flex-col items-center my-2 cursor-pointer"
            >
              <img
                src={item.image}
                className="rounded-[3px] aspect-square object-cover"
                alt={item.title}
              />
              <div
                className={`-mt-12 px-2.5 py-2 w-5/6 rounded-[4px] ${
                  item.special ? "bg-rose-500" : "bg-muld-1000"
                }`}
              >
                <div className="font-light text-gray-700">
                  <p
                    className={`${
                      item.special ? "text-white" : "text-rose-500"
                    } text-[12px]`}
                  >
                    {item.title}
                  </p>
                  <p className="text-lg text-white text-[12px] my-1">
                    {item.price} DKK
                  </p>
                  <p className="text-[10px] text-beige-200">
                    {item.quantity} unmute {item.quantity === 1 && "frame"}
                    {item.saving && (
                      <span
                        className={
                          item.special ? "text-white" : "text-rose-500"
                        }
                      >
                        (Save {item.saving} DKK)
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
