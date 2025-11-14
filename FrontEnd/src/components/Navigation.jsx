import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navigation({ styleOverrides = {} }) {
  const { isAuthenticated, logout } = useAuth();

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
    },
    logoutBtn: {
      color: "white",
      marginLeft: "15px",
      background: "transparent",
      border: "none",
      cursor: "pointer",
      fontWeight: "bold",
    },
    ...styleOverrides,
  };

  return (
    <nav style={styles.navWrap}>
      {isAuthenticated ? (
        <>
          <Link to="/" style={styles.link}>
            Início
          </Link>
          <Link to="/disciplinas" style={styles.link}>
            Disciplinas
          </Link>
          <Link to="/cadastro" style={styles.link}>
            Cadastrar Disciplina
          </Link>
          <button onClick={logout} style={styles.logoutBtn}>
            Sair
          </button>
        </>
      ) : (
        <Link to="/login" style={styles.link}>
        </Link>
      )}
    </nav>
  );
}
