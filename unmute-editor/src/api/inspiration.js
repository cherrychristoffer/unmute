import axios from "axios";
import { BASE_API_URL } from "../app/const";

export const getInspirations = async () => {
    const res = await axios.get(`${BASE_API_URL}/inspirations`, {
        headers: {
            'ngrok-skip-browser-warning': true,
        }
    });
    return res.data.data;
};
