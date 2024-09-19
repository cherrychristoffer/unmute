import axios from "axios";
import { BASE_API_URL } from "../app/const";

export const getInspirations = async () => {
  const res = await axios.get(`${BASE_API_URL}/inspirations`);
  return res.data.data;
};

export const mergeAudio = async (audioKeys) => {
  const res = await axios.post(`${BASE_API_URL}/merge`, { audioKeys });
  return res.data.data;
};
