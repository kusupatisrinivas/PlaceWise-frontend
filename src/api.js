import axios from "axios";

// Keep the bearer token out of localStorage, sessionStorage, and URLs.
// A page refresh intentionally starts a new signed-out session.
let accessToken = null;
export const setAccessToken = (token) => {
  accessToken = token;
};
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 15000,
});
api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config?.url?.startsWith("/auth/")
    ) {
      accessToken = null;
      window.dispatchEvent(new Event("session-expired"));
    }
    return Promise.reject(error);
  },
);
export function errorMessage(error) {
  if (!error.response)
    return "Cannot reach Placewise. Please check that the backend is running and try again.";
  const data = error.response.data;
  const fields = Object.entries(data.errors || {}).map(
    ([field, message]) => `${field.replace(/([A-Z])/g, " $1")}: ${message}`,
  );
  return fields.length
    ? fields.join(" · ")
    : data.message || "Something went wrong. Please try again.";
}
