import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem("token");
    } catch {
      return null;
    }
  });

  const login = (newToken) => {
    try {
      localStorage.setItem("token", newToken.token);
      localStorage.setItem("user", newToken.usuario.nome);
    } catch {}
    setToken(newToken);
  };

  const logout = () => {
    try {
      localStorage.removeItem("token");
    } catch {}
    setToken(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
