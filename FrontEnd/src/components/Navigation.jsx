import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navigation({ styleOverrides = {} }) {
  const { isAuthenticated, hasAnyRole, logout } = useAuth();
  const navigate = useNavigate();

  const [hoverKey, setHoverKey] = useState(null);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const styles = {
    navWrap: {
      display: "flex",
      gap: "12px",
      alignItems: "center",
    },
    link: {
      color: "white",
      marginLeft: "8px",
      textDecoration: "none",
      fontWeight: "bold",
      background: "transparent",
      border: "none",
      cursor: "pointer",
      transition: "all 0.25s ease-in-out",
      paddingBottom: "3px", 
      fontSize: "16px",
      borderBottom: "2px solid transparent", 
    },
    linkHover: {
      color: "white",
      borderBottom: "2px solid white", 
    },
    logoutBtn: {
      color: "white",
      marginLeft: "8px",
      background: "transparent",
      border: "none",
      cursor: "pointer",
      fontWeight: "bold",
      transition: "all 0.25s ease-in-out",
      paddingBottom: "3px",
      fontSize: "16px",
      borderBottom: "2px solid transparent",
    },
    logoutBtnHover: {
      color: "white",
      borderBottom: "2px solid white",
    },
    ...styleOverrides,
  };

  const applyHover = (key, base, hover) =>
    hoverKey === key ? { ...base, ...hover } : base;

  return (
    <nav style={styles.navWrap}>
      {isAuthenticated ? (
        <>
          <Link
            to="/disciplinas"
            style={applyHover("disciplinas", styles.link, styles.linkHover)}
            onMouseEnter={() => setHoverKey("disciplinas")}
            onMouseLeave={() => setHoverKey(null)}
          >
            Disciplinas
          </Link>

          {hasAnyRole(["ADMIN", "PROFESSOR"]) && (
            <Link
              to="/cadastro"
              style={applyHover("cadastro", styles.link, styles.linkHover)}
              onMouseEnter={() => setHoverKey("cadastro")}
              onMouseLeave={() => setHoverKey(null)}
            >
              Cadastrar Disciplina
            </Link>
          )}

          <button
            onClick={handleLogout}
            style={applyHover("sair", styles.logoutBtn, styles.logoutBtnHover)}
            onMouseEnter={() => setHoverKey("sair")}
            onMouseLeave={() => setHoverKey(null)}
          >
            Sair
          </button>
        </>
      ) : (
        <Link
          to="/login"
          style={applyHover("login", styles.link, styles.linkHover)}
          onMouseEnter={() => setHoverKey("login")}
          onMouseLeave={() => setHoverKey(null)}
        >
          Login
        </Link>
      )}
    </nav>
  );
}
