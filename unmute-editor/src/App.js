import { React, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';

import { fetchCartData, updateUnmuteInCart, removeUnmuteInCart } from "./api/cart";

import { Route, Switch, useLocation } from "wouter";
import { CollagePage } from "./pages/CollagePage";

import { CropPage } from "./pages/CropPage";
import { Frame } from "./components/Frame";
import { UnmuteBottomNavigation } from "./components/UnmuteBottomNavigation";
import { UploadAudioPage } from "./pages/Audio/UploadAudioPage";

import { FramePage } from "./pages/FramePage";
import { InspirationsVideoPage } from "./pages/InspirationsVideoPage";
import { OffersPage } from "./pages/OffersPage";
import { OrientationPage } from "./pages/OrientationPage";
import { PassepartoutPage } from "./pages/PassepartoutPage";
import { ReplacePage } from "./pages/ReplacePage";
import { UploadImagePage } from "./pages/UploadImagePage";

import { EditAudioPage } from "./pages/Audio/EditAudioPage";
import { InspirationPage } from "./pages/Audio/InspirationPage";
import { StartRecordingPage } from "./pages/Audio/StartRecordingPage";

import { addUnmute, setIsLoadingUnmutes, updateUnmutes } from "./features/user/userSlice";
import { shopifyCollageVariants, shopifyVariants } from './app/const';

import "./assets/styles/global.css";

function App() {
  const dispatch = useDispatch();
  const [_location, navigate] = useLocation();

  const appHeight = () => {
    const doc = document.documentElement;
    doc.style.setProperty("--app-height", `${window.innerHeight}px`);
  };

  function init() {
    window.addEventListener("resize", appHeight);
  }

  useEffect(init, []);
  useEffect(appHeight, []);

  useEffect(() => {
    dispatch(setIsLoadingUnmutes(true));
    fetchCartData().then(({ data }) => {
      if (data.items.length === 0) {
        navigate("/");
      } else {
        console.log(data.items);
        data.items
          .filter((cartItem) =>
            shopifyVariants.some((variant) => variant.id === cartItem.variant_id) || shopifyCollageVariants.some((variant) => variant.id === cartItem.variant_id)
          )
          .forEach((unmute) => {
            dispatch(addUnmute(unmute));
          });
      }
      dispatch(setIsLoadingUnmutes(false));
    });
  }, [dispatch]);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     fetchCartData().then(({ data }) => {
  //       const items = data.items
  //         .filter((cartItem) =>
  //           shopifyVariants.some((variant) => variant.id === cartItem.variant_id) || shopifyCollageVariants.some((variant) => variant.id === cartItem.variant_id)
  //         );
  //       dispatch(updateUnmutes(items));
  //     });
  //   }, 3000);
  //   return () => clearInterval(interval);
  // }, [dispatch]);

  // Check cart regularly for changes to detect the removed items
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     fetchCartData().then(({ data }) => {
  //       const savedCart = localStorage.getItem("cart");
  //       let unmutes = [];
  //       if (savedCart) {
  //         unmutes = JSON.parse(savedCart);
  //       }

  //       // Compare the cart items with the previous state and get the removed items
  //       let removedItems = []
  //       if (unmutes) {
  //         removedItems = unmutes.filter(
  //           (unmute) => !data.items.some((cartItem) => cartItem.key === unmute.key)
  //         );
  //       }

  //       console.log("Removed items", removedItems);

  //       if (data.items.length === 0) {
  //         navigate("/");
  //       } else {
  //         console.log(data.items);
  //         const newItems = data.items
  //           .filter((cartItem) =>
  //             shopifyVariants.some((variant) => variant.id === cartItem.variant_id) || shopifyCollageVariants.some((variant) => variant.id === cartItem.variant_id)
  //           )
  //           .map((unmute) => {
  //             for (let i = 0; i < removedItems.length; i++) {
  //               if (unmute.properties.uuid === removedItems[i].properties.uuid && removedItems[i].properties._enhanced) {
  //                 const properties = { ...unmute.properties };
  //                 properties._images = [unmute.properties._touched_images[0]];
  //                 delete properties._touched_images

  //                 updateUnmuteInCart({
  //                   key: unmute.key,
  //                   properties: properties,
  //                 });

  //                 return {
  //                   ...unmute,
  //                   properties: properties,
  //                 }
  //               } else if (unmute.properties.uuid === removedItems[i].properties.uuid && !removedItems[i].properties._enhanced) {
  //                 // Remove the unmute from the cart
  //                 removeUnmuteInCart(unmute.key);
  //               }
  //             }

  //             return unmute;
  //           });

  //         console.log('newItems', newItems)
  //         dispatch(updateUnmutes(newItems));
  //       }

  //       // Save cart items to localstorage and compare it every time
  //       localStorage.setItem("cart", JSON.stringify(data.items));

  //       dispatch(setIsLoadingUnmutes(false));
  //     });
  //   }, 5000);

  //   return () => clearInterval(interval);
  // }, [dispatch]);

  const location = useLocation();
  const specialRoutesRegex = /\/(orientation|frame|passepartout|crop)/;

  // Check if the current path matches any of the special routes
  const isSpecialRoute = specialRoutesRegex.test(location.pathname);

  return (
    <div className={`app-wrapper ${isSpecialRoute ? "with-navigation" : ""} pt-[10px] sm:pt-[30px] pb-[110px] sm:pb-[130px]`}>
      <progress id="progress-bar"></progress>

      <Switch>
        <Route
          path={/\/(orientation|frame|passepartout|crop|replace)/}
          component={Frame}
        />
      </Switch>

      <Switch>
        {/* Starting page */}
        {/*<Route path="/" component={StartPage}></Route>*/}
        <Route
          name="home"
          path="/"
          component={OffersPage}
        />
        {/*<Route*/}
        {/*  path="/inspirations"*/}
        {/*  component={InspirationsPage}*/}
        {/*/>*/}
        <Route
          path="/inspiration-video/:id"
          component={InspirationsVideoPage}
        />
        <Route
          path="/upload-image"
          component={UploadImagePage}
        />
        <Route
          path="/collage"
          component={CollagePage}
        />

        {/*<Route*/}
        {/*  path="/audio/:id"*/}
        {/*  component={AudioPage}*/}
        {/*/>*/}
        {/*<Route*/}
        {/*  path="/audio-approach"*/}
        {/*  component={AudioApproachPage}*/}
        {/*/>*/}
        <Route
          path="/audio-upload/:id"
          component={UploadAudioPage}
        />
        <Route
          path="/start-recording/:id"
          component={StartRecordingPage}
        />
        <Route
          path="/inspiration/:id"
          component={InspirationPage}
        />
        <Route
          path="/edit-audio/:id"
          component={EditAudioPage}
        />

        {/* UnmuteBottomNavigation */}
        <Route
          path="/orientation"
          component={OrientationPage}
        />
        <Route
          path="/frame"
          component={FramePage}
        />
        <Route
          path="/passepartout"
          component={PassepartoutPage}
        />
        <Route
          path="/crop"
          component={CropPage}
        />
        <Route
          path="/replace"
          component={ReplacePage}
        />
        <Route path="/add">ADD</Route>
      </Switch>

      <Switch>
        <Route
          path={/\/(orientation|frame|passepartout|crop|replace)/}
          component={UnmuteBottomNavigation}
        />
      </Switch>
    </div>
  );
}

export default App;
