import axios from "axios";
import { getToken } from "../auth";

const movieApi = axios.create({
  baseURL: "http://localhost:3002/api", // ⚠️ movie-service backend
});

movieApi.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default movieApi;
