import axios from "axios";
import { BASE_API_URL } from "../app/const";

export const photosEnhance = async (key) => {
    const response = await axios.post(`${BASE_API_URL}/photos/enhance`, {
        key
    });
    const base64String = response.data.file
    return base64String
}