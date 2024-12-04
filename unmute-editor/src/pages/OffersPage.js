import { React, useEffect, useRef, useState } from 'react';
import { useLocation, useSearch } from 'wouter';

import { addUnmute } from '../features/user/userSlice';
import { addUnmuteToCart } from '../api/cart';
import { useDispatch, useSelector } from 'react-redux';

import { useParams } from 'wouter';

import { Loader } from '../components/Loader';

const shop = new URLSearchParams(window.location).get('host');

export const OffersPage = () => {
  const [_location, navigate] = useLocation();
  const dispatch = useDispatch();
  const { unmutes, isLoadingUnmutes } = useSelector((state) => state.user);

  const params = useSearch();
  const [stayOnPage, setStayOnPage] = useState(params?.includes('stay=true'));

  console.log('offers page', params?.includes('stay=true'));

  const handleClick = ({ quantity }) => {
    setStayOnPage(true);
    addUnmuteToCart({ quantity }).then(({ data }) => {
      data.items.forEach((unmute) => {
        dispatch(addUnmute(unmute));
      });
      navigate('/upload-image?type=single');
    });
  };

  useEffect(() => {
    if (unmutes?.length > 0 && !stayOnPage) {
      navigate('/orientation');
    }
  }, [unmutes]);

  const navigateToCollage = () => navigate('/collage');

  if (isLoadingUnmutes || (unmutes?.length !== 0 && !stayOnPage))
    return (
      <div className="flex justify-center">
        <Loader />
      </div>
    );

  const UNMUTE = [
    {
      image: 'https://unmute-prod.s3.eu-north-1.amazonaws.com/static-assets/offers/offer1.png',
      quantity: 1,
      title: 'En UNMUTE',
      price: window.unmuteEditorSettings?.price_1 || '499',
      saving: window.unmuteEditorSettings?.savings_1 || 0,
      onClick: handleClick,
      inactive: false,
    },
    {
      image: 'https://unmute-prod.s3.eu-north-1.amazonaws.com/static-assets/offers/offer2.png',
      quantity: 2,
      title: 'Mest populær',
      price: window.unmuteEditorSettings?.price_2 || '499',
      saving: window.unmuteEditorSettings?.savings_2 || 0,
      onClick: handleClick,
      inactive: false,
    },
    {
      image: 'https://unmute-prod.s3.eu-north-1.amazonaws.com/static-assets/offers/offer3.png',
      quantity: 1,
      title: 'Collage',
      price: window.unmuteEditorSettings?.price_3 || '499',
      saving: window.unmuteEditorSettings?.savings_3 || 0,
      onClick: navigateToCollage,
      inactive: false,
      //inactive: shop !== 'unmuteframes.myshopify.com',
    },
    {
      image: 'https://unmute-prod.s3.eu-north-1.amazonaws.com/static-assets/offers/offer4.png',
      quantity: 3,
      title: 'Bedste tilbud',
      price: window.unmuteEditorSettings?.price_4 || '499',
      saving: window.unmuteEditorSettings?.savings_4 || 0,
      special: true,
      onClick: handleClick,
      inactive: false,
    },
  ];

  const currency = (value) => {
    value = parseFloat(value) * 100;
    if (typeof value !== 'number') {
      return value;
    }
    let formatter = new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: 'DKK'
    });
    return formatter.format(value / 100).replace(',00', '');
  };


  return (
    <div className={'offers-page flex items-center py-10 pb-[100px] sm:pb-[140px]'}>
      <div className="content">
        <div className="mx-auto flex flex-col items-center">
          <h1 className="font-serif text-muld-1000 text-[50px] mb-4">Unmute</h1>
          <h2 className="font-serif text-rose-500 text-[17px] text-center leading-tight">
            Vælg antal
            <br />
            Lav flere og spar penge
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mx-4 mt-14">
          {UNMUTE.map((item, index) => (
            <div
              key={index}
              onClick={() => item.onClick({ quantity: item.quantity })}
              className={`group flex flex-col my-2 cursor-pointer ${item.inactive && 'pointer-events-none position-relative'}`}
            >
              <img
                src={item.image}
                className={`rounded-xl aspect-square object-cover ring-2 ring-offset-4 ring-transparent group-hover:ring-rose-300 ${item.inactive && 'opacity-2'}`}
                alt={item.title}
              />
              {item.inactive &&
                <span className="coming-soon text-[20px] self-center">
                  Kommer snart
                </span>
              }
              <div
                className={`py-4 ${item.inactive && 'opacity-50 z-[1] pointer-events-none'}`}
              >
                <div className="font-light text-gray-700">
                  <p
                    className={`${
                      item.special ? 'text-rose-500' : 'text-rose-500'
                    } text-[22px]`}
                  >
                    {item.title}
                  </p>
                  <p className="text-[15px] font-semibold my-1">
                    {item.inactive ? (
                      <span style={{ display: 'inline-block' }}> </span>
                    ) : (
                      `${currency(item.price)}`
                    )
                    }
                  </p>
                  <p className="text-[18px] text-zinc-600">
                    {item.inactive ? (
                      <span style={{ display: 'inline-block' }}> </span>
                    ) : (
                      <>
                        Antal: {item.quantity}
                        {(item.saving && item.saving > 0) ? (
                          <span className={
                            item.special ? 'text-rose-500' : 'text-rose-500'
                          }
                          > (Spar {currency(item.saving)})
                          </span>
                        ) : null}
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
