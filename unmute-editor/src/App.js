import { React, useEffect } from "react";
import { useDispatch } from "react-redux";

import { fetchCartData } from "./api/cart";

import { Route, Switch, useLocation } from "wouter";

import { Frame } from "./components/Frame";
import { UnmuteBottomNavigation } from "./components/UnmuteBottomNavigation";

import { CropPage } from "./pages/CropPage";
import { FramePage } from "./pages/FramePage";
import {InspirationsPage} from "./pages/InspirationsPage";
import {InspirationsVideoPage} from "./pages/InspirationsVideoPage";
import { OffersPage } from "./pages/OffersPage";
import { OrientationPage } from "./pages/OrientationPage";
import { PassepartoutPage } from "./pages/PassepartoutPage";
import { StartPage } from "./pages/StartPage";
import { UploadImagePage } from "./pages/UploadImagePage";

import { AudioPage } from "./pages/Audio/AudioPage";
import { EditAudioPage } from "./pages/Audio/EditAudioPage";
import { InspirationPage } from "./pages/Audio/InspirationPage";
import { StartRecordingPage } from "./pages/Audio/StartRecordingPage";

import { addUnmute, setActiveUnmuteIndex } from "./features/user/userSlice";
import { UNMUTE_PRODUCT_VARIANT_ID } from "./app/const";

function App() {
  const dispatch = useDispatch();
  const [_location, navigate] = useLocation();

  const appHeight = () => {
    const doc = document.documentElement;
    doc.style.setProperty('--app-height', `${window.innerHeight}px`);
  };

  function init() {
    window.addEventListener('resize', appHeight);
  }

  useEffect(init, []);
  useEffect(appHeight, []);

  useEffect(() => {
    fetchCartData().then(({ data }) => {
      dispatch(setActiveUnmuteIndex(0));

      if (data.items.length === 0) {
        navigate("/");
      } else {
        data.items
          .filter(
            (cartItem) => cartItem.variant_id === UNMUTE_PRODUCT_VARIANT_ID
          )
          .forEach((unmute) => {
            dispatch(addUnmute(unmute));
          });
      }
    });
  }, [dispatch]);

  const location = useLocation();
  const specialRoutesRegex = /\/(orientation|frame|passepartout|crop)/;

  // Check if the current path matches any of the special routes
  const isSpecialRoute = specialRoutesRegex.test(location.pathname);

  return (
    <div className={`app-wrapper ${isSpecialRoute ? 'with-navigation' : ''}`}>
      <progress id="progress-bar"></progress>

      <Switch>
        <Route
          path={/\/(orientation|frame|passepartout|crop)/}
          component={Frame}
        />
      </Switch>

      <Switch>
        {/* Starting page */}
        {/*<Route path="/" component={StartPage}></Route>*/}
        <Route path="/" component={OffersPage} />
        <Route path="/inspirations" component={InspirationsPage} />
        <Route path="/inspiration-video" component={InspirationsVideoPage} />
        <Route path="/upload-image" component={UploadImagePage} />

        <Route path="/audio" component={AudioPage} />
        <Route path="/start-recording" component={StartRecordingPage} />
        <Route path="/inspiration" component={InspirationPage} />
        <Route path="/edit-audio" component={EditAudioPage} />

        {/* UnmuteBottomNavigation */}
        <Route path="/orientation" component={OrientationPage} />
        <Route path="/frame" component={FramePage} />
        <Route path="/passepartout" component={PassepartoutPage} />
        <Route path="/crop" component={CropPage} />
        <Route path="/add">ADD</Route>
      </Switch>

      <Switch>
        <Route
          path={/\/(orientation|frame|passepartout|crop)/}
          component={UnmuteBottomNavigation}
        />
      </Switch>
    </div>
  );
}

export default App;
