import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { api, setAccessToken, errorMessage } from "./api";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

const AuthContext = createContext(null);
const ToastContext = createContext(null);
const SavedContext = createContext(null);
export const useSavedDrives = () => useContext(SavedContext);
export const useAuth = () => useContext(AuthContext);
export const useToast = () => useContext(ToastContext);

export function Providers({ children }) {
  const [user, setUser] = useState(null);
  const [toasts, setToasts] = useState([]);
  const notify = useCallback((message, kind = "success") => {
    const id = crypto.randomUUID();
    setToasts((old) => [...old.slice(-3), { id, message, kind }]);
    setTimeout(() => setToasts((old) => old.filter((t) => t.id !== id)), 6000);
  }, []);
  const logout = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);
  useEffect(() => {
    const expired = () => {
      logout();
      notify("Your session has expired. Please sign in again.", "error");
    };
    window.addEventListener("session-expired", expired);
    return () => window.removeEventListener("session-expired", expired);
  }, [logout, notify]);
  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(
      () => {
        logout();
        notify("Your session has expired. Please sign in again.", "error");
      },
      Math.max(0, new Date(user.expiresAt).getTime() - Date.now()),
    );
    return () => clearTimeout(timer);
  }, [user, logout, notify]);
  async function authenticate(path, values) {
    const { data } = await api.post(path, values);
    setAccessToken(data.token);
    const { token, ...profile } = data;
    setUser(profile);
    return profile;
  }
  return (
    <AuthContext.Provider
      value={{
        user,
        logout,
        authenticate,
        updateName: (fullName) => setUser((u) => ({ ...u, fullName })),
      }}
    >
      <ToastContext.Provider value={notify}>
        <SavedDrivesProvider key={user?.email || "guest"} email={user?.email}>
          {children}
        </SavedDrivesProvider>
        <div className="toasts" aria-live="polite">
          {toasts.map((toast) => (
            <div key={toast.id} className={`toast ${toast.kind}`}>
              {toast.kind === "error" ? (
                <AlertCircle size={20} />
              ) : (
                <CheckCircle2 size={20} />
              )}
              <span>{toast.message}</span>
              <button
                aria-label="Dismiss notification"
                onClick={() =>
                  setToasts((old) => old.filter((t) => t.id !== toast.id))
                }
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      </ToastContext.Provider>
    </AuthContext.Provider>
  );
}

export function useApi(path) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    api
      .get(path, { signal: controller.signal })
      .then((r) => setData(r.data))
      .catch((e) => {
        if (e.code !== "ERR_CANCELED") setError(errorMessage(e));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [path, version]);
  return { data, loading, error, reload: () => setVersion((v) => v + 1) };
}
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function SavedDrivesProvider({ email, children }) {
  const key = "placewise:saved:" + (email || "guest");
  const notify = useToast();
  const [saved, setSaved] = useState(() => {
    try {
      const ids = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(ids)
        ? [...new Set(ids.filter(Number.isSafeInteger))]
        : [];
    } catch {
      return [];
    }
  });
  function toggle(id) {
    const next = saved.includes(id)
      ? saved.filter((value) => value !== id)
      : [...saved, id];
    setSaved(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      notify(
        "Saved for this session. Browser storage is unavailable.",
        "error",
      );
    }
  }
  return (
    <SavedContext.Provider value={{ saved, toggle }}>
      {children}
    </SavedContext.Provider>
  );
}
