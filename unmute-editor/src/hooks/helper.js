function base64ToFile(base64String, fileName) {
    const mimeType = base64String.match(/data:(.*?);base64,/)?.[1]; // Extract MIME type
    const byteString = atob(base64String.split(',')[1]); // Decode Base64 string
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([uint8Array], { type: mimeType });
    return new File([blob], fileName, { type: mimeType });
}

export { base64ToFile };