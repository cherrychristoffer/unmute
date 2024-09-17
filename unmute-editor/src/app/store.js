import { configureStore } from "@reduxjs/toolkit";

import userReducer from "../features/user/userSlice";
import imageSlice from "../features/image/imageSlice";
import inspirationSlice from "../features/inspiration/inspirationSlice";

export default configureStore({
  reducer: {
    user: userReducer,
    image: imageSlice,
    inspiration: inspirationSlice,
  },
});
