import axios from "axios";
import { BASE_API_URL } from "../app/const";

export const convertVideoToAudio = async (videoKey) => {
        const response = await axios.post(`${BASE_API_URL}/video/convert_to_audio`, {
            videoKey
        }, {
            headers: { "Content-Type": "application/json" },
            responseType: 'blob',
        });

    return new File([response.data], "video-to-audio.mp3", {
        type: "audio/mp3",
    });

}