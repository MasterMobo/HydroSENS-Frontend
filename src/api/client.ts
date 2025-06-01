import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_API_URL || "http://localhost:5050",
  withCredentials: false, // set true if we need cookies
  timeout: 0,
});
api.interceptors.request.use((cfg) => {
  console.log("➡️ Request:", cfg.method?.toUpperCase(), cfg.baseURL + cfg.url);
  return cfg;
});
