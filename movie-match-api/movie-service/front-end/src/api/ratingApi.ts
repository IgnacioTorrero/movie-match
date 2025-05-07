import axios from "axios";
import { getToken } from "../auth";

const ratingApi = axios.create({
  baseURL: "http://localhost:3003/api/ratings", // ⚠️ rating-service backend
});

ratingApi.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default ratingApi;
