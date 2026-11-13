import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get("/auth/me").then((r) => setAdmin(r.data)).catch(() => setAdmin(null)).finally(() => setLoading(false));
  }, []);
  const login = async (email, password) => setAdmin((await api.post("/auth/login", { email, password })).data);
  const register = async (body) => setAdmin((await api.post("/auth/register", body)).data);
  const logout = async () => { await api.post("/auth/logout"); setAdmin(null); };
  return <Ctx.Provider value={{ admin, loading, login, register, logout }}>{children}</Ctx.Provider>;
}
