import { React, useEffect } from 'react'
import { useDispatch } from 'react-redux'

import {
  fetchCartData,
  updateUnmuteInCart,
  removeUnmuteInCart,
} from './api/cart'

import { Route, Switch, useLocation } from 'wouter'
import { CollagePage } from './pages/CollagePage'

import { CropPage } from './pages/CropPage'
import { Frame } from './components/Frame'
import { UnmuteBottomNavigation } from './components/UnmuteBottomNavigation'
import { UploadAudioPage } from './pages/Audio/UploadAudioPage'

import { FramePage } from './pages/FramePage'
import { InspirationsVideoPage } from './pages/InspirationsVideoPage'
import { OffersPage } from './pages/OffersPage'
import { OrientationPage } from './pages/OrientationPage'
import { PassepartoutPage } from './pages/PassepartoutPage'
import { ReplacePage } from './pages/ReplacePage'
import { UploadImagePage } from './pages/UploadImagePage'

import { EditAudioPage } from './pages/Audio/EditAudioPage'
import { InspirationPage } from './pages/Audio/InspirationPage'
import { StartRecordingPage } from './pages/Audio/StartRecordingPage'
import { Loader } from './components/Loader'
import { delay } from './hooks/helper'

import {
  addUnmute,
  setIsLoadingUnmutes,
  updateUnmutes,
} from './features/user/userSlice'
import { shopifyCollageVariants, shopifyVariants } from './app/const'

import './assets/styles/global.css'

function App() {
  const dispatch = useDispatch()
  const [_location, navigate] = useLocation()

  const appHeight = () => {
    const doc = document.documentElement
    doc.style.setProperty('--app-height', `${window.innerHeight}px`)
  }

  function init() {
    window.addEventListener('resize', appHeight)
  }

  useEffect(init, [])
  useEffect(appHeight, [])

  useEffect(() => {
    dispatch(setIsLoadingUnmutes(true))
    fetchCartData().then(({ data }) => {
      if (data.items.length === 0) {
        navigate('/')
      } else {
        data.items
          .filter(
            (cartItem) =>
              shopifyVariants.some(
                (variant) => variant.id === cartItem.variant_id
              ) ||
              shopifyCollageVariants.some(
                (variant) => variant.id === cartItem.variant_id
              )
          )
          .forEach((unmute) => {
            dispatch(addUnmute(unmute))
          })
      }
      dispatch(setIsLoadingUnmutes(false))
    })
  }, [dispatch])

  const updateItemsWithCart = async () => {
    return fetchCartData().then(({ data }) => {
      const savedCart = localStorage.getItem('cart')
      let unmutes = []
      if (savedCart) {
        unmutes = JSON.parse(savedCart)
      }

      // Compare the cart items with the previous state and get the removed items
      let removedItems = []
      if (unmutes.length > 0) {
        // if a product is in unmutes but not in the data.items, it means it's removed
        removedItems = unmutes.filter(
          (unmute) =>
            !data.items.some(
              (cartItem) =>
                cartItem.properties._uuid === unmute.properties._uuid &&
                cartItem.id === unmute.id
            )
        )
      }

      if (data.items.length > 0) {
        const newItems = data.items.map((unmute) => {
          for (let i = 0; i < removedItems.length; i++) {
            if (
              unmute.properties._uuid === removedItems[i].properties._uuid &&
              removedItems[i].properties._enhanced
            ) {
              const properties = { ...unmute.properties }
              properties._images = [unmute.properties._touched_images[0]]
              delete properties._touched_images

              updateUnmuteInCart({
                key: unmute.key,
                properties: properties,
              })

              return {
                ...unmute,
                properties: properties,
              }
            } else if (
              unmute.properties._uuid === removedItems[i].properties._uuid &&
              !removedItems[i].properties._enhanced
            ) {
              // Remove the unmute from the cart
              removeUnmuteInCart(removedItems[i].properties._uuid, true)
            }
          }

          return unmute
        })

        newItems.sort((a, b) => a.key - b.key)

        const filteredItems = newItems.filter(
          (cartItem) =>
            shopifyVariants.some(
              (variant) => variant.id === cartItem.variant_id
            ) ||
            shopifyCollageVariants.some(
              (variant) => variant.id === cartItem.variant_id
            )
        )

        // sort unmutes by object key
        unmutes.sort((a, b) => a.key - b.key)

        if (JSON.stringify(unmutes) !== JSON.stringify(newItems)) {
          dispatch(updateUnmutes(filteredItems))
        }
      }

      // Save cart items to localstorage and compare it every time
      localStorage.setItem('cart', JSON.stringify(data.items))
    })
  }

  useEffect(() => {
    let isMounted = true // To handle component unmounting

    const updateLoop = async () => {
      while (isMounted) {
        await updateItemsWithCart() // Wait for function completion
        await delay(1000) // Delay for 1s
      }
    }

    updateLoop() // Start the loop

    return () => {
      isMounted = false // Stop loop when component unmounts
    }
  }, [dispatch])

  const location = useLocation()
  const specialRoutesRegex = /\/(orientation|frame|passepartout|crop)/

  // Check if the current path matches any of the special routes
  const isSpecialRoute = specialRoutesRegex.test(location.pathname)

  return (
    <div
      className={`app-wrapper ${isSpecialRoute ? 'with-navigation' : ''} pt-[10px] sm:pt-[30px] pb-[110px] sm:pb-[130px]`}
    >
      {/* <progress id="progress-bar"></progress> */}
      <div className="flex flex-col items-center justify-center h-20">
        <div id="globalprogress">
          <Loader size="w-16 h-16" wrapper_size="w-20 h-20" />
        </div>
      </div>

      <Switch>
        <Route
          path={/\/(orientation|frame|passepartout|crop|replace)/}
          component={Frame}
        />
      </Switch>

      <Switch>
        {/* Starting page */}
        {/*<Route path="/" component={StartPage}></Route>*/}
        <Route name="home" path="/" component={OffersPage} />
        {/*<Route*/}
        {/*  path="/inspirations"*/}
        {/*  component={InspirationsPage}*/}
        {/*/>*/}
        <Route
          path="/inspiration-video/:id"
          component={InspirationsVideoPage}
        />
        <Route path="/upload-image" component={UploadImagePage} />
        <Route path="/collage" component={CollagePage} />

        {/*<Route*/}
        {/*  path="/audio/:id"*/}
        {/*  component={AudioPage}*/}
        {/*/>*/}
        {/*<Route*/}
        {/*  path="/audio-approach"*/}
        {/*  component={AudioApproachPage}*/}
        {/*/>*/}
        <Route path="/audio-upload/:id" component={UploadAudioPage} />
        <Route path="/start-recording/:id" component={StartRecordingPage} />
        <Route path="/inspiration/:id" component={InspirationPage} />
        <Route path="/edit-audio/:id" component={EditAudioPage} />

        {/* UnmuteBottomNavigation */}
        <Route path="/orientation" component={OrientationPage} />
        <Route path="/frame" component={FramePage} />
        <Route path="/passepartout" component={PassepartoutPage} />
        <Route path="/crop" component={CropPage} />
        <Route path="/replace" component={ReplacePage} />
        <Route path="/add">ADD</Route>
      </Switch>

      <Switch>
        <Route
          path={/\/(orientation|frame|passepartout|crop|replace)/}
          component={UnmuteBottomNavigation}
        />
      </Switch>
    </div>
  )
}

export default App
