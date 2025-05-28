import axios from "axios";
import { getToken } from "../auth";

const recommendationApi = axios.create({
  baseURL: "http://localhost:3005/api/recommendations",
});

recommendationApi.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default recommendationApi;
