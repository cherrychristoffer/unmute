function base64ToFile(base64String, fileName) {
  const mimeType = base64String.match(/data:(.*?);base64,/)?.[1] // Extract MIME type
  const byteString = atob(base64String.split(',')[1]) // Decode Base64 string
  const arrayBuffer = new ArrayBuffer(byteString.length)
  const uint8Array = new Uint8Array(arrayBuffer)

  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i)
  }

  const blob = new Blob([uint8Array], { type: mimeType })
  return new File([blob], fileName, { type: mimeType })
}

function getFileNameWithoutExtension(imageUrl) {
  // Create a URL object
  const url = new URL(imageUrl)

  // Get the pathname (e.g., "/images/photo.jpg")
  const pathname = url.pathname

  // Extract the file name using split and pop
  const fileNameWithExtension = pathname.split('/').pop()

  // Remove the file extension
  const fileName = fileNameWithExtension.split('.').slice(0, -1).join('.')

  return fileName
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export { base64ToFile, getFileNameWithoutExtension, delay }
