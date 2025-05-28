import axios from "axios";
import { getToken } from "../auth";

const movieApi = axios.create({
  baseURL: "http://localhost:3005/api",
});

movieApi.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default movieApi;
