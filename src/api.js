import axios from "axios";

// Keep the bearer token out of localStorage, sessionStorage, and URLs.
// A page refresh intentionally starts a new signed-out session.
let accessToken = null;
export const setAccessToken = (token) => {
  accessToken = token;
};
export const api = axios.create({
  baseURL: import.meta.env?.VITE_API_URL || "/api",
  timeout: 15000,
});
const startupApi = axios.create({ baseURL: api.defaults.baseURL });
const temporaryStatuses = new Set([502, 503, 504]);

function throwIfCancelled(signal) {
  if (signal?.aborted)
    throw new axios.CanceledError("Authentication cancelled");
}
function abortablePause(ms, signal) {
  throwIfCancelled(signal);
  return new Promise((resolve, reject) => {
    const cancelled = () => {
      clearTimeout(timer);
      reject(new axios.CanceledError("Authentication cancelled"));
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", cancelled);
      resolve();
    }, ms);
    signal?.addEventListener("abort", cancelled, { once: true });
  });
}

// Readiness checks are safe to repeat. Never retry an account-creation POST:
// a lost response does not tell us whether the account was already created.
export async function waitForBackend({
  onWaiting = () => {},
  timeoutMs = 180000,
  signal,
  now = Date.now,
  pause = abortablePause,
  probe = (timeout, signal) => startupApi.get("/health", { timeout, signal }),
} = {}) {
  const deadline = now() + timeoutMs;
  throwIfCancelled(signal);
  onWaiting("Connecting to Placewise…");
  while (now() < deadline) {
    throwIfCancelled(signal);
    try {
      const response = await probe(Math.min(10000, deadline - now()), signal);
      throwIfCancelled(signal);
      if (response.status === 200 && response.data?.status === "UP") {
        onWaiting("");
        return;
      }
      // Render can return an HTML loading page instead of the API response.
      if (response.status !== 200 && !temporaryStatuses.has(response.status))
        throw Object.assign(new Error("Readiness check failed"), { response });
    } catch (error) {
      if (axios.isCancel(error) || signal?.aborted) throw error;
      if (error.response && !temporaryStatuses.has(error.response.status))
        throw error;
    }
    onWaiting(
      "The server is starting. The first connection can take a few minutes…",
    );
    const remaining = deadline - now();
    if (remaining > 0) await pause(Math.min(3000, remaining), signal);
  }
  throw Object.assign(new Error("Backend did not become ready"), {
    code: "BACKEND_STARTUP_TIMEOUT",
  });
}

export async function authenticateRequest(path, values, options) {
  await waitForBackend(options);
  throwIfCancelled(options?.signal);
  return api.post(path, values, { timeout: 60000, signal: options?.signal });
}

api.interceptors.request.use((config) => {
  if (accessToken && !config.url?.startsWith("/auth/"))
    config.headers.Authorization = `Bearer ${accessToken}`;
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
  if (error.code === "BACKEND_STARTUP_TIMEOUT")
    return "The server is still starting or is unavailable. No sign-in or registration was submitted. Please try again shortly.";
  if (
    error.config?.url === "/auth/register" &&
    (!error.response || error.response.status >= 500)
  )
    return "We couldn't confirm whether your account was created. Try signing in before creating it again.";
  if (["ECONNABORTED", "ETIMEDOUT"].includes(error.code))
    return "The server took too long to respond. If you were creating an account, try signing in before submitting it again.";
  if (!error.response)
    return "Cannot reach Placewise. Please check that the backend is running and try again.";
  const data =
    error.response.data && typeof error.response.data === "object"
      ? error.response.data
      : {};
  const fields = Object.entries(
    data.errors && typeof data.errors === "object" ? data.errors : {},
  ).map(
    ([field, message]) => `${field.replace(/([A-Z])/g, " $1")}: ${message}`,
  );
  if (fields.length) return fields.join(" · ");
  if (typeof data.message === "string" && data.message) return data.message;
  if (error.response.status >= 500)
    return `The server is temporarily unavailable (HTTP ${error.response.status}). Please try again shortly.`;
  return `The request failed (HTTP ${error.response.status}). Please try again.`;
}
