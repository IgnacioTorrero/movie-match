import axios from "axios";
import { getToken } from "../auth";

const ratingApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api/ratings",
});

ratingApi.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default ratingApi;
