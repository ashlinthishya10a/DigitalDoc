import { createContext, useContext, useEffect, useState } from "react";
import client from "../api/client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("student_token");
    if (!token) {
      setLoading(false);
      return;
    }

    client
      .get("/auth/me")
      .then(({ data }) => setUser(data.user))
      .finally(() => setLoading(false));
  }, []);

  const persist = ({ token, user: nextUser }) => {
    localStorage.setItem("student_token", token);
    setUser(nextUser);
  };

  const login = async (payload) => {
    const { data } = await client.post("/auth/login", { role: "student", ...payload });
    persist(data);
  };

  const signup = async (payload) => {
    const { data } = await client.post("/auth/signup", { role: "student", ...payload });
    persist(data);
  };

  const logout = () => {
    localStorage.removeItem("student_token");
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, signup, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
