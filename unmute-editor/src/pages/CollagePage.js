import { React, useState } from "react";
import { useLocation } from "wouter";

import Collage1 from "../assets/images/collage/collage1.png";
import Collage2 from "../assets/images/collage/collage2.png";
import Collage3 from "../assets/images/collage/collage3.png";
import Collage4 from "../assets/images/collage/collage4.png";
import { addUnmuteToCart } from "../api/cart";
import { addUnmute } from "../features/user/userSlice";
import { useDispatch } from "react-redux";
import { useActiveUnmute } from "../api/useUnmutes";

export const CollagePage = () => {
  const [_location, navigate] = useLocation();
  const dispatch = useDispatch();
  const [images, setImages] = useState([]);
  const { activeUnmute } = useActiveUnmute();
  console.log("activeUnmute", activeUnmute);
  const activeImages = activeUnmute?.properties?._images;
  console.log("activeImages", activeImages);

  const COLLAGES = [
    {
      image: Collage1,
      quantity: 5,
    },
    {
      image: Collage2,
      quantity: 5,
    },
    {
      image: Collage3,
      quantity: 6,
    },
    {
      image: Collage4,
      quantity: 13,
    },
  ];

  const handleClick = ({ quantity }) => {
    addUnmuteToCart({ quantity, collage: true }).then(({ data }) => {
      data.items.forEach((unmute) => {
        dispatch(addUnmute(unmute));
      });
      navigate("/upload-image?type=multiple");
    });
  };
  // const handleChange = (event) => {
  //   const files = event.target.files;
  //   console.log("files", files);

  //   const fileArray = Array.from(files);
  //   console.log("fileArray", fileArray);
  //   setImages(fileArray);
  // };

  return (
    <div className={"offers-page flex items-center py-10"}>
      <div className="content">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mx-4">
          {/* {COLLAGES.map((item, index) => (
            <div
              key={index}
              onClick={() => handleClick({ quantity: item.quantity })}
              className="flex flex-col items-center my-2 cursor-pointer"
            >
              <img src={item.image} className="w-full" alt={item.title} />
            </div>
          ))} */}
          {/* <input
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            // className="hidden"
            // id={`mage-add-${unmute.key}`}
            onChange={handleChange}
            multiple
          /> */}
          <div
            style={{
              width: 300,
              height: 300,
              borderWidth: 1,
              borderColor: "#000",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                height: 100,
                borderBottomWidth: 1,
                borderBottomColor: "#000",
              }}
              onClick={() => handleClick({ quantity: 1 })}
            >
              Collage 1
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                height: 100,
                borderBottomWidth: 1,
                borderBottomColor: "#000",
              }}
            >
              <div
                style={{
                  width: 150,
                  borderRightWidth: 1,
                  borderBottomColor: "#000",
                }}
              >
                Collage 2
              </div>
              <div>Collage 3</div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                height: 100,
                borderBottomWidth: 1,
                borderBottomColor: "#000",
              }}
            >
              <div
                style={{
                  width: 150,
                  borderRightWidth: 1,
                  borderBottomColor: "#000",
                }}
              >
                Collage 4
              </div>
              <div>Collage 5</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
