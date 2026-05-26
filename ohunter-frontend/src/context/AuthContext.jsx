import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "ohunter.auth";
const emptyAuth = {
  token: "",
  userId: null,
  role: "",
  fullName: "",
  email: "",
};

export const AuthContext = createContext(null);

function readStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyAuth;

    const parsed = JSON.parse(raw);
    return {
      token: parsed.token || "",
      userId: parsed.userId ?? null,
      role: parsed.role || "",
      fullName: parsed.fullName || parsed.username || "",
      email: parsed.email || "",
    };
  } catch {
    return emptyAuth;
  }
}

function saveAuth(auth) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStoredAuth);

  useEffect(() => {
    saveAuth(auth);
  }, [auth]);

  const value = useMemo(() => {
    const isAuthenticated = Boolean(auth.token);
    const isEmployer = auth.role === "EMPLOYER";
    const isJobseeker = auth.role === "STUDENT_FRESHER" || auth.role === "STUDENT_EXPERIENCED";

    return {
      token: auth.token,
      userId: auth.userId,
      role: auth.role,
      fullName: auth.fullName,
      email: auth.email,
      user: {
        id: auth.userId,
        role: auth.role,
        fullName: auth.fullName,
        email: auth.email,
      },
      isAuthenticated,
      isEmployer,
      isJobseeker,
      login(data) {
        const nextAuth = {
          token: data.token || "",
          userId: data.userId ?? null,
          role: data.role || "",
          fullName: data.fullName || data.username || "",
          email: data.email || "",
        };
        setAuth(nextAuth);
        saveAuth(nextAuth);
      },
      logout() {
        setAuth(emptyAuth);
        localStorage.removeItem(STORAGE_KEY);
        window.location.assign("/login");
      },
    };
  }, [auth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
