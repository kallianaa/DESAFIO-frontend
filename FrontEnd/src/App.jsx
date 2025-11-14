/* src/App.jsx */

import { Routes, Route, Link } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DisciplinasPage from "./pages/DisciplinasPage";
import CadastroDisciplinaPage from "./pages/CadastroDisciplinaPage";

// continua usando seu CSS
import "./App.css";

export default function App() {
  return (
    <div className="container-principal">
      <header style={styles.header}>
        <h1>Sistema de Matrículas</h1>
        <nav>
          <Link to="/" style={styles.link}>
            Início
          </Link>
          <Link to="/disciplinas" style={styles.link}>
            Disciplinas
          </Link>
          <Link to="/cadastro" style={styles.link}>
            Cadastrar Disciplina
          </Link>
          <Link to="/login" style={styles.link}>
            Login
          </Link>
        </nav>
      </header>

      <main style={styles.main}>
        <Routes>
          <Route
            path="/"
            element={
              <div>
                <h2>Bem-vindo!</h2>
                <p>
                  Acesse o sistema para visualizar disciplinas, cadastrar novas
                  ofertas e realizar matrículas.
                </p>
                <Link to="/login" style={styles.button}>
                  Ir para Login
                </Link>
              </div>
            }
          />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/disciplinas" element={<DisciplinasPage />} />
          <Route path="/cadastro" element={<CadastroDisciplinaPage />} />
        </Routes>
      </main>
    </div>
  );
}

const styles = {
  header: {
    backgroundColor: "#0a625eff",
    color: "white",
    padding: "10px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  link: {
    color: "white",
    marginLeft: "15px",
    textDecoration: "none",
    fontWeight: "bold",
  },
  main: {
    padding: "2rem",
    textAlign: "center",
  },
  button: {
    display: "inline-block",
    marginTop: "15px",
    padding: "10px 20px",
    borderRadius: "6px",
    textDecoration: "none",
    backgroundColor: "#0e620aff",
    color: "white",
    fontWeight: "bold",
  },
};
