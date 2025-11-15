import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem("token");
    } catch {
      return null;
    }
  });

  const [usuario, setUsuario] = useState(() => {
    try {
      const raw = localStorage.getItem("usuario");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (token) localStorage.setItem("token", token);
      else localStorage.removeItem("token");
    } catch {}
  }, [token]);

  useEffect(() => {
    try {
      if (usuario) localStorage.setItem("usuario", JSON.stringify(usuario));
      else localStorage.removeItem("usuario");
    } catch {}
  }, [usuario]);

  const login = (newToken, newUsuario) => {
    setToken(newToken || null);
    setUsuario(newUsuario || null);
  };

  const logout = () => {
    setToken(null);
    setUsuario(null);
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
    } catch {}
  };

  const isAuthenticated = !!token;

  const hasRole = (role) => {
    if (!usuario?.roles) return false;
    return usuario.roles.includes(role);
  };

  const hasAnyRole = (roles = []) => {
    if (!usuario?.roles) return false;
    return roles.some((r) => usuario.roles.includes(r));
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        usuario,
        login,
        logout,
        isAuthenticated,
        hasRole,
        hasAnyRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
