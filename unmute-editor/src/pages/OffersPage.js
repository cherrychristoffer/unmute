import { React, useEffect, useRef } from "react";
import { useLocation } from "wouter";

import { addUnmute } from "../features/user/userSlice";
import { addUnmuteToCart } from "../api/cart";
import { useDispatch, useSelector } from "react-redux";

import { Loader } from "../components/Loader";

export const OffersPage = () => {
  const [_location, navigate] = useLocation();
  const dispatch = useDispatch();
  const { unmutes, isLoadingUnmutes } = useSelector((state) => state.user);
  const dontRedirect = useRef(false);

  const handleClick = ({ quantity }) => {
    addUnmuteToCart({ quantity }).then(({ data }) => {
      dontRedirect.current = true;
      data.items.forEach((unmute) => {
        dispatch(addUnmute(unmute));
      });
      navigate("/upload-image");
    });
  };

  useEffect(() => {
    if (unmutes?.length > 0 && !dontRedirect.current) {
      navigate("/orientation");
    }
  }, [unmutes]);

  // @ToDo: This function can be reverted once the Collage feature is implemented
  // const navigateToCollage = () => navigate("/collage");
  const navigateToCollage = () => { console.log('coming soon.') };

  if (isLoadingUnmutes || unmutes?.length !== 0)
    return (
      <div className="flex justify-center">
        <Loader />
      </div>
    );

  const UNMUTE = [
    {
      image: "https://unmute-prod.s3.eu-north-1.amazonaws.com/static-assets/offers/offer1.png",
      quantity: 1,
      title: "En UNMUTE",
      price: "499",
      onClick: handleClick,
      inactive: false,
    },
    {
      image: "https://unmute-prod.s3.eu-north-1.amazonaws.com/static-assets/offers/offer2.png",
      quantity: 2,
      title: "Mest populær",
      price: "898",
      saving: 100,
      onClick: handleClick,
      inactive: false,
    },
    {
      image: "https://unmute-prod.s3.eu-north-1.amazonaws.com/static-assets/offers/offer3.png",
      quantity: 1,
      title: "Collage",
      price: "399",
      onClick: navigateToCollage,
      inactive: true, // @ToDo: inactive flag can be removed once the Collage feature is implemented
    },
    {
      image: "https://unmute-prod.s3.eu-north-1.amazonaws.com/static-assets/offers/offer4.png",
      quantity: 3,
      title: "Bedste tilbud",
      price: "1.257",
      saving: 240,
      special: true,
      onClick: handleClick,
      inactive: false,
    },
  ];

  return (
    <div className={"offers-page flex items-center py-10 pb-[80px] sm:pb-[110px]"}>
      <div className="content">
        <div className="mx-auto flex flex-col items-center">
          <h1 className="font-serif text-muld-1000 text-[50px] mb-4">Unmute</h1>
          <h2 className="font-serif text-rose-500 text-[17px] text-center leading-tight">
            Vælg antal
            <br />
            Lav flere og spar penge
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mx-4 mt-14">
          {UNMUTE.map((item, index) => (
            <div
              key={index}
              onClick={() => item.onClick({ quantity: item.quantity })}
              className={`flex flex-col items-center my-2 cursor-pointer ${item.inactive && 'pointer-events-none position-relative'}`}
            >
              <img
                src={item.image}
                className={`rounded-[3px] aspect-square object-cover ${item.inactive && 'opacity-2'}`}
                alt={item.title}
              />
              {item.inactive &&
              <span className="coming-soon text-[20px]">
                Kommer snart
              </span>
              }
              <div
                className={`-mt-12 px-2.5 py-2 w-5/6 rounded-[4px] ${
                  item.special ? "bg-rose-500" : "bg-muld-1000"
                } ${item.inactive && 'bg-[#a9a9a9] z-[1] pointer-events-none'}`}
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
                    {item.inactive ? (
                      <span style={{display: 'inline-block'}}> </span>
                      ) : (
                      `${item.price} DKK`
                      )
                    }
                  </p>
                  <p className="text-[10px] text-beige-200">
                    {item.inactive ? (
                        <span style={{display: 'inline-block'}}> </span>
                      ) : (
                        <>
                          Antal: {item.quantity}
                          {item.saving && (
                            <span className={
                                    item.special ? "text-white" : "text-rose-500"
                                  }
                              > (Spar {item.saving} DKK)
                            </span>
                          )}
                        </>
                      )
                    }
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
