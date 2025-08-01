import axios from "axios";
import { getToken } from "../auth";

const movieApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api",
});

movieApi.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default movieApi;
