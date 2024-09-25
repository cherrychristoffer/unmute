import { createSlice } from "@reduxjs/toolkit";

import { uniqBy } from "lodash";

/*
Example `unmute` state:

{
  "id": 41570861383754,
  "properties": {
    "_uuid": "ffab2e34-dd82-40b7-b59d-37ae54402f77"
  },
  "quantity": 1,
  "variant_id": 41570861383754,
  "key": "41570861383754:8a4c0c14bb6515044a51f5f7c52ff606",
  "title": "Unmute 2.0",
  "price": 39900,
  "original_price": 39900,
  "presentment_price": 399,
  "discounted_price": 39900,
  "line_price": 39900,
  "original_line_price": 39900,
  "total_discount": 0,
  "discounts": [],
  "sku": "",
  "grams": 0,
  "vendor": "Quickstart (f4af16d3)",
  "taxable": true,
  "product_id": 7780600774730,
  "product_has_only_default_variant": true,
  "gift_card": false,
  "final_price": 39900,
  "final_line_price": 39900,
  "url": "/products/unmute-2-0?variant=41570861383754",
  "featured_image": {
    "aspect_ratio": null,
    "alt": null,
    "height": null,
    "url": null,
    "width": null
  },
  "image": null,
  "handle": "unmute-2-0",
  "requires_shipping": true,
  "product_type": "",
  "product_title": "Unmute 2.0",
  "product_description": "",
  "variant_title": null,
  "variant_options": [
    "Default Title"
  ],
  "options_with_values": [
    {
    "name": "Title",
    "value": "Default Title"
    }
  ],
  "line_level_discount_allocations": [],
  "line_level_total_discount": 0,
  "quantity_rule": {
    "min": 1,
    "max": null,
    "increment": 1
  },
  "has_components": false
}
*/

export const userSlice = createSlice({
  name: "user",
  initialState: {
    unmutes: [],
    isLoadingUnmutes: true,
    activeUnmuteIndex: 0,
    audioBlob: [],
  },
  reducers: {
    setIsLoadingUnmutes: (state, action) => {
      state.isLoadingUnmutes = action.payload;
    },
    addUnmute: (state, action) => {
      const newUnmutes = uniqBy(
        [...state.unmutes, action.payload],
        "properties._uuid"
      );

      return {
        ...state,
        unmutes: newUnmutes,
      };
    },

    replaceUnmute: (state, action) => {
      state.unmutes[action.payload.index] = action.payload.unmute
    },

    updateAllUnmutes: (state, action) => {
      state.unmutes = action.payload;
    },

    deleteUnmute: (state, action) => {
      const filteredUnmutes = state.unmutes.filter(
        (unmute) => unmute.key !== action.payload
      );
      return {
        ...state,
        unmutes: filteredUnmutes,
      };
    },

    updateUnmute: (state, action) => {
      const unmutes = state.unmutes.map((unmute) => {
        if (unmute.properties._uuid !== action.payload.properties._uuid) {
          return unmute;
        }

        return {
          ...unmute,
          ...action.payload,
        };
      });

      return {
        ...state,
        unmutes,
      };
    },

    updateUnmutes: (state, action) => {
      return {
        ...state,
        unmutes: state.unmutes.map((item) => {
          const updatedUnmute = action.payload.find(
            (state) => state.properties._uuid === item.properties._uuid
          );
          if (updatedUnmute) {
            return updatedUnmute;
          }
          return item;
        }),
      };
    },

    setActiveUnmuteIndex: (state, action) => {
      return {
        ...state,
        activeUnmuteIndex: action.payload,
      };
    },
    setAudioBlob: (state, action) => {
      return {
        ...state,
        audioBlob: action.payload,
      };
    },
    addAudioUnmute: (state, action) => {
      return {
        ...state,
        unmutes: state.unmutes.map((item) => {
          const updatedUnmute = action.payload.find(
            (state) => state.properties._uuid === item.properties._uuid
          );

          if (updatedUnmute) {
            const dataUnmute = updateUnmute.properties.audios;
            return updatedUnmute;
          } else {
            return item;
          }
        }),
      };
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  addUnmute,
  updateAllUnmutes,
  deleteUnmute,
  updateUnmute,
  updateUnmutes,
  setRecording,
  setActiveUnmuteIndex,
  setAudioBlob,
  addAudioUnmute,
  setIsLoadingUnmutes,
  replaceUnmute,
} = userSlice.actions;

export default userSlice.reducer;
