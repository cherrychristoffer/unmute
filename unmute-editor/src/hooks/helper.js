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

export { base64ToFile, getIOSVersion, isIphone13Plus };