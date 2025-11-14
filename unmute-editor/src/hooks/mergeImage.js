import { getFileUrl, uploadFile } from '../api/spaces'

const gap = 10

// Function to calculate cropping values for object-fit: cover
const getCoverCrop = (image, targetWidth, targetHeight) => {
  const imgAspect = image.width / image.height
  const targetAspect = targetWidth / targetHeight

  let sx, sy, sWidth, sHeight

  if (imgAspect > targetAspect) {
    // Image is wider than the target area
    sHeight = image.height
    sWidth = sHeight * targetAspect
    sx = (image.width - sWidth) / 2
    sy = 0
  } else {
    // Image is taller than the target area
    sWidth = image.width
    sHeight = sWidth / targetAspect
    sx = 0
    sy = (image.height - sHeight) / 2
  }

  return { sx, sy, sWidth, sHeight }
}

const mergeImages = async (
  path,
  imgSources,
  orientation,
  collage_type,
  _passepartout = 'none'
) => {
  const canvas = document.createElement('canvas') // Create a hidden canvas
  const ctx = canvas.getContext('2d')

  const passepartout = _passepartout == 'none' ? 0 : _passepartout
  const dpc = 105
  const isCollage = !!collage_type

  // Load images
  const images = await Promise.all(imgSources.map(loadImage))

  if (orientation == 'portrait') {
    // Set canvas dimensions for portrait
    canvas.width = dpc * 30
    canvas.height = dpc * 40
  } else {
    // Set canvas dimensions for landscape
    canvas.width = dpc * 40
    canvas.height = dpc * 30
  }

  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const borderWidth = passepartout * dpc
  const width = canvas.width - borderWidth * 2
  const height = canvas.height - borderWidth * 2

  // Border settings
  ctx.lineWidth = borderWidth
  ctx.strokeStyle = 'white'
  ctx.strokeRect(
    borderWidth / 2,
    borderWidth / 2,
    canvas.width - borderWidth,
    canvas.height - borderWidth
  )

  const cssGrids = {
    portrait: {
      collage_1_1: [
        {
          x: 0 + borderWidth,
          y: 0 + borderWidth,
          width: width,
          height: height / 2 - gap,
        },
        {
          x: 0 + borderWidth,
          y: height / 2 + borderWidth + gap,
          width: width,
          height: height / 2 - gap,
        },
      ],
      collage_1_2: [
        {
          x: 0 + borderWidth,
          y: 0 + borderWidth,
          width: width,
          height: height / 2 - gap,
        },
        {
          x: 0 + borderWidth,
          y: height / 2 + borderWidth + gap,
          width: width / 2 - gap,
          height: height / 2 - gap,
        },
        {
          x: width / 2 + borderWidth + gap,
          y: height / 2 + borderWidth + gap,
          width: width / 2 - gap,
          height: height / 2 - gap,
        },
      ],
      collage_2_2: [
        {
          x: 0 + borderWidth,
          y: 0 + borderWidth,
          width: width / 2 - gap,
          height: height / 2 - gap,
        },
        {
          x: width / 2 + borderWidth + gap,
          y: 0 + borderWidth,
          width: width / 2 - gap,
          height: height / 2 - gap,
        },
        {
          x: 0 + borderWidth,
          y: height / 2 + borderWidth + gap,
          width: width / 2 - gap,
          height: height / 2 - gap,
        },
        {
          x: width / 2 + borderWidth + gap,
          y: height / 2 + borderWidth + gap,
          width: width / 2 - gap,
          height: height / 2 - gap,
        },
      ],
      collage_2_1_2: [
        {
          x: 0 + borderWidth,
          y: 0 + borderWidth,
          width: width / 2 - gap,
          height: height / 3 - gap,
        },
        {
          x: width / 2 + borderWidth + gap,
          y: 0 + borderWidth,
          width: width / 2 - gap,
          height: height / 3 - gap,
        },
        {
          x: 0 + borderWidth,
          y: height / 3 + borderWidth + gap,
          width: width,
          height: height / 3 - gap * 2,
        },
        {
          x: 0 + borderWidth,
          y: (height * 2) / 3 + borderWidth + gap,
          width: width / 2 - gap,
          height: height / 3 - gap,
        },
        {
          x: width / 2 + borderWidth + gap,
          y: (height * 2) / 3 + borderWidth + gap,
          width: width / 2 - gap,
          height: height / 3 - gap,
        },
      ],
      collage_1_2_2: [
        {
          x: 0 + borderWidth,
          y: 0 + borderWidth,
          width: width,
          height: height / 3 - gap,
        },
        {
          x: 0 + borderWidth,
          y: height / 3 + borderWidth + gap,
          width: width / 2 - gap,
          height: height / 3 - gap * 2,
        },
        {
          x: width / 2 + borderWidth + gap,
          y: height / 3 + borderWidth + gap,
          width: width / 2 - gap,
          height: height / 3 - gap * 2,
        },
        {
          x: 0 + borderWidth,
          y: (height * 2) / 3 + borderWidth + gap,
          width: width / 2 - gap,
          height: height / 3 - gap,
        },
        {
          x: width / 2 + borderWidth + gap,
          y: (height * 2) / 3 + borderWidth + gap,
          width: width / 2 - gap,
          height: height / 3 - gap,
        },
      ],
      collage_2_2_2: [
        {
          x: 0 + borderWidth,
          y: 0 + borderWidth,
          width: width / 2 - gap,
          height: height / 3 - gap,
        },
        {
          x: width / 2 + borderWidth + gap,
          y: 0 + borderWidth,
          width: width / 2 - gap,
          height: height / 3 - gap,
        },
        {
          x: 0 + borderWidth,
          y: height / 3 + borderWidth + gap,
          width: width / 2 - gap,
          height: height / 3 - gap * 2,
        },
        {
          x: width / 2 + borderWidth + gap,
          y: height / 3 + borderWidth + gap,
          width: width / 2 - gap,
          height: height / 3 - gap * 2,
        },
        {
          x: 0 + borderWidth,
          y: (height * 2) / 3 + borderWidth + gap,
          width: width / 2 - gap,
          height: height / 3 - gap,
        },
        {
          x: width / 2 + borderWidth + gap,
          y: (height * 2) / 3 + borderWidth + gap,
          width: width / 2 - gap,
          height: height / 3 - gap,
        },
      ],
      collage_4_2_1_2_4: [
        {
          x: 0 + borderWidth,
          y: 0 + borderWidth,
          width: width / 4 - gap,
          height: height / 4 - gap,
        },
        {
          x: width / 4 + borderWidth + gap,
          y: 0 + borderWidth,
          width: width / 4 - gap * 2,
          height: height / 4 - gap,
        },
        {
          x: width / 2 + borderWidth + gap,
          y: 0 + borderWidth,
          width: width / 4 - gap * 2,
          height: height / 4 - gap,
        },
        {
          x: (width * 3) / 4 + borderWidth + gap,
          y: 0 + borderWidth,
          width: width / 4 - gap,
          height: height / 4 - gap,
        },
        {
          x: 0 + borderWidth,
          y: height / 4 + borderWidth + gap,
          width: width / 4 - gap,
          height: height / 4 - gap * 2,
        },
        {
          x: width / 4 + borderWidth + gap,
          y: height / 4 + borderWidth + gap,
          width: width / 2 - gap * 2,
          height: height / 2 - gap * 2,
        },
        {
          x: (width * 3) / 4 + borderWidth + gap,
          y: height / 4 + borderWidth + gap,
          width: width / 4 - gap,
          height: height / 4 - gap * 2,
        },
        {
          x: 0 + borderWidth,
          y: height / 2 + borderWidth + gap,
          width: width / 4 - gap,
          height: height / 4 - gap * 2,
        },
        {
          x: (width * 3) / 4 + borderWidth + gap,
          y: height / 2 + borderWidth + gap,
          width: width / 4 - gap,
          height: height / 4 - gap * 2,
        },
        {
          x: 0 + borderWidth,
          y: (height * 3) / 4 + borderWidth + gap,
          width: width / 4 - gap,
          height: height / 4 - gap,
        },
        {
          x: width / 4 + borderWidth + gap,
          y: (height * 3) / 4 + borderWidth + gap,
          width: width / 4 - gap * 2,
          height: height / 4 - gap,
        },
        {
          x: width / 2 + borderWidth + gap,
          y: (height * 3) / 4 + borderWidth + gap,
          width: width / 4 - gap * 2,
          height: height / 4 - gap,
        },
        {
          x: (width * 3) / 4 + borderWidth + gap,
          y: (height * 3) / 4 + borderWidth + gap,
          width: width / 4 - gap,
          height: height / 4 - gap,
        },
      ],
      collage_2_2_1: [
        {
          x: 0 + borderWidth,
          y: 0 + borderWidth,
          width: width / 2 - gap,
          height: height / 3 - gap,
        },
        {
          x: 0 + borderWidth,
          y: height / 3 + borderWidth + gap,
          width: width / 2 - gap,
          height: height / 3 - gap * 2,
        },
        {
          x: 0 + borderWidth,
          y: (height * 2) / 3 + borderWidth + gap,
          width: width / 2 - gap,
          height: height / 3 - gap,
        },
        {
          x: width / 2 + borderWidth + gap,
          y: 0 + borderWidth,
          width: width / 2 - gap,
          height: height / 2 - gap,
        },
        {
          x: width / 2 + borderWidth + gap,
          y: height / 2 + borderWidth + gap,
          width: width / 2 - gap,
          height: height / 2 - gap,
        },
      ],
    },
    landscape: {
      collage_1_1: [
        {
          x: 0 + borderWidth,
          y: 0 + borderWidth,
          width: width / 2 - gap,
          height: height,
        },
        {
          x: width / 2 + borderWidth + gap,
          y: 0 + borderWidth,
          width: width / 2 - gap,
          height: height,
        },
      ],
      collage_1_2: [
        {
          x: 0 + borderWidth,
          y: 0 + borderWidth,
          width: width / 2 - gap,
          height: height / 2 - gap,
        },
        {
          x: width / 2 + borderWidth + gap,
          y: 0 + borderWidth,
          width: width / 2 - gap,
          height: height,
        },
        {
          x: 0 + borderWidth,
          y: height / 2 + borderWidth + gap,
          width: width / 2 - gap,
          height: height / 2 - gap,
        },
      ],
      collage_2_2: [
        {
          x: 0 + borderWidth,
          y: 0 + borderWidth,
          width: width / 2 - gap,
          height: height / 2 - gap,
        },
        {
          x: width / 2 + borderWidth + gap,
          y: 0 + borderWidth,
          width: width / 2 - gap,
          height: height / 2 - gap,
        },
        {
          x: 0 + borderWidth,
          y: height / 2 + borderWidth + gap,
          width: width / 2 - gap,
          height: height / 2 - gap,
        },
        {
          x: width / 2 + borderWidth + gap,
          y: height / 2 + borderWidth + gap,
          width: width / 2 - gap,
          height: height / 2 - gap,
        },
      ],
      collage_2_1_2: [
        {
          x: 0 + borderWidth,
          y: 0 + borderWidth,
          width: width / 3 - gap,
          height: height / 2 - gap,
        },
        {
          x: width / 3 + borderWidth + gap,
          y: 0 + borderWidth,
          width: width / 3 - gap * 2,
          height: height,
        },
        {
          x: (width * 2) / 3 + borderWidth + gap,
          y: 0 + borderWidth,
          width: width / 3 - gap,
          height: height / 2 - gap,
        },
        {
          x: 0 + borderWidth,
          y: height / 2 + borderWidth + gap,
          width: width / 3 - gap,
          height: height / 2 - gap,
        },
        {
          x: (width * 2) / 3 + borderWidth + gap,
          y: height / 2 + borderWidth + gap,
          width: width / 3 - gap,
          height: height / 2 - gap,
        },
      ],
      collage_1_2_2: [
        {
          x: 0 + borderWidth,
          y: 0 + borderWidth,
          width: width / 3 - gap,
          height: height / 2 - gap,
        },
        {
          x: width / 3 + borderWidth + gap,
          y: 0 + borderWidth,
          width: width / 3 - gap * 2,
          height: height / 2 - gap,
        },
        {
          x: (width * 2) / 3 + borderWidth + gap,
          y: 0 + borderWidth,
          width: width / 3 - gap,
          height: height,
        },
        {
          x: 0 + borderWidth,
          y: height / 2 + borderWidth + gap,
          width: width / 3 - gap,
          height: height / 2 - gap,
        },
        {
          x: width / 3 + borderWidth + gap,
          y: height / 2 + borderWidth + gap,
          width: width / 3 - gap * 2,
          height: height / 2 - gap,
        },
      ],
      collage_2_2_2: [
        {
          x: 0 + borderWidth,
          y: 0 + borderWidth,
          width: width / 3 - gap,
          height: height / 2 - gap,
        },
        {
          x: width / 3 + borderWidth + gap,
          y: 0 + borderWidth,
          width: width / 3 - gap * 2,
          height: height / 2 - gap,
        },
        {
          x: (width * 2) / 3 + borderWidth + gap,
          y: 0 + borderWidth,
          width: width / 3 - gap,
          height: height / 2 - gap,
        },
        {
          x: 0 + borderWidth,
          y: height / 2 + borderWidth + gap,
          width: width / 3 - gap,
          height: height / 2 - gap,
        },
        {
          x: width / 3 + borderWidth + gap,
          y: height / 2 + borderWidth + gap,
          width: width / 3 - gap * 2,
          height: height / 2 - gap,
        },
        {
          x: (width * 2) / 3 + borderWidth + gap,
          y: height / 2 + borderWidth + gap,
          width: width / 3 - gap,
          height: height / 2 - gap,
        },
      ],
      collage_4_2_1_2_4: [
        {
          x: 0 + borderWidth,
          y: 0 + borderWidth,
          width: width / 4 - gap,
          height: height / 4 - gap,
        },
        {
          x: width / 4 + borderWidth + gap,
          y: 0 + borderWidth,
          width: width / 4 - gap * 2,
          height: height / 4 - gap,
        },
        {
          x: width / 2 + borderWidth + gap,
          y: 0 + borderWidth,
          width: width / 4 - gap * 2,
          height: height / 4 - gap,
        },
        {
          x: (width * 3) / 4 + borderWidth + gap,
          y: 0 + borderWidth,
          width: width / 4 - gap,
          height: height / 4 - gap,
        },
        {
          x: 0 + borderWidth,
          y: height / 4 + borderWidth + gap,
          width: width / 4 - gap,
          height: height / 4 - gap * 2,
        },
        {
          x: width / 4 + borderWidth + gap,
          y: height / 4 + borderWidth + gap,
          width: width / 2 - gap * 2,
          height: height / 2 - gap * 2,
        },
        {
          x: (width * 3) / 4 + borderWidth + gap,
          y: height / 4 + borderWidth + gap,
          width: width / 4 - gap,
          height: height / 4 - gap * 2,
        },
        {
          x: 0 + borderWidth,
          y: height / 2 + borderWidth + gap,
          width: width / 4 - gap,
          height: height / 4 - gap * 2,
        },
        {
          x: (width * 3) / 4 + borderWidth + gap,
          y: height / 2 + borderWidth + gap,
          width: width / 4 - gap,
          height: height / 4 - gap * 2,
        },
        {
          x: 0 + borderWidth,
          y: (height * 3) / 4 + borderWidth + gap,
          width: width / 4 - gap,
          height: height / 4 - gap,
        },
        {
          x: width / 4 + borderWidth + gap,
          y: (height * 3) / 4 + borderWidth + gap,
          width: width / 4 - gap * 2,
          height: height / 4 - gap,
        },
        {
          x: width / 2 + borderWidth + gap,
          y: (height * 3) / 4 + borderWidth + gap,
          width: width / 4 - gap * 2,
          height: height / 4 - gap,
        },
        {
          x: (width * 3) / 4 + borderWidth + gap,
          y: (height * 3) / 4 + borderWidth + gap,
          width: width / 4 - gap,
          height: height / 4 - gap,
        },
      ],
      collage_2_2_1: [
        {
          x: 0 + borderWidth,
          y: 0 + borderWidth,
          width: width / 2 - gap,
          height: height / 2 - gap,
        },
        {
          x: 0 + borderWidth,
          y: height / 2 + borderWidth + gap,
          width: width / 2 - gap,
          height: height / 2 - gap,
        },
        {
          x: width / 2 + borderWidth + gap,
          y: 0 + borderWidth,
          width: width / 2 - gap,
          height: height / 3 - gap,
        },
        {
          x: width / 2 + borderWidth + gap,
          y: height / 3 + borderWidth + gap,
          width: width / 2 - gap,
          height: height / 3 - gap * 2,
        },
        {
          x: width / 2 + borderWidth + gap,
          y: (height * 2) / 3 + borderWidth + gap,
          width: width / 2 - gap,
          height: height / 3 - gap,
        },
      ],
    },
  }

  const simplePosition = [
    { x: 0 + borderWidth, y: 0 + borderWidth, width: width, height: height },
  ]

  // Define positions for images (modify structure if needed)
  const positions = isCollage
    ? cssGrids[orientation][collage_type]
    : simplePosition

  // Draw images onto the canvas
  images.forEach((image, index) => {
    const pos = positions[index]
    if (image) {
      const { sx, sy, sWidth, sHeight } = getCoverCrop(
        image,
        pos.width,
        pos.height
      )
      ctx.drawImage(
        image,
        sx,
        sy,
        sWidth,
        sHeight,
        pos.x,
        pos.y,
        pos.width,
        pos.height
      )
    }
  })

  // Convert canvas to Blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        reject(new Error('Failed to create blob from canvas'))
        return
      }

      try {
        const file = new File([blob], `${path}-final.png`, {
          type: 'image/png',
        })
        const fileKey = await uploadFile({ file, path })
        const imageUrl = getFileUrl(fileKey)
        console.log('Image uploaded successfully:', imageUrl)

        resolve(imageUrl)
      } catch (error) {
        console.error('Upload failed:', error)
        reject(error)
      }
    }, 'image/png')
  })
}

const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    if (!src) {
      resolve(null)
      return
    }
    const img = new Image()
    img.crossOrigin = 'Anonymous' // Handle CORS issues if fetching from external sources
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export { mergeImages }
