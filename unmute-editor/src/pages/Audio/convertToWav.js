// Convert any audio Blob (mp4, mp3, etc.) to audio/wav Blob
export async function convertToWav(audioBlob) {
  // Step 1: Convert Blob to ArrayBuffer
  const arrayBuffer = await audioBlob.arrayBuffer()

  // Step 2: Decode the audio data (any audio format)
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

  // Step 3: Convert audioBuffer to WAV format
  const wavBuffer = audioBufferToWav(audioBuffer)
  const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' })

  return wavBlob
}

// Utility function to convert AudioBuffer to WAV
function audioBufferToWav(audioBuffer) {
  const numOfChannels = audioBuffer.numberOfChannels
  const sampleRate = audioBuffer.sampleRate
  const format = 1 // PCM
  const bitDepth = 16

  // Interleave channels data
  let interleaved = new Float32Array(audioBuffer.length * numOfChannels)
  for (let channel = 0; channel < numOfChannels; channel++) {
    const channelData = audioBuffer.getChannelData(channel)
    for (let i = 0; i < channelData.length; i++) {
      interleaved[i * numOfChannels + channel] = channelData[i]
    }
  }

  // Create WAV header and data
  const wavBuffer = new DataView(new ArrayBuffer(44 + interleaved.length * 2)) // WAV header + data size
  let offset = 0

  // Write WAV header
  writeString(wavBuffer, offset, 'RIFF')
  offset += 4
  wavBuffer.setUint32(offset, 36 + interleaved.length * 2, true)
  offset += 4 // Chunk size
  writeString(wavBuffer, offset, 'WAVE')
  offset += 4
  writeString(wavBuffer, offset, 'fmt ')
  offset += 4
  wavBuffer.setUint32(offset, 16, true)
  offset += 4 // Subchunk1 size (PCM)
  wavBuffer.setUint16(offset, format, true)
  offset += 2 // Audio format
  wavBuffer.setUint16(offset, numOfChannels, true)
  offset += 2 // Number of channels
  wavBuffer.setUint32(offset, sampleRate, true)
  offset += 4 // Sample rate
  wavBuffer.setUint32(offset, (sampleRate * numOfChannels * bitDepth) / 8, true)
  offset += 4 // Byte rate
  wavBuffer.setUint16(offset, (numOfChannels * bitDepth) / 8, true)
  offset += 2 // Block align
  wavBuffer.setUint16(offset, bitDepth, true)
  offset += 2 // Bits per sample
  writeString(wavBuffer, offset, 'data')
  offset += 4
  wavBuffer.setUint32(offset, interleaved.length * 2, true)
  offset += 4 // Data chunk size

  // Write interleaved PCM data
  for (let i = 0; i < interleaved.length; i++, offset += 2) {
    const sample = Math.max(-1, Math.min(1, interleaved[i])) // Clamping
    wavBuffer.setInt16(
      offset,
      sample < 0 ? sample * 0x8000 : sample * 0x7fff,
      true
    ) // 16-bit PCM
  }

  return wavBuffer.buffer
}

// Utility to write a string to the DataView
function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i))
  }
}

// // Example usage: works with mp4, mp3, ogg, etc.
// const audioBlob = new Blob(
//   [
//     /* any audio data */
//   ],
//   { type: "audio/*" }
// );
// convertToWav(audioBlob).then((wavBlob) => {
//   // Use the wavBlob
//   const url = URL.createObjectURL(wavBlob);
//   const audio = new Audio(url);
//   audio.play();

//   // Download the WAV file
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = "converted.wav";
//   a.click();
// });
