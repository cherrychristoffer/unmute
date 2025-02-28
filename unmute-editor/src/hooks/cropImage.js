export const getCroppedImg = (imageSrc, crop) => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  const image = new Image()
  image.crossOrigin = 'anonymous'
  image.src = imageSrc

  return new Promise((resolve, reject) => {
    image.onload = () => {
      // Set canvas size to match the crop dimensions
      canvas.width = crop.width
      canvas.height = crop.height

      // Ensure the crop coordinates and dimensions are accurate
      const { x, y, width, height } = crop

      // Draw the cropped image onto the canvas
      ctx.drawImage(
        image,
        x, // Start x coordinate from crop
        y, // Start y coordinate from crop
        width, // Width of the crop area on the image
        height, // Height of the crop area on the image
        0, // Place at x=0 on the canvas
        0, // Place at y=0 on the canvas
        canvas.width, // Scale to canvas width
        canvas.height // Scale to canvas height
      )

      // Convert the canvas to a blob and resolve
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Canvas is empty'))
        }
      }, 'image/png')
    }

    image.onerror = () => {
      reject(new Error('Failed to load image'))
    }
  })
}
