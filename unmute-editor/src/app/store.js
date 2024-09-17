import { configureStore } from "@reduxjs/toolkit";

import userReducer from "../features/user/userSlice";
import imageSlice from "../features/image/imageSlice";

export default configureStore({
  reducer: {
    user: userReducer,
    image: imageSlice,
  },
});
