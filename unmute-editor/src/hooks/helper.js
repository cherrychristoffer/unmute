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

function getIOSVersion() {
    const match = navigator.userAgent.match(/OS (\d+)_/);
    return match ? parseInt(match[1], 10) : null;
}

function isIphone13Plus() {
    const ua = navigator.userAgent;
    const isIphone = /iPhone/.test(ua) && !window.MSStream;
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;

    // iPhone 13 / 14 (390 x 844)
    const isIphone13_14 = screenWidth === 390 && screenHeight === 844;

    // iPhone 13 Pro Max / 14 Plus / 14 Pro Max (430 x 932)
    const isIphone13ProMax_14Plus = screenWidth === 430 && screenHeight === 932;

    return isIphone && (isIphone13_14 || isIphone13ProMax_14Plus);
}

function getFileNameWithoutExtension(imageUrl) {
    // Create a URL object
    const url = new URL(imageUrl);

    // Get the pathname (e.g., "/images/photo.jpg")
    const pathname = url.pathname;

    // Extract the file name using split and pop
    const fileNameWithExtension = pathname.split('/').pop();

    // Remove the file extension
    const fileName = fileNameWithExtension.split('.').slice(0, -1).join('.');

    return fileName;
}

function isHEICorHEIF(filename) {
    // Convert the filename to lowercase to handle case insensitivity
    const lowerCaseFilename = filename.toLowerCase();

    // Check if the filename ends with .heic or .heif
    return lowerCaseFilename.endsWith('.heic') || lowerCaseFilename.endsWith('.heif');
}

export { base64ToFile, getIOSVersion, isIphone13Plus, getFileNameWithoutExtension, isHEICorHEIF };
