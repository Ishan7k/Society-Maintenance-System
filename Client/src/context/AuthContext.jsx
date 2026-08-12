import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load, check if we already have a token + user saved from a
  // previous session, so a page refresh doesn't kick the user back to login.
  useEffect(() => {
    const savedUser = localStorage.getItem("smms_user");
    const token = localStorage.getItem("smms_token");
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("smms_token", data.token);
    localStorage.setItem("smms_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("smms_token");
    localStorage.removeItem("smms_user");
    setUser(null);
  };

  // Called after actions like profile photo upload so the navbar/UI
  // reflects the change immediately without requiring a page refresh.
  const refreshUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
