import axios from "axios";
import { v4 as uuidv4 } from "uuid";

import { UNMUTE_PRODUCT_VARIANT_ID, UNMUTE_ENHANCED_PRODUCT_VARIANT_ID } from "../app/const";

const cartUrl = `${window.Shopify.routes.root}cart`;

export const fetchCartData = async () => axios.get(`${cartUrl}.js`);

export const updateUnmuteInCart = async ({ key, properties }) => {
  const res = await axios.post(`${cartUrl}/change.js`, {
    id: key,
    properties,
  })

  if (window.theme?.cart?.rerenderCart) {
    window.theme.cart.rerenderCart()
  }

  return res
};

export const removeUnmuteInCart = async (key) => {
  const response = await axios.post(`${cartUrl}/change.js`, {
    id: key,
    quantity: 0,
    sections: "cart-icon-bubble",
  });

  document.querySelector("#cart-icon-bubble").innerHTML =
      response.data.sections["cart-icon-bubble"];


  if (window.theme?.cart?.rerenderCart) {
    window.theme.cart.rerenderCart()
  }

  return response
}

export const addUnmuteToCart = async ({
  quantity,
  extra = false,
  collage = false,
}) => {
  const items = [...Array(quantity)].map((_, index) => {
    // Apply uuid to each Unmute to make Shopify treat them as different products
    const uuid = uuidv4();

    return {
      id: UNMUTE_PRODUCT_VARIANT_ID,
      quantity: 1,
      properties: {
        _collage: collage,
        _extra: extra,
        _uuid: uuid,
        _images: [],
        _audios: [],
        _frame: "oak",
        _orientation: "portrait",
        _passepartout: "none",
        _inspiration: null,
        _countdown: "",
        _created: {
          date: new Date(),
          index: index,
        },
      },
    };
  });

  const response = await axios.post(`${cartUrl}/add.js`, {
    items,
    sections: "cart-icon-bubble",
  });

  const cartIconBubble = document.querySelector("#cart-icon-bubble");

  if (cartIconBubble) {
    cartIconBubble.innerHTML = response.data.sections["cart-icon-bubble"];
  }

  if (window.theme?.cart?.rerenderCart) {
    window.theme.cart.rerenderCart()
  }

  return response;
};

export const duplicateUnmuteToCart = async (unmute) => {
  const items = [
    {
      ...unmute,
      id: UNMUTE_ENHANCED_PRODUCT_VARIANT_ID,
    }
  ]

  const response = await axios.post(`${cartUrl}/add.js`, {
    items,
    sections: "cart-icon-bubble",
  });

  document.querySelector("#cart-icon-bubble").innerHTML =
      response.data.sections["cart-icon-bubble"];

  if (window.theme?.cart?.rerenderCart) {
    window.theme.cart.rerenderCart()
  }

  return response;
};



