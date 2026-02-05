import { configureStore } from '@reduxjs/toolkit'

import userReducer from '../features/user/userSlice'
import imageSlice from '../features/image/imageSlice'
import inspirationSlice from '../features/inspiration/inspirationSlice'
import replaceSlice from '../features/replace/replaceSlice'

export default configureStore({
  reducer: {
    user: userReducer,
    image: imageSlice,
    inspiration: inspirationSlice,
    replace: replaceSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})
