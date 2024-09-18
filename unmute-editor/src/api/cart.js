import axios from "axios";
import { v4 as uuidv4 } from "uuid";

import { UNMUTE_PRODUCT_VARIANT_ID } from "../app/const";

const cartUrl = `${window.Shopify.routes.root}cart`;

export const fetchCartData = async () => axios.get(`${cartUrl}.js`);

export const updateUnmuteInCart = async ({ key, properties }) =>
  await axios.post(`${cartUrl}/change.js`, {
    id: key,
    properties,
  });

export const addUnmuteToCart = async ({ quantity }) => {
  const items = [...Array(quantity)].map(() => {
    // Apply uuid to each Unmute to make Shopify treat them as different products
    const uuid = uuidv4();

    return {
      id: UNMUTE_PRODUCT_VARIANT_ID,
      quantity: 1,
      properties: {
        _uuid: uuid,
        _images: [],
        _audios: [],
        _frame: "oak",
        _orientation: "portait",
        _passepartout: "small",
        _inspiration: null,
        _countdown: 0,
      },
    };
  });

  const response = await axios.post(`${cartUrl}/add.js`, {
    items,
    sections: "cart-icon-bubble",
  });

  document.querySelector("#cart-icon-bubble").innerHTML =
    response.data.sections["cart-icon-bubble"];

  return response;
};
