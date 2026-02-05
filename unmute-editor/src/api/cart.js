import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'

import {
  enhancedVariants,
  shopifyCollageVariants,
  shopifyVariants,
} from '../app/const'

const cartUrl = `${window.Shopify.routes.root}cart`

export const fetchCartData = async () => axios.get(`${cartUrl}.js`)

export const getKeyFromUUID = async (uuid, enhanced = false) => {
  const cartData = await fetchCartData()
  const cartItem = cartData.data.items.find(
    (item) =>
      item.properties._uuid === uuid &&
      ((item.properties._enhanced == enhanced && enhanced) ||
        (!item.properties._enhanced && !enhanced))
  )
  return cartItem ? cartItem.key : null
}

export const updateUnmuteInCart = async ({
  key,
  properties,
  enhanced = false,
}) => {
  let realKey = key

  const newKey = await getKeyFromUUID(properties._uuid)
  if (newKey) {
    realKey = newKey
  }

  let response

  const collage = properties._collage

  // check if properties._orientation and properties._passepartout are matches shopifyVariants
  let variant, enhancedVariant
  if (collage) {
    variant = shopifyCollageVariants.find((variant) => {
      return (
        variant.orientation === properties._orientation &&
        variant.passpartout === properties._passepartout
      )
    })
  } else {
    variant = shopifyVariants.find((variant) => {
      return (
        variant.orientation === properties._orientation &&
        variant.passpartout === properties._passepartout
      )
    })
  }

  if (enhanced) {
    enhancedVariant = enhancedVariants.find((variant) => {
      return (
        variant.orientation === properties._orientation &&
        variant.passpartout === properties._passepartout
      )
    })
  }

  if (variant.id !== Number(realKey.split(':')[0])) {
    // remove the item from the cart
    if (realKey) {
      await axios.post(`${cartUrl}/change.js`, {
        id: realKey,
        quantity: 0,
      })
    }

    const items = [
      {
        id: variant.id,
        quantity: 1,
        properties,
      },
    ]

    if (enhancedVariant) {
      items.push({
        id: enhancedVariant.id,
        quantity: 1,
        properties: { ...properties, _enhanced: true },
      })
    }

    // add the item with the correct variant
    response = await axios.post(`${cartUrl}/add.js`, {
      items: items,
    })
  } else {
    response = await axios.post(`${cartUrl}/change.js`, {
      id: realKey,
      properties,
    })

    if (enhancedVariant) {
      const items = [
        {
          id: enhancedVariant.id,
          quantity: 1,
          properties: { ...properties, _enhanced: true },
        },
      ]

      await axios.post(`${cartUrl}/add.js`, {
        items,
      })
    }
  }

  if (window.theme?.cart?.rerenderCart) {
    window.theme.cart.rerenderCart()
  } else {
    // demo dawn
    document.querySelector('cart-drawer-items').onCartUpdate()
  }

  return response
}

export const removeUnmuteInCart = async (uuid, enhanced = false) => {
  const key = await getKeyFromUUID(uuid, enhanced)
  const response = await axios.post(`${cartUrl}/change.js`, {
    id: key,
    quantity: 0,
    //sections: "cart-icon-bubble",
  })

  const cartIconBubble = document.querySelector('#cart-icon-bubble')

  if (response?.data?.sections?.['cart-icon-bubble'] && cartIconBubble) {
    cartIconBubble.innerHTML = response.data.sections['cart-icon-bubble']
  }

  if (window.theme?.cart?.rerenderCart) {
    window.theme.cart.rerenderCart()
  } else {
    // demo dawn
    document.querySelector('cart-drawer-items').onCartUpdate()
  }

  return response
}

export const addUnmuteToCart = async ({
  quantity,
  extra = false,
  collage = false,
  collageType = null,
  maxItems = 1,
}) => {
  const items = [...Array(quantity)].map((_, index) => {
    // Apply uuid to each Unmute to make Shopify treat them as different products
    const uuid = uuidv4()

    let properties = {
      _collage: collage,
      _extra: extra,
      _uuid: uuid,
      _images: [],
      _audios: [],
      _frame: 'oak',
      _orientation: 'portrait',
      _passepartout: 'none',
      _inspiration: null,
      _countdown: '',
      _created: {
        date: new Date(),
        index: index,
      },
    }

    if (collage) {
      properties = {
        ...properties,
        _collage_type: collageType,
        _collage_image_states: Array.from({ length: maxItems }, () => ({})),
        _collage_max_items: maxItems,
      }
    }

    return {
      id: collage ? shopifyCollageVariants[0].id : shopifyVariants[0].id,
      quantity: 1,
      properties,
    }
  })

  const response = await axios.post(`${cartUrl}/add.js`, {
    items,
    sections: 'cart-icon-bubble',
  })

  const cartIconBubble = document.querySelector('#cart-icon-bubble')

  if (response?.data?.sections?.['cart-icon-bubble'] && cartIconBubble) {
    cartIconBubble.innerHTML = response.data.sections['cart-icon-bubble']
  }

  if (window.theme?.cart?.rerenderCart) {
    window.theme.cart.rerenderCart()
  } else {
    // demo dawn
    document.querySelector('cart-drawer-items').onCartUpdate()
  }

  return response
}

export const duplicateUnmuteToCart = async (unmute) => {
  const items = [
    {
      ...unmute,
      id: UNMUTE_ENHANCED_PRODUCT_VARIANT_ID,
    },
  ]

  const response = await axios.post(`${cartUrl}/add.js`, {
    items,
    sections: 'cart-icon-bubble',
  })

  const cartIconBubble = document.querySelector('#cart-icon-bubble')

  if (response?.data?.sections?.['cart-icon-bubble'] && cartIconBubble) {
    cartIconBubble.innerHTML = response.data.sections['cart-icon-bubble']
  }

  if (window.theme?.cart?.rerenderCart) {
    window.theme.cart.rerenderCart()
  } else {
    // demo dawn
    document.querySelector('cart-drawer-items').onCartUpdate()
  }

  return response
}
